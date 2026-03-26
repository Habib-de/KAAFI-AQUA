package com.kaafi.aqua.service;

import com.kaafi.aqua.dto.response.DashboardStatsResponse;
import com.kaafi.aqua.dto.response.SaleResponse;
import com.kaafi.aqua.model.Sale;
import com.kaafi.aqua.repository.SaleRepository;
import com.kaafi.aqua.repository.UserRepository;
import com.kaafi.aqua.repository.StockItemRepository;
import com.kaafi.aqua.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    
    public DashboardStatsResponse getAdminDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.minusDays(29);
        
        // Sales Stats
        BigDecimal todayRevenue = saleRepository.getTotalRevenueByDate(today);
        BigDecimal weeklyRevenue = saleRepository.getTotalRevenueBetweenDates(weekStart, today);
        BigDecimal monthlyRevenue = saleRepository.getTotalRevenueBetweenDates(monthStart, today);
        Long todaySales = saleRepository.getTotalSalesCountByDate(today);
        Long totalSales = saleRepository.count();
        
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
        
        // Weekly sales trend - Using ArrayList instead of List.of() for Java 8
        List<DashboardStatsResponse.WeeklySalesData> weeklySales = new ArrayList<>();
        
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
            .build();
    }
    
    public DashboardStatsResponse getStaffDashboardStats(String staffName) {
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
        
        // Staff total revenue (used for potential future features)
        @SuppressWarnings("unused")
        BigDecimal myTotalRevenue = staffSales.stream()
            .map(Sale::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
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