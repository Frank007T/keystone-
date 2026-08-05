package com.keystone.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    private static final Logger LOGGER = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms:86400000}") // Default 24h fallback
    private long jwtExpirationMs;

    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role) // Use .claim() instead of overriding with .setClaims()
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.getSubject() : null;
    }

    public String extractRole(String token) {
        Claims claims = getClaims(token);
        if (claims == null) return null;

        // Multi-check for common claim keys
        if (claims.get("role") != null) {
            return claims.get("role", String.class);
        } else if (claims.get("roles") != null) {
            return claims.get("roles", String.class);
        } else if (claims.get("authorities") != null) {
            return claims.get("authorities", String.class);
        }
        return null;
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            if (claims == null) return false;
            
            // Explicitly verify expiration
            boolean isExpired = claims.getExpiration().before(new Date());
            if (isExpired) {
                LOGGER.warn("JWT token is expired");
                return false;
            }
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            LOGGER.error("Invalid JWT token: {}", ex.getMessage());
            return false;
        }
    }

    private Claims getClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            LOGGER.error("Failed to parse JWT claims: {}", e.getMessage());
            return null;
        }
    }
}