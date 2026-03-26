package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.Sale;
import com.kaafi.aqua.enums.PaymentMethod;
//import com.kaafi.aqua.enums.SaleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    
    List<Sale> findByDate(LocalDate date);
    
    List<Sale> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Sale> findByStaff(String staff);
    
    List<Sale> findByCustomerContaining(String customer);
    
    List<Sale> findByMethod(PaymentMethod method);
    
    Page<Sale> findByDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    @Query("SELECT SUM(s.amount) FROM Sale s WHERE s.date = :date")
    BigDecimal getTotalRevenueByDate(@Param("date") LocalDate date);
    
    @Query("SELECT SUM(s.amount) FROM Sale s WHERE s.date BETWEEN :startDate AND :endDate")
    BigDecimal getTotalRevenueBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.date = :date")
    Long getTotalSalesCountByDate(@Param("date") LocalDate date);
    
    @Query("SELECT s.size, SUM(s.quantity) as total FROM Sale s WHERE s.date BETWEEN :startDate AND :endDate GROUP BY s.size")
    List<Object[]> getSalesBySizeBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT s.method, SUM(s.amount) FROM Sale s WHERE s.date BETWEEN :startDate AND :endDate GROUP BY s.method")
    List<Object[]> getRevenueByPaymentMethod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT s.staff, COUNT(s), SUM(s.amount) FROM Sale s WHERE s.date BETWEEN :startDate AND :endDate GROUP BY s.staff")
    List<Object[]> getStaffPerformance(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}