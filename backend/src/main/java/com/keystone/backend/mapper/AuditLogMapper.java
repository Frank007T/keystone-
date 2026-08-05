package com.keystone.backend.mapper;

import com.keystone.backend.dto.AuditLogDTO;
import com.keystone.backend.entity.AuditLogEntity;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogDTO toDto(AuditLogEntity entity) {
        return new AuditLogDTO(
                entity.getId(),
                entity.getAction(),
                entity.getModule(),
                entity.getEntityType(),
                entity.getEntityId(),
                entity.getDescription(),
                entity.getPerformedByUserId(),
                entity.getPerformedByName(),
                entity.getPerformedByEmail(),
                entity.getRole(),
                entity.getIpAddress(),
                entity.getBrowser(),
                entity.getOperatingSystem(),
                entity.getEndpoint(),
                entity.getHttpMethod(),
                entity.getRequestBody(),
                entity.getResponseStatus(),
                entity.getStatus() != null ? entity.getStatus().name() : null,
                entity.getCreatedAt()
        );
    }
}
