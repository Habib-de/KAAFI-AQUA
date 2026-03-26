package com.kaafi.aqua.controller;

import com.kaafi.aqua.dto.response.ApiResponse;
import com.kaafi.aqua.model.User;
import com.kaafi.aqua.repository.UserRepository;
import com.kaafi.aqua.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class FileUploadController {
    
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    
    @Value("${app.upload.path}")
    private String uploadPath;
    
    @PostMapping("/profile/image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfileImage(
            @RequestParam("profileImage") MultipartFile file,
            HttpServletRequest request) throws IOException {
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Only image files are allowed"));
        }
        
        // Validate file size (5MB max)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("File size must be less than 5MB"));
        }
        
        // Get current user
        String username = getCurrentUser(request);
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create upload directory if not exists
        Path uploadDir = Paths.get(uploadPath + "/profiles");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        
        // Delete old profile image if exists
        if (user.getProfileImage() != null && !user.getProfileImage().isEmpty()) {
            String oldFileName = user.getProfileImage().substring(user.getProfileImage().lastIndexOf("/") + 1);
            Path oldFilePath = uploadDir.resolve(oldFileName);
            try {
                Files.deleteIfExists(oldFilePath);
            } catch (IOException e) {
                System.err.println("Failed to delete old image: " + e.getMessage());
            }
        }
        
        // Generate unique filename
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadDir.resolve(filename);
        
        // Save file
        Files.copy(file.getInputStream(), filePath);
        
        // Update user with image URL
        String fileUrl = "/uploads/profiles/" + filename;
        user.setProfileImage(fileUrl);
        userRepository.save(user);
        
        // Return file URL
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", fileUrl);
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @DeleteMapping("/profile/image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> removeProfileImage(HttpServletRequest request) {
        String username = getCurrentUser(request);
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Delete the image file if it exists
        if (user.getProfileImage() != null && !user.getProfileImage().isEmpty()) {
            String fileName = user.getProfileImage().substring(user.getProfileImage().lastIndexOf("/") + 1);
            Path uploadDir = Paths.get(uploadPath + "/profiles");
            Path filePath = uploadDir.resolve(fileName);
            try {
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("Failed to delete image file: " + e.getMessage());
            }
            
            // Remove image URL from database
            user.setProfileImage(null);
            userRepository.save(user);
            
            return ResponseEntity.ok(ApiResponse.success("Profile image removed successfully", null));
        }
        
        return ResponseEntity.badRequest().body(ApiResponse.error("No profile image to remove"));
    }
    
    private String getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return tokenProvider.getUsernameFromToken(token);
        }
        return null;
    }
}