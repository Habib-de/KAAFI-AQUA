package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    
    Optional<ProductCategory> findByType(String type);
    
    List<ProductCategory> findByTypeContaining(String type);
}