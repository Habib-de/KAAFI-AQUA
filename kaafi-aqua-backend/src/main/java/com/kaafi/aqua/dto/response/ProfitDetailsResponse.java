package com.kaafi.aqua.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProfitDetailsResponse {
    private List<RevenueItem> revenues;
    private List<ExpenseItem> expenses;
    private ProfitSummary summary;
    private List<ChartData> expenseBreakdown;
    
    @Data
    @Builder
    public static class RevenueItem {
        private String date;
        private String description;
        private BigDecimal amount;
        private String source; // e.g., "Water Sales", "Product Sales"
    }
    
    @Data
    @Builder
    public static class ExpenseItem {
        private String date;
        private String category;
        private String description;
        private BigDecimal amount;
        private String paymentMethod;
    }
    
    @Data
    @Builder
    public static class ProfitSummary {
        private BigDecimal totalRevenue;
        private BigDecimal totalExpenses;
        private BigDecimal netProfit;
        private Double profitMargin; // percentage
    }
    
    @Data
    @Builder
    public static class ChartData {
        private String name;
        private BigDecimal value;
    }
}