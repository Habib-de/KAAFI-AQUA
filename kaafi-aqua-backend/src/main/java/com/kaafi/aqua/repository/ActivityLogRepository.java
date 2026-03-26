package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    List<ActivityLog> findByUser(String user);
    
    List<ActivityLog> findByAction(String action);
    
    List<ActivityLog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT a FROM ActivityLog a WHERE a.user = :user ORDER BY a.createdAt DESC")
    List<ActivityLog> findRecentByUser(@Param("user") String user, Pageable pageable);
    
    @Query("SELECT a FROM ActivityLog a ORDER BY a.createdAt DESC")
    List<ActivityLog> findRecentLogs(Pageable pageable);
}