package com.kaafi.aqua.controller;

import com.kaafi.aqua.dto.response.ApiResponse;
import com.kaafi.aqua.dto.response.DashboardStatsResponse;
import com.kaafi.aqua.dto.response.ProfitDetailsResponse;
import com.kaafi.aqua.service.DashboardService;
import com.kaafi.aqua.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final DashboardService dashboardService;
    private final JwtTokenProvider tokenProvider;
    
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getAdminDashboard() {
        DashboardStatsResponse stats = dashboardService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @GetMapping("/staff")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStaffDashboard(HttpServletRequest request) {
        String username = getCurrentUser(request);
        DashboardStatsResponse stats = dashboardService.getStaffDashboardStats(username);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    // NEW: Profit/Loss details endpoint for the modal
    @GetMapping("/profit-details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProfitDetailsResponse>> getProfitDetails(
            @RequestParam(defaultValue = "daily") String period) {
        ProfitDetailsResponse details = dashboardService.getProfitDetails(period);
        return ResponseEntity.ok(ApiResponse.success(details));
    }
    
    private String getCurrentUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return tokenProvider.getUsernameFromToken(token);
        }
        return "anonymous";
    }
}