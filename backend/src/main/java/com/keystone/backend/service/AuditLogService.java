package com.keystone.backend.service;

import com.keystone.backend.dto.AuditLogDTO;
import com.keystone.backend.dto.AuditLogFilterRequest;
import com.keystone.backend.dto.AuditLogResponse;
import com.keystone.backend.dto.AuditLogStatisticsDTO;
import com.keystone.backend.entity.AuditLogEntity;
import com.keystone.backend.entity.AuditStatus;
import com.keystone.backend.mapper.AuditLogMapper;
import com.keystone.backend.repository.AuditLogRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    public AuditLogService(AuditLogRepository auditLogRepository, AuditLogMapper auditLogMapper) {
        this.auditLogRepository = auditLogRepository;
        this.auditLogMapper = auditLogMapper;
    }

    @Transactional
    public AuditLogDTO saveLog(String action, String module, String description, String entityType, String entityId,
                                Long performedByUserId, String performedByName, String performedByEmail, String role,
                                String ipAddress, String browser, String operatingSystem, String endpoint,
                                String httpMethod, String requestBody, Integer responseStatus) {
        AuditLogEntity entity = new AuditLogEntity();
        entity.setAction(action);
        entity.setModule(module);
        entity.setDescription(description);
        entity.setEntityType(entityType);
        entity.setEntityId(entityId);
        entity.setPerformedByUserId(performedByUserId);
        entity.setPerformedByName(performedByName);
        entity.setPerformedByEmail(performedByEmail);
        entity.setRole(role);
        entity.setIpAddress(ipAddress);
        entity.setBrowser(browser);
        entity.setOperatingSystem(operatingSystem);
        entity.setEndpoint(endpoint);
        entity.setHttpMethod(httpMethod);
        entity.setRequestBody(requestBody);
        entity.setResponseStatus(responseStatus);
        entity.setStatus(mapToAuditStatus(responseStatus));

        AuditLogEntity saved = auditLogRepository.save(entity);
        return auditLogMapper.toDto(saved);
    }

    public AuditLogResponse getLogs(AuditLogFilterRequest filter) {
        int page = Optional.ofNullable(filter.page()).orElse(1) - 1;
        int size = Optional.ofNullable(filter.size()).orElse(20);
        page = Math.max(page, 0);
        size = Math.min(Math.max(size, 1), 100);

        Specification<AuditLogEntity> spec = buildSpecification(filter);
        Sort sort = Sort.by(Sort.Direction.fromString(Optional.ofNullable(filter.sortDirection()).orElse("DESC")),
                Optional.ofNullable(filter.sortBy()).filter(s -> !s.isBlank()).orElse("createdAt"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<AuditLogEntity> result = auditLogRepository.findAll(spec, pageable);
        return new AuditLogResponse(
                result.getContent().stream().map(auditLogMapper::toDto).toList(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.getNumber() + 1,
                result.getSize()
        );
    }

    public AuditLogStatisticsDTO getStatistics() {
        List<AuditLogEntity> all = auditLogRepository.findAll();
        Instant now = Instant.now();
        Instant weekAgo = now.minusSeconds(7L * 24 * 60 * 60);
        Instant dayAgo = now.minusSeconds(24 * 60 * 60);

        long total = all.size();
        long today = all.stream().filter(log -> log.getCreatedAt() != null && !log.getCreatedAt().isBefore(dayAgo)).count();
        long weekly = all.stream().filter(log -> log.getCreatedAt() != null && !log.getCreatedAt().isBefore(weekAgo)).count();

        long loginCount = all.stream().filter(log -> "LOGIN".equalsIgnoreCase(log.getAction())).count();
        long userCreationCount = all.stream().filter(log -> log.getAction() != null && log.getAction().toUpperCase().contains("USER")).count();
        long orderCount = all.stream().filter(log -> log.getModule() != null && log.getModule().equalsIgnoreCase("ORDER")).count();
        long settingsChangeCount = all.stream().filter(log -> log.getModule() != null && log.getModule().equalsIgnoreCase("SETTINGS")).count();

        return new AuditLogStatisticsDTO(total, today, weekly, total, loginCount, userCreationCount, orderCount, settingsChangeCount);
    }

    public AuditLogResponse searchLogs(AuditLogFilterRequest filter) {
        return getLogs(filter);
    }

    @Transactional
    public void deleteOldLogs(int retentionDays) {
        Instant cutoff = Instant.now().minusSeconds(retentionDays * 24L * 60 * 60);
        List<AuditLogEntity> oldLogs = auditLogRepository.findAll().stream()
                .filter(log -> log.getCreatedAt() != null && log.getCreatedAt().isBefore(cutoff))
                .toList();
        auditLogRepository.deleteAll(oldLogs);
    }

    public Optional<AuditLogDTO> getLogById(Long id) {
        return auditLogRepository.findById(id).map(auditLogMapper::toDto);
    }

    public void deleteLog(Long id) {
        auditLogRepository.deleteById(id);
    }

    private Specification<AuditLogEntity> buildSpecification(AuditLogFilterRequest filter) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filter != null) {
                if (filter.query() != null && !filter.query().isBlank()) {
                    String likeQuery = "%" + filter.query().toLowerCase() + "%";
                    Predicate actionLike = builder.like(builder.lower(root.get("action")), likeQuery);
                    Predicate descriptionLike = builder.like(builder.lower(root.get("description")), likeQuery);
                    Predicate moduleLike = builder.like(builder.lower(root.get("module")), likeQuery);
                    Predicate userLike = builder.like(builder.lower(root.get("performedByEmail")), likeQuery);
                    predicates.add(builder.or(actionLike, descriptionLike, moduleLike, userLike));
                }

                if (filter.action() != null && !filter.action().isBlank()) {
                    predicates.add(builder.equal(root.get("action"), filter.action()));
                }
                if (filter.module() != null && !filter.module().isBlank()) {
                    predicates.add(builder.equal(root.get("module"), filter.module()));
                }
                if (filter.user() != null && !filter.user().isBlank()) {
                    String like = "%" + filter.user().toLowerCase() + "%";
                    predicates.add(builder.or(
                            builder.like(builder.lower(root.get("performedByName")), like),
                            builder.like(builder.lower(root.get("performedByEmail")), like)
                    ));
                }
                if (filter.role() != null && !filter.role().isBlank()) {
                    predicates.add(builder.equal(root.get("role"), filter.role()));
                }
                if (filter.responseStatus() != null) {
                    predicates.add(builder.equal(root.get("responseStatus"), filter.responseStatus()));
                }
                if (filter.status() != null && !filter.status().isBlank()) {
                    predicates.add(builder.equal(root.get("status"), filter.status().toUpperCase()));
                }
                if (filter.startDate() != null && !filter.startDate().isBlank()) {
                    Instant start = parseDate(filter.startDate());
                    predicates.add(builder.greaterThanOrEqualTo(root.get("createdAt"), start));
                }
                if (filter.endDate() != null && !filter.endDate().isBlank()) {
                    Instant end = parseDate(filter.endDate()).plusSeconds(24 * 60 * 60);
                    predicates.add(builder.lessThanOrEqualTo(root.get("createdAt"), end));
                }
            }
            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Instant parseDate(String value) {
        try {
            LocalDate date = LocalDate.parse(value, DateTimeFormatter.ISO_DATE);
            return date.atStartOfDay(ZoneOffset.UTC).toInstant();
        } catch (Exception ex) {
            return Instant.parse(value);
        }
    }

    private AuditStatus mapToAuditStatus(Integer responseStatus) {
        if (responseStatus == null) {
            return AuditStatus.PENDING;
        }

        return switch (responseStatus) {
            case 200, 204 -> AuditStatus.COMPLETED;
            case 201 -> AuditStatus.SUCCESS;
            case 202 -> AuditStatus.PROCESSING;
            case 400, 401, 403, 404, 500, 502, 503 -> AuditStatus.FAILED;
            case 409, 422 -> AuditStatus.WARNING;
            default -> AuditStatus.PENDING;
        };
    }

}
