package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.StockMovementHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementHistoryRepository extends JpaRepository<StockMovementHistory, Long> {
    List<StockMovementHistory> findByStockItemIdOrderByMovementDateDesc(Long stockItemId);
}