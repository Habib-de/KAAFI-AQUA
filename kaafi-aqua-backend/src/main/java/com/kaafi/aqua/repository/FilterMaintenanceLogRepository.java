package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.FilterMaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FilterMaintenanceLogRepository extends JpaRepository<FilterMaintenanceLog, Long> {
    List<FilterMaintenanceLog> findAllByOrderByMaintenanceDateDesc();
    List<FilterMaintenanceLog> findByFilterNameOrderByMaintenanceDateDesc(String filterName);
}