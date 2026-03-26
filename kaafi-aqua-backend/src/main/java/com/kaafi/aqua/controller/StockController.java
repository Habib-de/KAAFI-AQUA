package com.kaafi.aqua.controller;

import com.kaafi.aqua.dto.request.StockUpdateRequest;
import com.kaafi.aqua.dto.response.ApiResponse;
import com.kaafi.aqua.model.StockItem;
import com.kaafi.aqua.model.StockMovementHistory;
import com.kaafi.aqua.service.StockService;
import com.kaafi.aqua.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stock")
@RequiredArgsConstructor
public class StockController {
    
    private final StockService stockService;
    private final JwtTokenProvider tokenProvider;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<StockItem>>> getAllStockItems() {
        List<StockItem> items = stockService.getAllStockItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<StockItem>> getStockItemById(@PathVariable Long id) {
        StockItem item = stockService.getStockItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }
    
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<StockItem>>> getLowStockItems() {
        List<StockItem> items = stockService.getLowStockItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }
    
    @GetMapping("/overstock")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<StockItem>>> getOverstockItems() {
        List<StockItem> items = stockService.getOverstockItems();
        return ResponseEntity.ok(ApiResponse.success(items));
    }
    
    @GetMapping("/category/{category}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<StockItem>>> getStockByCategory(@PathVariable String category) {
        List<StockItem> items = stockService.getStockByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<StockItem>>> searchStock(@RequestParam String keyword) {
        List<StockItem> items = stockService.searchStock(keyword);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStockDashboardStats() {
        Map<String, Object> stats = stockService.getStockDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @PostMapping("/update-quantity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StockItem>> updateStockQuantity(
            @Valid @RequestBody StockUpdateRequest request,
            HttpServletRequest httpRequest) {
        String performedBy = getCurrentUser(httpRequest);
        StockItem updatedItem = stockService.updateStockQuantity(request, performedBy);
        return ResponseEntity.ok(ApiResponse.success("Stock quantity updated successfully", updatedItem));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StockItem>> createStockItem(
            @Valid @RequestBody StockItem stockItem,
            HttpServletRequest httpRequest) {
        String createdBy = getCurrentUser(httpRequest);
        StockItem createdItem = stockService.createStockItem(stockItem, createdBy);
        return ResponseEntity.ok(ApiResponse.success("Stock item created successfully", createdItem));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStockItem(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        String deletedBy = getCurrentUser(httpRequest);
        stockService.deleteStockItem(id, deletedBy);
        return ResponseEntity.ok(ApiResponse.success("Stock item deleted successfully", null));
    }
    
    @GetMapping("/{id}/movement-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<StockMovementHistory>>> getStockMovementHistory(@PathVariable Long id) {
        List<StockMovementHistory> history = stockService.getStockMovementHistory(id);
        return ResponseEntity.ok(ApiResponse.success(history));
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
