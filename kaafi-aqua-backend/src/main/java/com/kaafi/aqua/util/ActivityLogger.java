package com.kaafi.aqua.util;

import com.kaafi.aqua.model.ActivityLog;
import com.kaafi.aqua.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogger {
    
    private final ActivityLogRepository activityLogRepository;
    
    public void log(String user, String action, String entityType, Long entityId, String details) {
        try {
            ActivityLog log = new ActivityLog();
            log.setUser(user);
            log.setAction(action);
            log.setEntityType(entityType);
            log.setEntityId(entityId);
            log.setDetails(details);
            
            activityLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to log activity: {}", e.getMessage());
        }
    }
}