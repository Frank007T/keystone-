package com.keystone.backend.controller;

import com.keystone.backend.annotation.AuditLog;
import com.keystone.backend.entity.Role;
import com.keystone.backend.entity.UserEntity;
import com.keystone.backend.repository.UserRepository;
import com.keystone.backend.service.EmailService;
import com.keystone.backend.service.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository,
                          EmailService emailService,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // ==========================================
    // 1. CUSTOMER SELF-SIGNUP & OTP VERIFICATION
    // ==========================================

    @PostMapping("/signup")
    @AuditLog(action = "CREATE_USER", module = "AUTH", description = "Customer signed up", entityType = "USER")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered.");
        }

        if (!"CUSTOMER".equalsIgnoreCase(request.role())) {
            return ResponseEntity.badRequest().body("Only Customer self-registration is allowed.");
        }

        UserEntity user = new UserEntity();
        user.setFullName(request.fullName());
        user.setCompanyName(request.companyName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setRole(Role.CUSTOMER);
        user.setEnabled(false);
        user.setOtpVerified(false);

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(Instant.now().plusSeconds(900)); // 15 mins

        userRepository.save(user);

        emailService.sendEmail(
            user.getEmail(),
            "KEYSTONE - Verify Your Email",
            "Welcome to KEYSTONE! Your verification OTP code is: " + otp + "\n\nThis code expires in 15 minutes."
        );

        return ResponseEntity.ok("Signup successful. Please check your email for the verification OTP.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody OtpRequest request) {
        Optional<UserEntity> optionalUser = userRepository.findByEmail(request.email());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid email or OTP.");
        }

        UserEntity user = optionalUser.get();
        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.otp())) {
            return ResponseEntity.badRequest().body("Invalid OTP.");
        }
        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body("OTP has expired.");
        }

        user.setOtpVerified(true);
        user.setEnabled(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return ResponseEntity.ok("Email verified successfully. You can now log in.");
    }

    // ==========================================
    // 2. AUTHENTICATION / LOGIN METHODS
    // ==========================================

    /**
     * Password-based Login (All Roles)
     */
    @PostMapping("/login")
    @AuditLog(action = "LOGIN", module = "AUTH", description = "User logged in", entityType = "USER")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Optional<UserEntity> optionalUser = userRepository.findByEmail(request.email());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid credentials.");
        }

        UserEntity user = optionalUser.get();
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials.");
        }
        if (!user.isEnabled()) {
            return ResponseEntity.status(403).body("Account is disabled or pending verification.");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponse(token, user.getEmail(), user.getRole().name()));
    }

    /**
     * Request OTP for direct OTP Login (Passwordless)
     */
    @PostMapping("/login-otp/request")
    public ResponseEntity<?> requestLoginOtp(@Valid @RequestBody RequestOtpRequest request) {
        Optional<UserEntity> optionalUser = userRepository.findByEmail(request.email());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        UserEntity user = optionalUser.get();
        if (!user.isEnabled()) {
            return ResponseEntity.status(403).body("Account is disabled.");
        }

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(Instant.now().plusSeconds(300)); // 5 mins
        userRepository.save(user);

        emailService.sendEmail(
            user.getEmail(),
            "KEYSTONE - Login OTP",
            "Your login OTP code is: " + otp + "\n\nValid for 5 minutes."
        );

        return ResponseEntity.ok("Login OTP sent to your email.");
    }

    /**
     * Login via OTP (Passwordless)
     */
    @PostMapping("/login-otp/verify")
    public ResponseEntity<?> loginWithOtp(@Valid @RequestBody OtpRequest request) {
        Optional<UserEntity> optionalUser = userRepository.findByEmail(request.email());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid request.");
        }

        UserEntity user = optionalUser.get();
        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.otp())) {
            return ResponseEntity.badRequest().body("Invalid OTP.");
        }
        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body("OTP expired.");
        }

        // Clear OTP
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponse(token, user.getEmail(), user.getRole().name()));
    }

    /**
     * Google OAuth2 Login / Registration for Customers
     */
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        // Verification of Google Id Token should be performed here using GoogleIdTokenVerifier
        Optional<UserEntity> optionalUser = userRepository.findByEmail(request.email());

        UserEntity user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            // Auto-provision Customer profile on Google Sign-In
            user = new UserEntity();
            user.setFullName(request.fullName());
            user.setEmail(request.email());
            user.setRole(Role.CUSTOMER);
            user.setEnabled(true);
            user.setOtpVerified(true);
            user.setPassword(passwordEncoder.encode(generateRandomPassword(16))); // Random unusable password
            userRepository.save(user);
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new LoginResponse(token, user.getEmail(), user.getRole().name()));
    }

    // ==========================================
    // 3. FORGOT & RESET PASSWORD
    // ==========================================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        Optional<UserEntity> optionalUser = userRepository.findByEmail(request.email());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Email not found.");
        }

        UserEntity user = optionalUser.get();
        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(Instant.now().plusSeconds(900));
        userRepository.save(user);

        emailService.sendEmail(
            user.getEmail(),
            "KEYSTONE - Password Reset Request",
            "Your password reset OTP code is: " + otp
        );

        return ResponseEntity.ok("Password reset OTP sent to email.");
    }

    @PostMapping("/reset-password")
    @AuditLog(action = "CHANGE_PASSWORD", module = "AUTH", description = "Password reset", entityType = "USER")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Optional<UserEntity> optionalUser = userRepository.findByEmail(request.email());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Email not found.");
        }

        UserEntity user = optionalUser.get();
        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.otp())) {
            return ResponseEntity.badRequest().body("Invalid OTP.");
        }
        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(Instant.now())) {
            return ResponseEntity.badRequest().body("OTP expired.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully.");
    }

    // ==========================================
    // HELPER METHODS & DTOs
    // ==========================================

    private String generateOtp() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public record SignupRequest(
        @NotBlank String fullName,
        @NotBlank String companyName,
        @Email String email,
        @NotBlank String phone,
        @NotBlank String password,
        @NotBlank String role
    ) {}

    public record RequestOtpRequest(@Email String email) {}

    public record OtpRequest(@Email String email, @NotBlank String otp) {}

    public record LoginRequest(@Email String email, @NotBlank String password) {}

    public record GoogleLoginRequest(@Email String email, @NotBlank String fullName, String googleToken) {}

    public record LoginResponse(String token, String email, String role) {}

    public record ForgotPasswordRequest(@Email String email) {}

    public record ResetPasswordRequest(@Email String email, @NotBlank String otp, @NotBlank String newPassword) {}
}