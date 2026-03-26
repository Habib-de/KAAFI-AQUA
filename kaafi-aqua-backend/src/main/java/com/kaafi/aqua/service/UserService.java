package com.kaafi.aqua.service;

import com.kaafi.aqua.dto.request.UserRequest;
import com.kaafi.aqua.dto.response.UserResponse;
import com.kaafi.aqua.model.User;
import com.kaafi.aqua.repository.UserRepository;
import com.kaafi.aqua.enums.Role;
import com.kaafi.aqua.enums.UserStatus;
import com.kaafi.aqua.exception.ResourceNotFoundException;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogger activityLogger;
    
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::mapToUserResponse)
            .collect(Collectors.toList());
    }
    
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));  // FIXED: removed extra semicolon
        return mapToUserResponse(user);
    }
    
    @Transactional
    public UserResponse createUser(UserRequest request, String createdBy) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() != null ? request.getRole() : Role.STAFF);
        user.setStatus(UserStatus.ACTIVE);
        
        User savedUser = userRepository.save(user);
        
        Long userId = savedUser.getId() != null ? savedUser.getId() : 0L;
        activityLogger.log(createdBy, "CREATE_USER", "User", userId, 
            "Created user: " + savedUser.getUsername() + " with role: " + savedUser.getRole());
        
        return mapToUserResponse(savedUser);
    }
    
    @Transactional
    public UserResponse updateUser(Long id, UserRequest request, String updatedBy) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        User updatedUser = userRepository.save(user);
        
        Long userId = user.getId() != null ? user.getId() : 0L;
        activityLogger.log(updatedBy, "UPDATE_USER", "User", userId, 
            "Updated user: " + user.getUsername());
        
        return mapToUserResponse(updatedUser);
    }
    
    @Transactional
    public void deleteUser(Long id, String deletedBy) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        userRepository.delete(user);
        
        activityLogger.log(deletedBy, "DELETE_USER", "User", id, 
            "Deleted user: " + user.getUsername());
    }
    
    @Transactional
    public UserResponse toggleUserStatus(Long id, String updatedBy) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        
        UserStatus newStatus = user.getStatus() == UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
        user.setStatus(newStatus);
        User updatedUser = userRepository.save(user);
        
        Long userId = user.getId() != null ? user.getId() : 0L;
        activityLogger.log(updatedBy, "TOGGLE_USER_STATUS", "User", userId, 
            "User " + user.getUsername() + " status changed to: " + newStatus);
        
        return mapToUserResponse(updatedUser);
    }
    
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
            .map(this::mapToUserResponse)
            .collect(Collectors.toList());
    }
    
    public List<UserResponse> searchUsers(String keyword) {
        return userRepository.searchUsers(keyword).stream()
            .map(this::mapToUserResponse)
            .collect(Collectors.toList());
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