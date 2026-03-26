package com.kaafi.aqua.service;

import com.kaafi.aqua.dto.request.SaleRequest;
import com.kaafi.aqua.dto.response.SaleResponse;
import com.kaafi.aqua.model.Sale;
import com.kaafi.aqua.model.TankLevel;
import com.kaafi.aqua.repository.SaleRepository;
import com.kaafi.aqua.repository.TankLevelRepository;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SaleService {
    
    private final SaleRepository saleRepository;
    private final TankLevelRepository tankLevelRepository;
    private final ActivityLogger activityLogger;
    
    @Transactional
    public SaleResponse createSale(SaleRequest request, String staffName) {
        TankLevel tank = tankLevelRepository.findTopByOrderByIdDesc().orElse(null);
        if (tank != null && tank.getCurrentLevel() < request.getQuantity() * getWaterPerSize(request.getSize())) {
            throw new RuntimeException("Insufficient water in tank for this sale");
        }
        
        Sale sale = new Sale();
        sale.setDate(LocalDate.now());
        sale.setTime(LocalTime.now());
        sale.setCustomer(request.getCustomer());
        sale.setSize(request.getSize());
        sale.setQuantity(request.getQuantity());
        sale.setAmount(request.getAmount());
        sale.setMethod(request.getMethod());
        sale.setStaff(staffName);
        
        Sale savedSale = saleRepository.save(sale);
        
        if (tank != null) {
            int waterUsed = request.getQuantity() * getWaterPerSize(request.getSize());
            tank.setCurrentLevel(tank.getCurrentLevel() - waterUsed);
            tankLevelRepository.save(tank);
        }
        
        activityLogger.log(staffName, "CREATE_SALE", "Sale", savedSale.getId(), 
            "Sale created: " + request.getQuantity() + "x " + request.getSize() + " to " + request.getCustomer());
        
        return mapToSaleResponse(savedSale);
    }
    
    private int getWaterPerSize(String size) {
        switch (size) {
            case "5L": return 5;
            case "10L": return 10;
            case "18.9L": return 19;
            case "20L": return 20;
            default: return 10;
        }
    }
    
    public List<SaleResponse> getTodaySales() {
        try {
            List<Sale> sales = saleRepository.findByDate(LocalDate.now());
            if (sales == null || sales.isEmpty()) {
                return new ArrayList<>();
            }
            return sales.stream()
                .map(this::mapToSaleResponse)
                .filter(response -> response != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching today's sales", e);
            return new ArrayList<>();
        }
    }
    
    public List<SaleResponse> getSalesByDate(LocalDate date) {
        try {
            List<Sale> sales = saleRepository.findByDate(date);
            if (sales == null || sales.isEmpty()) {
                return new ArrayList<>();
            }
            return sales.stream()
                .map(this::mapToSaleResponse)
                .filter(response -> response != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching sales by date: {}", date, e);
            return new ArrayList<>();
        }
    }
    
    public List<SaleResponse> getSalesBetweenDates(LocalDate startDate, LocalDate endDate) {
        try {
            List<Sale> sales = saleRepository.findByDateBetween(startDate, endDate);
            if (sales == null || sales.isEmpty()) {
                return new ArrayList<>();
            }
            return sales.stream()
                .map(this::mapToSaleResponse)
                .filter(response -> response != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching sales between dates: {} and {}", startDate, endDate, e);
            return new ArrayList<>();
        }
    }
    
    public Page<SaleResponse> getSalesBetweenDatesPaginated(LocalDate startDate, LocalDate endDate, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Sale> salePage = saleRepository.findByDateBetween(startDate, endDate, pageable);
            if (salePage == null || salePage.isEmpty()) {
                return new PageImpl<>(new ArrayList<>(), pageable, 0);
            }
            return salePage.map(this::mapToSaleResponse);
        } catch (Exception e) {
            log.error("Error fetching paginated sales", e);
            return new PageImpl<>(new ArrayList<>(), PageRequest.of(page, size), 0);
        }
    }
    
    public List<SaleResponse> getSalesByStaff(String staff) {
        try {
            List<Sale> sales = saleRepository.findByStaff(staff);
            if (sales == null || sales.isEmpty()) {
                return new ArrayList<>();
            }
            return sales.stream()
                .map(this::mapToSaleResponse)
                .filter(response -> response != null)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching sales by staff: {}", staff, e);
            return new ArrayList<>();
        }
    }
    
    public BigDecimal getTodayRevenue() {
        try {
            BigDecimal revenue = saleRepository.getTotalRevenueByDate(LocalDate.now());
            return revenue != null ? revenue : BigDecimal.ZERO;
        } catch (Exception e) {
            log.error("Error fetching today's revenue", e);
            return BigDecimal.ZERO;
        }
    }
    
    public Long getTodaySalesCount() {
        try {
            Long count = saleRepository.getTotalSalesCountByDate(LocalDate.now());
            return count != null ? count : 0L;
        } catch (Exception e) {
            log.error("Error fetching today's sales count", e);
            return 0L;
        }
    }
    
    public List<Object[]> getSalesBySizeBetweenDates(LocalDate startDate, LocalDate endDate) {
        try {
            List<Object[]> results = saleRepository.getSalesBySizeBetweenDates(startDate, endDate);
            return results != null ? results : new ArrayList<>();
        } catch (Exception e) {
            log.error("Error fetching sales by size", e);
            return new ArrayList<>();
        }
    }
    
    private SaleResponse mapToSaleResponse(Sale sale) {
        if (sale == null) {
            return null;
        }
        
        try {
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
        } catch (Exception e) {
            log.error("Error mapping sale to response for sale id: {}", sale.getId(), e);
            return null;
        }
    }
}