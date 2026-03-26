package com.kaafi.aqua.service;

import com.kaafi.aqua.model.Filter;
import com.kaafi.aqua.model.FilterMaintenanceLog;
import com.kaafi.aqua.repository.FilterRepository;
import com.kaafi.aqua.repository.FilterMaintenanceLogRepository;
import com.kaafi.aqua.enums.FilterStatus;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FilterService {
    
    private final FilterRepository filterRepository;
    private final FilterMaintenanceLogRepository maintenanceLogRepository;
    private final ActivityLogger activityLogger;
    
    public List<Filter> getAllFilters() {
        return filterRepository.findAll();
    }
    
    public Filter getFilterById(Long id) {
        return filterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Filter not found with id: " + id));
    }
    
    public List<Filter> getFiltersByStatus(FilterStatus status) {
        return filterRepository.findByStatus(status);
    }
    
    public List<Filter> getCriticalFilters() {
        return filterRepository.findCriticalFilters();
    }
    
    public List<Filter> getWarningFilters() {
        return filterRepository.findWarningFilters();
    }
    
    public Map<String, Object> getFilterDashboardStats() {
        List<Filter> allFilters = filterRepository.findAll();
        List<Filter> critical = getCriticalFilters();
        List<Filter> warning = getWarningFilters();
        
        double overallHealth = allFilters.stream()
            .mapToInt(Filter::getPercentage)
            .average()
            .orElse(0.0);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFilters", allFilters.size());
        stats.put("criticalCount", critical.size());
        stats.put("warningCount", warning.size());
        stats.put("goodCount", allFilters.size() - critical.size() - warning.size());
        stats.put("overallHealth", Math.round(overallHealth));
        
        return stats;
    }
    
    @Transactional
    public Filter updateFilterStatus(Long id, FilterStatus status, Integer percentage, String updatedBy) {
        Filter filter = getFilterById(id);
        filter.setStatus(status);
        filter.setPercentage(percentage);
        
        if (status == FilterStatus.GOOD && percentage > 70) {
            filter.setLastChanged(LocalDate.now());
        }
        
        Filter updatedFilter = filterRepository.save(filter);
        
        activityLogger.log(updatedBy, "UPDATE_FILTER", "Filter", id, 
            "Updated filter: " + filter.getName() + " to status: " + status + ", percentage: " + percentage);
        
        return updatedFilter;
    }
    
    @Transactional
    public FilterMaintenanceLog addMaintenanceLog(String filterName, String action, String technician, String notes, String performedBy) {
        FilterMaintenanceLog log = new FilterMaintenanceLog();
        log.setFilterName(filterName);
        log.setAction(action);
        log.setTechnician(technician);
        log.setMaintenanceDate(LocalDate.now());
        log.setNotes(notes);
        
        FilterMaintenanceLog savedLog = maintenanceLogRepository.save(log);
        
        activityLogger.log(performedBy, "ADD_MAINTENANCE_LOG", "Filter", null, 
            "Added maintenance log for filter: " + filterName + " - " + action);
        
        return savedLog;
    }
    
    public List<FilterMaintenanceLog> getMaintenanceLogs() {
        return maintenanceLogRepository.findAllByOrderByMaintenanceDateDesc();
    }
    
    public List<FilterMaintenanceLog> getMaintenanceLogsByFilter(String filterName) {
        return maintenanceLogRepository.findByFilterNameOrderByMaintenanceDateDesc(filterName);
    }
}