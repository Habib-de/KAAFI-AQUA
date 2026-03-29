package com.kaafi.aqua.service;

import com.kaafi.aqua.dto.request.LoginRequest;
import com.kaafi.aqua.dto.request.UserRequest;
import com.kaafi.aqua.dto.response.LoginResponse;
import com.kaafi.aqua.dto.response.UserResponse;
import com.kaafi.aqua.model.User;
import com.kaafi.aqua.model.PasswordResetToken;
import com.kaafi.aqua.repository.UserRepository;
import com.kaafi.aqua.repository.PasswordResetTokenRepository;
import com.kaafi.aqua.security.JwtTokenProvider;
import com.kaafi.aqua.enums.Role;
import com.kaafi.aqua.enums.UserStatus;
import com.kaafi.aqua.util.EmailService;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository tokenRepository;
    private final ActivityLogger activityLogger;
    
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is INACTIVE - reject login
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new RuntimeException("Your account is inactive. Please contact the administrator for assistance.");
        }
        
        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        // Log activity - Fixed null safety by using 0L as fallback
        Long userId = user.getId() != null ? user.getId() : 0L;
        activityLogger.log(user.getUsername(), "LOGIN", "User", userId, "User logged in");
        
        return new LoginResponse(
            jwt,
            "Bearer",
            user.getId(),
            user.getUsername(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.getStatus()  // ADDED: Include status in response
        );
    }
    
    // Add this new method to check if any admin exists
    public boolean checkIfAdminExists() {
        try {
            log.info("Checking if any admin exists in the system");
            long adminCount = userRepository.countByRole(Role.ADMIN);
            log.info("Found {} admin(s) in the system", adminCount);
            return adminCount > 0;
        } catch (Exception e) {
            log.error("Error checking admin existence", e);
            return false;
        }
    }
    
    @Transactional
    public UserResponse registerFirstAdmin(UserRequest request) {
        // Check if any admin exists
        if (userRepository.countByRole(Role.ADMIN) > 0) {
            throw new RuntimeException("Admin already exists. First time setup only once.");
        }
        
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(Role.ADMIN);
        user.setStatus(UserStatus.ACTIVE);
        
        User savedUser = userRepository.save(user);
        
        Long userId = savedUser.getId() != null ? savedUser.getId() : 0L;
        activityLogger.log(savedUser.getUsername(), "REGISTER", "User", userId, "First admin created");
        
        return mapToUserResponse(savedUser);
    }
    
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        // Generate token
        String token = UUID.randomUUID().toString();
        
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUserId(user.getId());
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(24));
        resetToken.setUsed(false);
        
        tokenRepository.save(resetToken);
        
        // Send email
        emailService.sendPasswordResetEmail(user.getEmail(), token);
        
        Long userId = user.getId() != null ? user.getId() : 0L;
        activityLogger.log(user.getUsername(), "FORGOT_PASSWORD", "User", userId, "Password reset requested");
    }
    
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid or expired token"));
        
        if (resetToken.isExpired()) {
            throw new RuntimeException("Token has expired");
        }
        
        if (resetToken.getUsed()) {
            throw new RuntimeException("Token has already been used");
        }
        
        User user = userRepository.findById(resetToken.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        
        Long userId = user.getId() != null ? user.getId() : 0L;
        activityLogger.log(user.getUsername(), "RESET_PASSWORD", "User", userId, "Password reset successfully");
    }
    
    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setProfileImage(user.getProfileImage());
        response.setJoinDate(user.getJoinDate());
        response.setLastLogin(user.getLastLogin());
        return response;
    }
}