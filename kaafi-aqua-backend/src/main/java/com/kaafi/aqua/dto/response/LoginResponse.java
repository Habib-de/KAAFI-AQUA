package com.kaafi.aqua.dto.response;

import com.kaafi.aqua.enums.Role;
import com.kaafi.aqua.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
}