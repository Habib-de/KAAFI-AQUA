package com.kaafi.aqua.service;

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