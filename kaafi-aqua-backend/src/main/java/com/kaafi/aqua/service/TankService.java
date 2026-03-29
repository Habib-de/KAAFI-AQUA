package com.kaafi.aqua.service;

import com.kaafi.aqua.dto.request.CapacityUpdateRequest;
import com.kaafi.aqua.dto.request.LevelUpdateRequest;
import com.kaafi.aqua.dto.request.TankInitRequest;
import com.kaafi.aqua.dto.request.TankRestockRequest;
import com.kaafi.aqua.dto.response.DashboardStatsResponse;
import com.kaafi.aqua.model.TankLevel;
import com.kaafi.aqua.model.TankRestockHistory;
import com.kaafi.aqua.model.TankUsageHistory;
import com.kaafi.aqua.repository.TankLevelRepository;
import com.kaafi.aqua.repository.TankRestockHistoryRepository;
import com.kaafi.aqua.repository.TankUsageHistoryRepository;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TankService {
    
    private final TankLevelRepository tankLevelRepository;
    private final TankUsageHistoryRepository usageHistoryRepository;
    private final TankRestockHistoryRepository restockHistoryRepository;
    private final ActivityLogger activityLogger;
    
    public TankLevel getCurrentTankLevel() {
        return tankLevelRepository.findTopByOrderByIdDesc()
            .orElseGet(() -> {
                log.warn("No tank level found. Creating default tank level...");
                TankLevel defaultTank = new TankLevel();
                defaultTank.setCurrentLevel(2850);
                defaultTank.setTankCapacity(5000);
                defaultTank.setNotes("Auto-created default tank");
                TankLevel savedTank = tankLevelRepository.save(defaultTank);
                log.info("Default tank level created: {}L out of {}L", savedTank.getCurrentLevel(), savedTank.getTankCapacity());
                return savedTank;
            });
    }
    
    @Transactional
    public TankLevel restockTank(TankRestockRequest request, String restockedBy) {
        TankLevel currentTank = getCurrentTankLevel();
        
        int previousLevel = currentTank.getCurrentLevel();
        int newLevel = Math.min(currentTank.getTankCapacity(), previousLevel + request.getAmountLiters());
        
        currentTank.setCurrentLevel(newLevel);
        currentTank.setUpdatedBy(restockedBy);
        currentTank.setNotes(request.getNotes());
        TankLevel updatedTank = tankLevelRepository.save(currentTank);
        
        TankRestockHistory history = new TankRestockHistory();
        history.setAmountLiters(request.getAmountLiters());
        history.setPreviousLevel(previousLevel);
        history.setNewLevel(newLevel);
        history.setRestockedBy(restockedBy);
        history.setNotes(request.getNotes());
        restockHistoryRepository.save(history);
        
        activityLogger.log(restockedBy, "RESTOCK_TANK", "Tank", currentTank.getId(), 
            "Restocked " + request.getAmountLiters() + "L. Previous: " + previousLevel + "L, New: " + newLevel + "L");
        
        return updatedTank;
    }
    
    @Transactional
    public TankLevel initializeTank(TankInitRequest request, String initializedBy) {
        log.info("Initializing new tank with capacity: {}L, current level: {}L by: {}", 
            request.getTankCapacity(), request.getCurrentLevel(), initializedBy);
        
        // Validate
        if (request.getCurrentLevel() > request.getTankCapacity()) {
            throw new RuntimeException("Current level cannot exceed tank capacity");
        }
        
        // Create new tank record
        TankLevel newTank = new TankLevel();
        newTank.setCurrentLevel(request.getCurrentLevel());
        newTank.setTankCapacity(request.getTankCapacity());
        newTank.setUpdatedBy(initializedBy);
        newTank.setNotes(request.getNotes());
        
        TankLevel savedTank = tankLevelRepository.save(newTank);
        
        activityLogger.log(initializedBy, "INITIALIZE_TANK", "TankLevel", savedTank.getId(),
            "Tank initialized with capacity: " + request.getTankCapacity() + "L, current level: " + request.getCurrentLevel() + "L");
        
        log.info("Tank initialized successfully with ID: {}", savedTank.getId());
        return savedTank;
    }
    
    @Transactional
    public TankLevel updateCapacity(CapacityUpdateRequest request, String updatedBy) {
        TankLevel currentTank = getCurrentTankLevel();
        
        log.info("Updating tank capacity from {}L to {}L by: {}", 
            currentTank.getTankCapacity(), request.getTankCapacity(), updatedBy);
        
        // Validate new capacity
        if (request.getTankCapacity() < currentTank.getCurrentLevel()) {
            throw new RuntimeException("Cannot set capacity below current water level (" + 
                currentTank.getCurrentLevel() + "L). Please reduce water level first.");
        }
        
        currentTank.setTankCapacity(request.getTankCapacity());
        currentTank.setUpdatedBy(updatedBy);
        if (request.getNotes() != null) {
            currentTank.setNotes(request.getNotes());
        }
        
        TankLevel updatedTank = tankLevelRepository.save(currentTank);
        
        activityLogger.log(updatedBy, "UPDATE_TANK_CAPACITY", "TankLevel", updatedTank.getId(),
            "Updated tank capacity from " + currentTank.getTankCapacity() + "L to: " + request.getTankCapacity() + "L");
        
        log.info("Tank capacity updated successfully to: {}L", request.getTankCapacity());
        return updatedTank;
    }
    
    @Transactional
    public TankLevel updateLevel(LevelUpdateRequest request, String updatedBy) {
        TankLevel currentTank = getCurrentTankLevel();
        
        log.info("Updating water level from {}L to {}L by: {}", 
            currentTank.getCurrentLevel(), request.getCurrentLevel(), updatedBy);
        
        // Validate new level
        if (request.getCurrentLevel() < 0) {
            throw new RuntimeException("Water level cannot be negative");
        }
        if (request.getCurrentLevel() > currentTank.getTankCapacity()) {
            throw new RuntimeException("Water level cannot exceed tank capacity of " + 
                currentTank.getTankCapacity() + "L");
        }
        
        int previousLevel = currentTank.getCurrentLevel();
        currentTank.setCurrentLevel(request.getCurrentLevel());
        currentTank.setUpdatedBy(updatedBy);
        if (request.getNotes() != null) {
            currentTank.setNotes(request.getNotes());
        }
        
        TankLevel updatedTank = tankLevelRepository.save(currentTank);
        
        // Record this as a restock if level increased, or usage if decreased
        if (request.getCurrentLevel() > previousLevel) {
            TankRestockHistory history = new TankRestockHistory();
            history.setAmountLiters(request.getCurrentLevel() - previousLevel);
            history.setPreviousLevel(previousLevel);
            history.setNewLevel(request.getCurrentLevel());
            history.setRestockedBy(updatedBy);
            history.setNotes(request.getNotes() != null ? request.getNotes() : "Manual level adjustment");
            restockHistoryRepository.save(history);
        }
        
        activityLogger.log(updatedBy, "UPDATE_TANK_LEVEL", "TankLevel", updatedTank.getId(),
            "Updated water level from " + previousLevel + "L to: " + request.getCurrentLevel() + "L");
        
        log.info("Water level updated successfully to: {}L", request.getCurrentLevel());
        return updatedTank;
    }
    
    public List<TankUsageHistory> getTankUsageHistory(LocalDate startDate, LocalDate endDate) {
        return usageHistoryRepository.findByDateBetween(startDate, endDate);
    }
    
    // FIXED: Added Pageable to limit results to last 7 days
    public List<TankUsageHistory> getLast7DaysUsage() {
        Pageable pageable = PageRequest.of(0, 7);
        return usageHistoryRepository.findLast7Days(pageable);
    }
    
    public Double getAverageDailyUsage(LocalDate startDate, LocalDate endDate) {
        Double avg = usageHistoryRepository.getAverageDailyUsage(startDate, endDate);
        return avg != null ? avg : 0.0;
    }
    
    public List<TankRestockHistory> getRestockHistory() {
        return restockHistoryRepository.findAllByOrderByRestockDateDesc();
    }
    
    public DashboardStatsResponse.TankStats getTankStats() {
        TankLevel tank = getCurrentTankLevel();
        
        return DashboardStatsResponse.TankStats.builder()
            .currentLevel(tank.getCurrentLevel())
            .capacity(tank.getTankCapacity())
            .percentage(tank.getPercentage())
            .status(tank.getStatus() != null ? tank.getStatus().getDisplayName() : "Good")
            .build();
    }
}