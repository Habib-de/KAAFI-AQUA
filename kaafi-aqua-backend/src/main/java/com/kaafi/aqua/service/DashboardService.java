package com.kaafi.aqua.service;

import com.kaafi.aqua.dto.response.DashboardStatsResponse;
import com.kaafi.aqua.dto.response.ProfitDetailsResponse;
import com.kaafi.aqua.dto.response.SaleResponse;
import com.kaafi.aqua.model.Expense;
import com.kaafi.aqua.model.Sale;
import com.kaafi.aqua.repository.SaleRepository;
import com.kaafi.aqua.repository.UserRepository;
import com.kaafi.aqua.repository.StockItemRepository;
import com.kaafi.aqua.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final SaleRepository saleRepository;
    private final UserRepository userRepository;
    private final StockItemRepository stockItemRepository;
    private final TankService tankService;
    private final ExpenseService expenseService; // NEW
    
    public DashboardStatsResponse getAdminDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.minusDays(29);
        
        // Sales Stats
        BigDecimal todayRevenue = saleRepository.getTotalRevenueByDate(today);
        BigDecimal weeklyRevenue = saleRepository.getTotalRevenueBetweenDates(weekStart, today);
        BigDecimal monthlyRevenue = saleRepository.getTotalRevenueBetweenDates(monthStart, today);
        Long todaySales = saleRepository.getTotalSalesCountByDate(today);
        Long totalSales = saleRepository.count();
        
        // NEW: Calculate Profit/Loss
        BigDecimal todayExpenses = getTotalExpensesForDate(today);
        BigDecimal yesterdayExpenses = getTotalExpensesForDate(yesterday);
        BigDecimal yesterdayRevenue = saleRepository.getTotalRevenueByDate(yesterday);
        
        BigDecimal todayProfit = (todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
            .subtract(todayExpenses != null ? todayExpenses : BigDecimal.ZERO);
        
        BigDecimal yesterdayProfit = (yesterdayRevenue != null ? yesterdayRevenue : BigDecimal.ZERO)
            .subtract(yesterdayExpenses != null ? yesterdayExpenses : BigDecimal.ZERO);
        
        // Calculate profit trend percentage
        Double profitTrend = calculateTrendPercentage(yesterdayProfit, todayProfit);
        Boolean isProfit = todayProfit.compareTo(BigDecimal.ZERO) >= 0;
        
        // Tank Stats
        DashboardStatsResponse.TankStats tankStats = tankService.getTankStats();
        
        // User Stats
        Long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        Long totalUsers = userRepository.count();
        
        // Stock Stats
        Long lowStockItems = stockItemRepository.findLowStockItems().stream().count();
        Double inventoryValue = stockItemRepository.getTotalInventoryValue();
        
        // Recent Sales
        List<Sale> recentSalesList = saleRepository.findByDateBetween(monthStart, today)
            .stream()
            .limit(10)
            .collect(Collectors.toList());
        
        List<SaleResponse> recentSales = recentSalesList.stream()
            .map(this::mapToSaleResponse)
            .collect(Collectors.toList());
        
        // Sales by size
        List<Object[]> salesBySize = saleRepository.getSalesBySizeBetweenDates(monthStart, today);
        Map<String, Integer> salesBySizeMap = new HashMap<>();
        for (Object[] row : salesBySize) {
            salesBySizeMap.put((String) row[0], ((Number) row[1]).intValue());
        }
        
        // Weekly sales trend
        List<DashboardStatsResponse.WeeklySalesData> weeklySales = generateWeeklySalesData();
        
        return DashboardStatsResponse.builder()
            .todaySales(todaySales != null ? todaySales.intValue() : 0)
            .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
            .weeklyRevenue(weeklyRevenue != null ? weeklyRevenue : BigDecimal.ZERO)
            .monthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO)
            .totalSales(totalSales != null ? totalSales.intValue() : 0)
            .tankLevel(tankStats.getCurrentLevel())
            .tankCapacity(tankStats.getCapacity())
            .tankPercentage(tankStats.getPercentage())
            .tankStatus(tankStats.getStatus())
            .activeUsers(activeUsers != null ? activeUsers : 0L)
            .totalUsers(totalUsers != null ? totalUsers : 0L)
            .lowStockItems(lowStockItems)
            .inventoryValue(BigDecimal.valueOf(inventoryValue != null ? inventoryValue : 0.0))
            .recentSales(recentSales)
            .salesBySize(salesBySizeMap)
            .weeklySales(weeklySales)
            // NEW: Profit/Loss fields
            .todayProfit(todayProfit)
            .todayExpenses(todayExpenses != null ? todayExpenses : BigDecimal.ZERO)
            .profitTrend(profitTrend)
            .isProfit(isProfit)
            .build();
    }
    
    // NEW: Get profit details for modal
    public ProfitDetailsResponse getProfitDetails(String period) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = calculateStartDate(period);
        
        // Get revenues (from sales)
        List<Sale> sales = saleRepository.findByDateBetween(startDate, endDate);
        List<ProfitDetailsResponse.RevenueItem> revenues = sales.stream()
            .map(sale -> ProfitDetailsResponse.RevenueItem.builder()
                .date(sale.getDate().format(DateTimeFormatter.ISO_DATE))
                .description("Water Sale - " + sale.getSize() + " x" + sale.getQuantity())
                .amount(sale.getAmount())
                .source("Water Sales")
                .build())
            .collect(Collectors.toList());
        
        // Get expenses
        List<Expense> expenses = expenseService.getExpensesBetweenDates(startDate, endDate);
        List<ProfitDetailsResponse.ExpenseItem> expenseItems = expenses.stream()
            .map(expense -> ProfitDetailsResponse.ExpenseItem.builder()
                .date(expense.getDate().format(DateTimeFormatter.ISO_DATE))
                .category(expense.getCategory())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .paymentMethod(expense.getPaymentMethod() != null ? expense.getPaymentMethod().name() : "CASH")
                .build())
            .collect(Collectors.toList());
        
        // Calculate summary
        BigDecimal totalRevenue = revenues.stream()
            .map(ProfitDetailsResponse.RevenueItem::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalExpenses = expenseItems.stream()
            .map(ProfitDetailsResponse.ExpenseItem::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal netProfit = totalRevenue.subtract(totalExpenses);
        
        Double profitMargin = totalRevenue.compareTo(BigDecimal.ZERO) > 0 
            ? netProfit.divide(totalRevenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
            : 0.0;
        
        ProfitDetailsResponse.ProfitSummary summary = ProfitDetailsResponse.ProfitSummary.builder()
            .totalRevenue(totalRevenue)
            .totalExpenses(totalExpenses)
            .netProfit(netProfit)
            .profitMargin(profitMargin)
            .build();
        
        // Expense breakdown by category
        Map<String, BigDecimal> expenseByCategory = new HashMap<>();
        for (ProfitDetailsResponse.ExpenseItem item : expenseItems) {
            expenseByCategory.merge(item.getCategory(), item.getAmount(), BigDecimal::add);
        }
        
        List<ProfitDetailsResponse.ChartData> expenseBreakdown = expenseByCategory.entrySet().stream()
            .map(entry -> ProfitDetailsResponse.ChartData.builder()
                .name(entry.getKey())
                .value(entry.getValue())
                .build())
            .collect(Collectors.toList());
        
        return ProfitDetailsResponse.builder()
            .revenues(revenues)
            .expenses(expenseItems)
            .summary(summary)
            .expenseBreakdown(expenseBreakdown)
            .build();
    }
    
    private BigDecimal getTotalExpensesForDate(LocalDate date) {
        return expenseService.getExpensesBetweenDates(date, date).stream()
            .map(Expense::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private Double calculateTrendPercentage(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        BigDecimal difference = current.subtract(previous);
        return difference.divide(previous.abs(), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100))
            .doubleValue();
    }
    
    private LocalDate calculateStartDate(String period) {
        LocalDate now = LocalDate.now();
        switch (period.toLowerCase()) {
            case "daily":
                return now;
            case "weekly":
                return now.minusWeeks(1);
            case "monthly":
                return now.minusMonths(1);
            case "yearly":
                return now.minusYears(1);
            default:
                return now;
        }
    }
    
    private List<DashboardStatsResponse.WeeklySalesData> generateWeeklySalesData() {
        List<DashboardStatsResponse.WeeklySalesData> data = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        LocalDate today = LocalDate.now();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            BigDecimal revenue = saleRepository.getTotalRevenueByDate(date);
            data.add(DashboardStatsResponse.WeeklySalesData.builder()
                .day(days[date.getDayOfWeek().getValue() - 1])
                .sales(revenue != null ? revenue.intValue() : 0)
                .build());
        }
        return data;
    }
    
    public DashboardStatsResponse getStaffDashboardStats(String staffName) {
        // ... existing code remains the same ...
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.minusDays(29);
        
        // Staff-specific sales
        List<Sale> staffSales = saleRepository.findByStaff(staffName);
        List<Sale> todayStaffSales = saleRepository.findByDate(today).stream()
            .filter(sale -> sale.getStaff().equals(staffName))
            .collect(Collectors.toList());
        
        BigDecimal todayRevenue = todayStaffSales.stream()
            .map(Sale::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Long todaySales = (long) todayStaffSales.size();
        
        // Tank Stats
        DashboardStatsResponse.TankStats tankStats = tankService.getTankStats();
        
        // Recent sales
        List<SaleResponse> recentSales = staffSales.stream()
            .limit(10)
            .map(this::mapToSaleResponse)
            .collect(Collectors.toList());
        
        return DashboardStatsResponse.builder()
            .todaySales(todaySales != null ? todaySales.intValue() : 0)
            .todayRevenue(todayRevenue)
            .totalSales(staffSales.size())
            .tankLevel(tankStats.getCurrentLevel())
            .tankCapacity(tankStats.getCapacity())
            .tankPercentage(tankStats.getPercentage())
            .tankStatus(tankStats.getStatus())
            .recentSales(recentSales)
            .build();
    }
    
    private SaleResponse mapToSaleResponse(Sale sale) {
        SaleResponse response = new SaleResponse();
        response.setId(sale.getId());
        response.setDate(sale.getDate());
        response.setTime(sale.getTime());
        response.setCustomer(sale.getCustomer());
        response.setSize(sale.getSize());
        response.setQuantity(sale.getQuantity());
        response.setAmount(sale.getAmount());
        response.setMethod(sale.getMethod());
        response.setStatus(sale.getStatus());
        response.setStaff(sale.getStaff());
        return response;
    }
}