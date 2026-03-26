package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.TankUsageHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TankUsageHistoryRepository extends JpaRepository<TankUsageHistory, Long> {
    
    List<TankUsageHistory> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    Optional<TankUsageHistory> findByDate(LocalDate date);
    
    @Query("SELECT AVG(t.dailyUsage) FROM TankUsageHistory t WHERE t.date BETWEEN :startDate AND :endDate")
    Double getAverageDailyUsage(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // FIXED: Removed LIMIT 7, using Pageable instead
    @Query("SELECT t FROM TankUsageHistory t ORDER BY t.date DESC")
    List<TankUsageHistory> findLast7Days(Pageable pageable);
}