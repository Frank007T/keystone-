package com.keystone.backend.service;

import com.keystone.backend.annotation.AuditLog;
import com.keystone.backend.entity.UserEntity;
import com.keystone.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.Optional;

@Aspect
@Component
public class AuditLogAspect {

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public AuditLogAspect(AuditLogService auditLogService, UserRepository userRepository) {
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
    }

    @AfterReturning(pointcut = "@annotation(auditLog)", returning = "result")
    public void afterReturning(JoinPoint joinPoint, AuditLog auditLog, Object result) {
        try {
            HttpServletRequest request = getRequest();
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication != null ? authentication.getName() : null;
            UserEntity user = email != null ? userRepository.findByEmail(email).orElse(null) : null;

            String description = auditLog.description().isBlank() ? auditLog.action() + " completed successfully." : auditLog.description();
            String entityType = auditLog.entityType().isBlank() ? extractEntityType(joinPoint.getArgs()) : auditLog.entityType();

            auditLogService.saveLog(
                    auditLog.action(),
                    auditLog.module(),
                    description,
                    entityType,
                    extractEntityId(joinPoint.getArgs()),
                    user != null ? user.getId() : null,
                    user != null ? user.getFullName() : null,
                    user != null ? user.getEmail() : email,
                    user != null && user.getRole() != null ? user.getRole().name() : null,
                    request != null ? request.getRemoteAddr() : null,
                    request != null ? request.getHeader("User-Agent") : null,
                    null,
                    request != null ? request.getRequestURI() : null,
                    request != null ? request.getMethod() : null,
                    null,
                    200
            );
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private HttpServletRequest getRequest() {
        try {
            return ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        } catch (Exception ex) {
            return null;
        }
    }

    private String extractEntityType(Object[] args) {
        return Arrays.stream(args)
                .filter(arg -> arg != null)
                .findFirst()
                .map(Object::getClass)
                .map(Class::getSimpleName)
                .orElse("UNKNOWN");
    }

    private String extractEntityId(Object[] args) {
        return Arrays.stream(args)
                .filter(arg -> arg instanceof Long)
                .map(String::valueOf)
                .findFirst()
                .orElse(null);
    }
}
