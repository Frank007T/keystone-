package com.keystone.backend.service;

import com.keystone.backend.entity.Role;
import com.keystone.backend.entity.UserEntity;
import com.keystone.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Optional;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final String TEMP_PASSWORD_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    private static final int TEMP_PASSWORD_LENGTH = 12;

    public UserManagementService(UserRepository userRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create a new manager (Super Admin only)
     */
    public UserEntity createManager(String fullName, String email, String phone, Long zoneId) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists.");
        }

        String tempPassword = generateTemporaryPassword();
        UserEntity manager = new UserEntity();
        manager.setFullName(fullName);
        manager.setCompanyName("KEYSTONE");
        manager.setEmail(email);
        manager.setPassword(passwordEncoder.encode(tempPassword));
        manager.setPhone(phone);
        manager.setRole(Role.MANAGER);
        manager.setZoneId(zoneId);
        manager.setEnabled(true);
        manager.setOtpVerified(true);
        manager.setCreatedAt(Instant.now());

        UserEntity savedManager = userRepository.save(manager);

        // Send email with credentials
        sendAccountCreationEmail(
            email,
            "Manager Account Created",
            manager.getFullName(),
            email,
            tempPassword
        );

        return savedManager;
    }

    /**
     * Create a new dispatcher (Manager only)
     */
    public UserEntity createDispatcher(String fullName, String email, String phone, Long managerId, Long zoneId) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists.");
        }

        Optional<UserEntity> managerOpt = userRepository.findById(managerId);
        if (managerOpt.isEmpty() || managerOpt.get().getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("Invalid manager ID.");
        }

        String tempPassword = generateTemporaryPassword();
        UserEntity dispatcher = new UserEntity();
        dispatcher.setFullName(fullName);
        dispatcher.setCompanyName("KEYSTONE");
        dispatcher.setEmail(email);
        dispatcher.setPassword(passwordEncoder.encode(tempPassword));
        dispatcher.setPhone(phone);
        dispatcher.setRole(Role.DISPATCHER);
        dispatcher.setManagerId(managerId);
        dispatcher.setZoneId(zoneId);
        dispatcher.setEnabled(true);
        dispatcher.setOtpVerified(true);
        dispatcher.setCreatedAt(Instant.now());

        UserEntity savedDispatcher = userRepository.save(dispatcher);

        // Send email with credentials
        sendAccountCreationEmail(
            email,
            "Dispatcher Account Created",
            dispatcher.getFullName(),
            email,
            tempPassword
        );

        return savedDispatcher;
    }

    /**
     * Create a new technician (Manager only)
     */
    public UserEntity createTechnician(String fullName, String email, String phone, Long managerId, Long dispatcherId, Long zoneId) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists.");
        }

        Optional<UserEntity> managerOpt = userRepository.findById(managerId);
        if (managerOpt.isEmpty() || managerOpt.get().getRole() != Role.MANAGER) {
            throw new IllegalArgumentException("Invalid manager ID.");
        }

        Optional<UserEntity> dispatcherOpt = userRepository.findById(dispatcherId);
        if (dispatcherOpt.isEmpty() || dispatcherOpt.get().getRole() != Role.DISPATCHER) {
            throw new IllegalArgumentException("Invalid dispatcher ID.");
        }

        String tempPassword = generateTemporaryPassword();
        UserEntity technician = new UserEntity();
        technician.setFullName(fullName);
        technician.setCompanyName("KEYSTONE");
        technician.setEmail(email);
        technician.setPassword(passwordEncoder.encode(tempPassword));
        technician.setPhone(phone);
        technician.setRole(Role.TECHNICIAN);
        technician.setManagerId(managerId);
        technician.setDispatcherId(dispatcherId);
        technician.setZoneId(zoneId);
        technician.setEnabled(true);
        technician.setOtpVerified(true);
        technician.setCreatedAt(Instant.now());

        UserEntity savedTechnician = userRepository.save(technician);

        // Send email with credentials
        sendAccountCreationEmail(
            email,
            "Technician Account Created",
            technician.getFullName(),
            email,
            tempPassword
        );

        return savedTechnician;
    }

    /**
     * Reset password for a user
     */
    public void resetPassword(Long userId) {
        UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));

        String tempPassword = generateTemporaryPassword();
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        // Send email with new temporary password
        emailService.sendEmail(
            user.getEmail(),
            "KEYSTONE Password Reset",
            "Your password has been reset.\n\n" +
            "Temporary Password: " + tempPassword + "\n\n" +
            "Please log in and change your password immediately.\n\n" +
            "Login URL: http://localhost:5173/login"
        );
    }

    /**
     * Disable a user (soft delete)
     */
    public void disableUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setEnabled(false);
        userRepository.save(user);

        // Send notification email
        emailService.sendEmail(
            user.getEmail(),
            "KEYSTONE Account Disabled",
            "Your account has been disabled. Please contact your administrator for assistance."
        );
    }

    /**
     * Enable a user
     */
    public void enableUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setEnabled(true);
        userRepository.save(user);
    }

    /**
     * Delete a user permanently
     */
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    /**
     * Generate a temporary password
     */
    public String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(TEMP_PASSWORD_LENGTH);
        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            password.append(TEMP_PASSWORD_CHARSET.charAt(random.nextInt(TEMP_PASSWORD_CHARSET.length())));
        }
        return password.toString();
    }

    /**
     * Send account creation email
     */
    private void sendAccountCreationEmail(String recipientEmail, String subject, String fullName, String email, String tempPassword) {
        String body = "Dear " + fullName + ",\n\n" +
            "Your account has been created in the KEYSTONE Field Service Management system.\n\n" +
            "Login Credentials:\n" +
            "Email: " + email + "\n" +
            "Temporary Password: " + tempPassword + "\n\n" +
            "Login URL: http://localhost:5173/login\n\n" +
            "Please log in and change your password immediately for security.\n\n" +
            "Best regards,\n" +
            "KEYSTONE Team";

        emailService.sendEmail(recipientEmail, subject, body);
    }
}