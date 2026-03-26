package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.Filter;
import com.kaafi.aqua.enums.FilterStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface FilterRepository extends JpaRepository<Filter, Long> {
    
    List<Filter> findByStatus(FilterStatus status);
    
    List<Filter> findByType(String type);
    
    @Query("SELECT f FROM Filter f WHERE f.percentage < 30")
    List<Filter> findCriticalFilters();
    
    @Query("SELECT f FROM Filter f WHERE f.percentage BETWEEN 30 AND 70")
    List<Filter> findWarningFilters();
    
    @Modifying
    @Transactional
    @Query("UPDATE Filter f SET f.status = :status, f.percentage = :percentage WHERE f.id = :id")
    int updateFilterStatus(@Param("id") Long id, @Param("status") FilterStatus status, @Param("percentage") Integer percentage);
}