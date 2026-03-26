package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
//import java.util.Map;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    
    List<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Expense> findByCategory(String category);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.date BETWEEN :startDate AND :endDate")
    BigDecimal getTotalExpensesBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.date BETWEEN :startDate AND :endDate GROUP BY e.category")
    List<Object[]> getExpensesByCategory(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e.paymentMethod, SUM(e.amount) FROM Expense e WHERE e.date BETWEEN :startDate AND :endDate GROUP BY e.paymentMethod")
    List<Object[]> getExpensesByPaymentMethod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}