package com.keystone.backend.config;

import com.keystone.backend.service.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService) {
        return new JwtAuthenticationFilter(jwtService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // 1. Explicitly allow all OPTIONS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. PUBLIC ENDPOINTS
                        .requestMatchers(
                                "/api/auth/**",
                                "/error"
                        ).permitAll()

                        // 3. COMMON AUTHENTICATED ROUTES
                        .requestMatchers(
                                "/api/data/work-orders",
                                "/api/data/work-orders/**",
                                "/api/data/notifications",
                                "/api/data/notifications/**",
                                "/api/data/requests/**",
                                "/api/data/parts/**",
                                "/api/parts/**",
                                "/api/data/sites/**",
                                "/api/data/me"
                        ).authenticated()

                        // 4. SUPER ADMIN
                        .requestMatchers(
                                "/api/admin/managers/**",
                                "/api/admin/dashboard",
                                "/api/admin/users",
                                "/api/admin/requests/**",
                                "/api/admin/audit-logs/**",
                                "/api/admin/reports/**"
                        ).hasAnyAuthority("SUPER_ADMIN", "ROLE_SUPER_ADMIN", "ADMIN", "ROLE_ADMIN")

                        // 5. MANAGER & SUPER ADMIN ACCESS
                        .requestMatchers(
                                "/api/admin/technicians/**",
                                "/api/admin/dispatchers/**",
                                "/api/data/manager/**"
                        ).hasAnyAuthority("MANAGER", "ROLE_MANAGER", "SUPER_ADMIN", "ROLE_SUPER_ADMIN")

                        // 6. DISPATCHER ACCESS
                        .requestMatchers(
                                "/api/data/dispatcher/**"
                        ).hasAnyAuthority("DISPATCHER", "ROLE_DISPATCHER", "MANAGER", "ROLE_MANAGER", "SUPER_ADMIN", "ROLE_SUPER_ADMIN")

                        // 7. TECHNICIAN ACCESS
                        .requestMatchers(
                                "/api/data/technician/**"
                        ).hasAnyAuthority("TECHNICIAN", "ROLE_TECHNICIAN", "DISPATCHER", "ROLE_DISPATCHER", "MANAGER", "ROLE_MANAGER", "SUPER_ADMIN", "ROLE_SUPER_ADMIN")

                        // 8. CUSTOMER ACCESS
                        .requestMatchers(
                                "/api/data/customer/**"
                        ).hasAnyAuthority("CUSTOMER", "ROLE_CUSTOMER")

                        // 9. CHAT ENDPOINTS
                        .requestMatchers(
                                "/api/chat/**"
                        ).authenticated()

                        // 10. EVERYTHING ELSE MUST BE AUTHENTICATED
                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
        );

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}