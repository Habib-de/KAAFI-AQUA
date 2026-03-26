package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.TankRestockHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TankRestockHistoryRepository extends JpaRepository<TankRestockHistory, Long> {
    List<TankRestockHistory> findAllByOrderByRestockDateDesc();
}