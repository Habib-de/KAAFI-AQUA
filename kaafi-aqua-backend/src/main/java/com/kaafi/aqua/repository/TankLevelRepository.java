package com.kaafi.aqua.repository;

import com.kaafi.aqua.model.TankLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface TankLevelRepository extends JpaRepository<TankLevel, Long> {
    
    Optional<TankLevel> findTopByOrderByIdDesc();
    
    @Modifying
    @Transactional
    @Query("UPDATE TankLevel t SET t.currentLevel = :newLevel, t.updatedBy = :updatedBy WHERE t.id = :id")
    int updateTankLevel(@Param("id") Long id, @Param("newLevel") Integer newLevel, @Param("updatedBy") String updatedBy);
    
    @Query("SELECT t.currentLevel FROM TankLevel t WHERE t.id = (SELECT MAX(t2.id) FROM TankLevel t2)")
    Integer getCurrentLevel();
}