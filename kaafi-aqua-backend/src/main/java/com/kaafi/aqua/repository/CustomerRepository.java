package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByPhone(String phone);
    
    Optional<Customer> findByName(String name);
    
    List<Customer> findByLastRefillDateBefore(LocalDate date);
    
    @Query("SELECT c FROM Customer c WHERE c.creditBalance > 0 ORDER BY c.creditBalance DESC")
    List<Customer> findCustomersWithCredit();
    
    @Query("SELECT c FROM Customer c WHERE c.lastRefillDate <= :date ORDER BY c.lastRefillDate ASC")
    List<Customer> findInactiveCustomers(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.lastRefillDate >= :date")
    Long countActiveCustomers(@Param("date") LocalDate date);
}