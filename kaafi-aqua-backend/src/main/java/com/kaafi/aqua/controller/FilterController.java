package com.kaafi.aqua.controller;

import com.kaafi.aqua.dto.response.ApiResponse;
import com.kaafi.aqua.model.Filter;
import com.kaafi.aqua.model.FilterMaintenanceLog;
import com.kaafi.aqua.service.FilterService;
import com.kaafi.aqua.security.JwtTokenProvider;
import com.kaafi.aqua.enums.FilterStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/filters")
@RequiredArgsConstructor
public class FilterController {
    
    private final FilterService filterService;
    private final JwtTokenProvider tokenProvider;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Filter>>> getAllFilters() {
        List<Filter> filters = filterService.getAllFilters();
        return ResponseEntity.ok(ApiResponse.success(filters));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Filter>> getFilterById(@PathVariable Long id) {
        Filter filter = filterService.getFilterById(id);
        return ResponseEntity.ok(ApiResponse.success(filter));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Filter>>> getFiltersByStatus(@PathVariable FilterStatus status) {
        List<Filter> filters = filterService.getFiltersByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(filters));
    }
    
    @GetMapping("/critical")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Filter>>> getCriticalFilters() {
        List<Filter> filters = filterService.getCriticalFilters();
        return ResponseEntity.ok(ApiResponse.success(filters));
    }
    
    @GetMapping("/warning")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Filter>>> getWarningFilters() {
        List<Filter> filters = filterService.getWarningFilters();
        return ResponseEntity.ok(ApiResponse.success(filters));
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFilterDashboardStats() {
        Map<String, Object> stats = filterService.getFilterDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @PutMapping("/{id}/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Filter>> updateFilterStatus(
            @PathVariable Long id,
            @RequestParam FilterStatus status,
            @RequestParam Integer percentage,
            HttpServletRequest httpRequest) {
        String updatedBy = getCurrentUser(httpRequest);
        Filter updatedFilter = filterService.updateFilterStatus(id, status, percentage, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Filter updated successfully", updatedFilter));
    }
    
    @PostMapping("/maintenance-log")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FilterMaintenanceLog>> addMaintenanceLog(
            @RequestParam String filterName,
            @RequestParam String action,
            @RequestParam String technician,
            @RequestParam(required = false) String notes,
            HttpServletRequest httpRequest) {
        String performedBy = getCurrentUser(httpRequest);
        FilterMaintenanceLog log = filterService.addMaintenanceLog(filterName, action, technician, notes, performedBy);
        return ResponseEntity.ok(ApiResponse.success("Maintenance log added successfully", log));
    }
    
    @GetMapping("/maintenance-logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<FilterMaintenanceLog>>> getMaintenanceLogs() {
        List<FilterMaintenanceLog> logs = filterService.getMaintenanceLogs();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
    
    @GetMapping("/maintenance-logs/filter/{filterName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<FilterMaintenanceLog>>> getMaintenanceLogsByFilter(@PathVariable String filterName) {
        List<FilterMaintenanceLog> logs = filterService.getMaintenanceLogsByFilter(filterName);
        return ResponseEntity.ok(ApiResponse.success(logs));
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
