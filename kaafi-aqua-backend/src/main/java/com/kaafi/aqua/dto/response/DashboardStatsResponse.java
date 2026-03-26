package com.kaafi.aqua.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    // Sales Stats
    private Integer todaySales;
    private BigDecimal todayRevenue;
    private BigDecimal weeklyRevenue;
    private BigDecimal monthlyRevenue;
    private Integer totalSales;
    
    // Tank Stats
    private Integer tankLevel;
    private Integer tankCapacity;
    private Double tankPercentage;
    private String tankStatus;
    
    // User Stats
    private Long activeUsers;
    private Long totalUsers;
    
    // Stock Stats
    private Long lowStockItems;
    private BigDecimal inventoryValue;
    
    // Recent Sales
    private List<SaleResponse> recentSales;
    
    // Sales by size
    private Map<String, Integer> salesBySize;
    
    // Weekly trend
    private List<WeeklySalesData> weeklySales;
    
    @Data
    @Builder
    public static class TankStats {
        private Integer currentLevel;
        private Integer capacity;
        private Double percentage;
        private String status;
    }
    
    @Data
    @Builder
    public static class WeeklySalesData {
        private String day;
        private Integer sales;
    }
}