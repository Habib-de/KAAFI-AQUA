package com.kaafi.aqua.dto.response;

import com.kaafi.aqua.enums.Role;
import com.kaafi.aqua.enums.UserStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
    private String profileImage;
    private LocalDate joinDate;
    private LocalDateTime lastLogin;
}