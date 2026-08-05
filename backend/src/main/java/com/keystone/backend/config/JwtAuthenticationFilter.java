package com.keystone.backend.config;

import com.keystone.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authorizationHeader = request.getHeader("Authorization");
        LOGGER.debug("Incoming request {} {} | Authorization header present: {}", request.getMethod(), request.getRequestURI(), authorizationHeader != null);

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            if (jwtService.validateToken(token)) {
                String email = jwtService.extractEmail(token);
                String rawRole = jwtService.extractRole(token);
                
                LOGGER.debug("JWT valid. email={}, rawRole={}", email, rawRole);

                // Safe role formatting: UpperCase + single "ROLE_" prefix
                String formattedRole = "ROLE_USER";
                if (rawRole != null && !rawRole.isBlank()) {
                    String cleanRole = rawRole.trim().toUpperCase();
                    formattedRole = cleanRole.startsWith("ROLE_") ? cleanRole : "ROLE_" + cleanRole;
                }

                var authorities = List.of(new SimpleGrantedAuthority(formattedRole));
                
                var authentication = new UsernamePasswordAuthenticationToken(email, null, authorities);
                
                // Set request details so SecurityContext treats the token as fully populated
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                LOGGER.debug("JWT validation failed for token: {}", token);
            }
        } else {
            LOGGER.debug("No bearer Authorization header present or invalid format.");
        }

        filterChain.doFilter(request, response);
    }
}