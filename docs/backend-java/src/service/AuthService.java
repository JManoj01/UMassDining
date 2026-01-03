package com.umassdining.service;

import com.umassdining.dto.AuthRequest;
import com.umassdining.dto.AuthResponse;
import com.umassdining.exception.ResourceNotFoundException;
import com.umassdining.model.User;
import com.umassdining.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public AuthResponse register(AuthRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(new Date());

        userRepository.save(user);

        // Generate token
        String token = generateToken(user);

        return AuthResponse.builder()
            .token(token)
            .userId(user.getId().toString())
            .email(user.getEmail())
            .expiresIn(jwtExpiration)
            .build();
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid password");
        }

        String token = generateToken(user);

        return AuthResponse.builder()
            .token(token)
            .userId(user.getId().toString())
            .email(user.getEmail())
            .expiresIn(jwtExpiration)
            .build();
    }

    private String generateToken(User user) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Date now = new Date();
        Date expiration = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("email", user.getEmail())
            .setIssuedAt(now)
            .setExpiration(expiration)
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }
}
