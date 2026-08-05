package com.keystone.backend.controller;

import com.keystone.backend.entity.Role;
import com.keystone.backend.entity.UserEntity;
import com.keystone.backend.repository.UserRepository;
import com.keystone.backend.service.UserManagementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class UserManagementController {
    private final UserManagementService userManagementService;
    private final UserRepository userRepository;

    public UserManagementController(UserManagementService userManagementService, UserRepository userRepository) {
        this.userManagementService = userManagementService;
        this.userRepository = userRepository;
    }

    // ==================== MANAGER MANAGEMENT (SUPER_ADMIN ONLY) ====================

    @PostMapping("/managers")
    public ResponseEntity<?> createManager(@Valid @RequestBody CreateManagerRequest request) {
        requireSuperAdmin();
        
        try {
            UserEntity manager = userManagementService.createManager(
                request.fullName(),
                request.email(),
                request.phone(),
                request.zoneId()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(toManagerDto(manager));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/managers")
    public ResponseEntity<List<ManagerDto>> listManagers() {
        requireSuperAdmin();
        
        List<UserEntity> managers = userRepository.findByRole(Role.MANAGER);
        List<ManagerDto> dtos = managers.stream()
            .map(this::toManagerDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/managers/{id}")
    public ResponseEntity<?> editManager(@PathVariable Long id, @Valid @RequestBody EditManagerRequest request) {
        requireSuperAdmin();
        
        UserEntity manager = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found."));

        if (manager.getRole() != Role.MANAGER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a manager.");
        }

        manager.setFullName(request.fullName());
        manager.setPhone(request.phone());
        if (request.zoneId() != null) {
            manager.setZoneId(request.zoneId());
        }

        UserEntity updated = userRepository.save(manager);
        return ResponseEntity.ok(toManagerDto(updated));
    }

    @DeleteMapping("/managers/{id}")
    public ResponseEntity<?> deleteManager(@PathVariable Long id) {
        requireSuperAdmin();
        
        UserEntity manager = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found."));

        if (manager.getRole() != Role.MANAGER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a manager.");
        }

        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/managers/{id}/reset-password")
    public ResponseEntity<?> resetManagerPassword(@PathVariable Long id) {
        requireSuperAdmin();
        
        UserEntity manager = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manager not found."));

        if (manager.getRole() != Role.MANAGER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a manager.");
        }

        userManagementService.resetPassword(id);
        return ResponseEntity.ok("Password reset. New temporary password sent to email.");
    }

    // ==================== DISPATCHER MANAGEMENT (MANAGER ONLY) ====================

    @PostMapping("/dispatchers")
    public ResponseEntity<?> createDispatcher(@Valid @RequestBody CreateDispatcherRequest request) {
        requireManager();
        Long managerId = getCurrentUserId();
        
        try {
            UserEntity dispatcher = userManagementService.createDispatcher(
                request.fullName(),
                request.email(),
                request.phone(),
                managerId,
                request.zoneId()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(toDispatcherDto(dispatcher));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/dispatchers")
    public ResponseEntity<List<DispatcherDto>> listDispatchers() {
        requireManager();
        Long managerId = getCurrentUserId();
        
        List<UserEntity> dispatchers = userRepository.findByRoleAndManagerId(Role.DISPATCHER, managerId);
        List<DispatcherDto> dtos = dispatchers.stream()
            .map(this::toDispatcherDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/dispatchers/{id}")
    public ResponseEntity<?> editDispatcher(@PathVariable Long id, @Valid @RequestBody EditDispatcherRequest request) {
        requireManager();
        Long managerId = getCurrentUserId();
        
        UserEntity dispatcher = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dispatcher not found."));

        if (dispatcher.getRole() != Role.DISPATCHER || !dispatcher.getManagerId().equals(managerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        dispatcher.setFullName(request.fullName());
        dispatcher.setPhone(request.phone());
        if (request.zoneId() != null) {
            dispatcher.setZoneId(request.zoneId());
        }

        UserEntity updated = userRepository.save(dispatcher);
        return ResponseEntity.ok(toDispatcherDto(updated));
    }

    @DeleteMapping("/dispatchers/{id}")
    public ResponseEntity<?> deleteDispatcher(@PathVariable Long id) {
        requireManager();
        Long managerId = getCurrentUserId();
        
        UserEntity dispatcher = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dispatcher not found."));

        if (dispatcher.getRole() != Role.DISPATCHER || !dispatcher.getManagerId().equals(managerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/dispatchers/{id}/reset-password")
    public ResponseEntity<?> resetDispatcherPassword(@PathVariable Long id) {
        requireManager();
        Long managerId = getCurrentUserId();
        
        UserEntity dispatcher = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dispatcher not found."));

        if (dispatcher.getRole() != Role.DISPATCHER || !dispatcher.getManagerId().equals(managerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        userManagementService.resetPassword(id);
        return ResponseEntity.ok("Password reset. New temporary password sent to email.");
    }

    // ==================== TECHNICIAN MANAGEMENT (MANAGER ONLY) ====================

   @PostMapping("/technicians")
public ResponseEntity<?> createTechnician(
        @Valid @RequestBody CreateTechnicianRequest request) {

    requireManager();

    UserEntity manager = userRepository.findById(getCurrentUserId())
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Manager not found"));

    UserEntity dispatcher = userRepository.findById(request.dispatcherId())
            .orElseThrow(() -> new IllegalArgumentException("Dispatcher not found."));

    // Dispatcher must belong to the same zone
    if (dispatcher.getRole() != Role.DISPATCHER ||
        !dispatcher.getZoneId().equals(manager.getZoneId())) {
        throw new IllegalArgumentException(
                "Dispatcher does not belong to your zone.");
    }

    UserEntity technician = userManagementService.createTechnician(
            request.fullName(),
            request.email(),
            request.phone(),
            manager.getId(),
            dispatcher.getId(),
            manager.getZoneId()
    );

    return ResponseEntity.status(HttpStatus.CREATED)
            .body(toTechnicianDto(technician));
}
    @GetMapping("/technicians")
    public ResponseEntity<List<TechnicianDto>> listTechnicians() {
        requireManager();
        Long managerId = getCurrentUserId();
        
        List<UserEntity> technicians = userRepository.findByRoleAndManagerId(Role.TECHNICIAN, managerId);
        List<TechnicianDto> dtos = technicians.stream()
            .map(this::toTechnicianDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/technicians/{id}")
    public ResponseEntity<?> editTechnician(@PathVariable Long id, @Valid @RequestBody EditTechnicianRequest request) {
        requireManager();
        Long managerId = getCurrentUserId();
        
        UserEntity technician = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Technician not found."));

        if (technician.getRole() != Role.TECHNICIAN || !technician.getManagerId().equals(managerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        technician.setFullName(request.fullName());
        technician.setPhone(request.phone());
        if (request.dispatcherId() != null) {
            technician.setDispatcherId(request.dispatcherId());
        }
        if (request.zoneId() != null) {
            technician.setZoneId(request.zoneId());
        }

        UserEntity updated = userRepository.save(technician);
        return ResponseEntity.ok(toTechnicianDto(updated));
    }

    @DeleteMapping("/technicians/{id}")
    public ResponseEntity<?> deleteTechnician(@PathVariable Long id) {
        requireManager();
        Long managerId = getCurrentUserId();
        
        UserEntity technician = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Technician not found."));

        if (technician.getRole() != Role.TECHNICIAN || !technician.getManagerId().equals(managerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        userManagementService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/technicians/{id}/reset-password")
    public ResponseEntity<?> resetTechnicianPassword(@PathVariable Long id) {
        requireManager();
        Long managerId = getCurrentUserId();
        
        UserEntity technician = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Technician not found."));

        if (technician.getRole() != Role.TECHNICIAN || !technician.getManagerId().equals(managerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        userManagementService.resetPassword(id);
        return ResponseEntity.ok("Password reset. New temporary password sent to email.");
    }

    // ==================== HELPER METHODS ====================

    private void requireSuperAdmin() {
        Role role = getCurrentRole();
        if (role != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Super Admin can perform this action.");
        }
    }

    private void requireManager() {
        Role role = getCurrentRole();
        if (role != Role.MANAGER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Managers can perform this action.");
        }
    }

    private Role getCurrentRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized.");
        }
        return authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(auth -> auth.toUpperCase().startsWith("ROLE_") ? auth.substring(5) : auth)
            .map(String::toUpperCase)
            .map(auth -> {
                try {
                    return Role.valueOf(auth);
                } catch (IllegalArgumentException e) {
                    return null;
                }
            })
            .filter(java.util.Objects::nonNull)
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Role missing or invalid."));
    }

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        return user.getId();
    }

    // ==================== DTO CONVERTERS ====================

    private ManagerDto toManagerDto(UserEntity user) {
        return new ManagerDto(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getZoneId(),
            user.isEnabled(),
            user.getCreatedAt().toString()
        );
    }

    private DispatcherDto toDispatcherDto(UserEntity user) {
        return new DispatcherDto(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getManagerId(),
            user.getZoneId(),
            user.isEnabled(),
            user.getCreatedAt().toString()
        );
    }

    private TechnicianDto toTechnicianDto(UserEntity user) {
        return new TechnicianDto(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getManagerId(),
            user.getDispatcherId(),
            user.getZoneId(),
            user.isEnabled(),
            user.getCreatedAt().toString()
        );
    }

    // ==================== REQUEST/RESPONSE RECORDS ====================

    public record CreateManagerRequest(
            @NotBlank String fullName,
            @Email String email,
            @NotBlank String phone,
            Long zoneId
    ) {}

    public record EditManagerRequest(
            @NotBlank String fullName,
            @NotBlank String phone,
            Long zoneId
    ) {}

    public record CreateDispatcherRequest(
            @NotBlank String fullName,
            @Email String email,
            @NotBlank String phone,
            Long zoneId
    ) {}

    public record EditDispatcherRequest(
            @NotBlank String fullName,
            @NotBlank String phone,
            Long zoneId
    ) {}

    public record CreateTechnicianRequest(
            @NotBlank String fullName,
            @Email String email,
            @NotBlank String phone,
            Long dispatcherId,
            Long zoneId
    ) {}

    public record EditTechnicianRequest(
            @NotBlank String fullName,
            @NotBlank String phone,
            Long dispatcherId,
            Long zoneId
    ) {}

    public record ManagerDto(Long id, String fullName, String email, String phone, Long zoneId, boolean enabled, String createdAt) {}
    public record DispatcherDto(Long id, String fullName, String email, String phone, Long managerId, Long zoneId, boolean enabled, String createdAt) {}
    public record TechnicianDto(Long id, String fullName, String email, String phone, Long managerId, Long dispatcherId, Long zoneId, boolean enabled, String createdAt) {}
}
