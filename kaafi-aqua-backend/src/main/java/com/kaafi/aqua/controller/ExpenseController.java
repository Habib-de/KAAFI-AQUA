package com.kaafi.aqua.controller;

import com.kaafi.aqua.dto.request.ExpenseRequest;
import com.kaafi.aqua.dto.response.ApiResponse;
import com.kaafi.aqua.model.Expense;
import com.kaafi.aqua.service.ExpenseService;
import com.kaafi.aqua.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    
    private final ExpenseService expenseService;
    private final JwtTokenProvider tokenProvider;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Expense>>> getAllExpenses() {
        List<Expense> expenses = expenseService.getAllExpenses();
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Expense>> getExpenseById(@PathVariable Long id) {
        Expense expense = expenseService.getExpenseById(id);
        return ResponseEntity.ok(ApiResponse.success(expense));
    }
    
    @GetMapping("/between")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Expense>>> getExpensesBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Expense> expenses = expenseService.getExpensesBetweenDates(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }
    
    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Expense>>> getExpensesByCategory(@PathVariable String category) {
        List<Expense> expenses = expenseService.getExpensesByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(expenses));
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExpenseStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> stats = expenseService.getExpenseDashboardStats(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Expense>> createExpense(
            @Valid @RequestBody ExpenseRequest request,
            HttpServletRequest httpRequest) {
        String addedBy = getCurrentUser(httpRequest);
        Expense expense = expenseService.createExpense(request, addedBy);
        return ResponseEntity.ok(ApiResponse.success("Expense created successfully", expense));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        String deletedBy = getCurrentUser(httpRequest);
        expenseService.deleteExpense(id, deletedBy);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", null));
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
