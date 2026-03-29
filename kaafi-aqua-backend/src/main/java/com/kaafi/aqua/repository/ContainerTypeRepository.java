package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.ContainerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContainerTypeRepository extends JpaRepository<ContainerType, Long> {
    
    List<ContainerType> findByIsActive(Boolean isActive);
    
    List<ContainerType> findByType(String type);
    
    @Query("SELECT c FROM ContainerType c WHERE c.name LIKE %:keyword% OR c.size LIKE %:keyword% OR c.type LIKE %:keyword%")
    List<ContainerType> searchContainers(@Param("keyword") String keyword);
    
    Optional<ContainerType> findByNameAndSize(String name, String size);
    
    boolean existsByName(String name);
}