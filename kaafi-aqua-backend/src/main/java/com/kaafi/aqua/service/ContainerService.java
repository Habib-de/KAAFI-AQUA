package com.kaafi.aqua.service;

import com.kaafi.aqua.model.ContainerType;
import com.kaafi.aqua.repository.ContainerTypeRepository;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContainerService {
    
    private final ContainerTypeRepository containerRepository;
    private final ActivityLogger activityLogger;
    
    public List<ContainerType> getAllContainers() {
        return containerRepository.findAll();
    }
    
    public ContainerType getContainerById(Long id) {
        return containerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Container not found with id: " + id));
    }
    
    public List<ContainerType> getActiveContainers() {
        return containerRepository.findByIsActive(true);
    }
    
    public List<ContainerType> getContainersByType(String type) {
        return containerRepository.findByType(type);
    }
    
    public List<ContainerType> searchContainers(String keyword) {
        return containerRepository.searchContainers(keyword);
    }
    
    @Transactional
    public ContainerType createContainer(ContainerType container) {
        // Check if container with same name exists
        if (containerRepository.existsByName(container.getName())) {
            throw new RuntimeException("Container with name '" + container.getName() + "' already exists");
        }
        
        ContainerType savedContainer = containerRepository.save(container);
        
        activityLogger.log("system", "CREATE_CONTAINER", "Container", savedContainer.getId(), 
            "Created container: " + savedContainer.getName() + " - Price: " + savedContainer.getPrice());
        
        return savedContainer;
    }
    
    @Transactional
    public ContainerType updateContainer(Long id, ContainerType containerData) {
        ContainerType container = getContainerById(id);
        
        // Check name uniqueness if name is being changed
        if (!container.getName().equals(containerData.getName()) && 
            containerRepository.existsByName(containerData.getName())) {
            throw new RuntimeException("Container with name '" + containerData.getName() + "' already exists");
        }
        
        container.setName(containerData.getName());
        container.setSize(containerData.getSize());
        container.setType(containerData.getType());
        container.setPrice(containerData.getPrice());
        container.setIsActive(containerData.getIsActive());
        
        ContainerType updatedContainer = containerRepository.save(container);
        
        activityLogger.log("system", "UPDATE_CONTAINER", "Container", id, 
            "Updated container: " + container.getName() + " - New price: " + container.getPrice());
        
        return updatedContainer;
    }
    
    @Transactional
    public void deleteContainer(Long id) {
        ContainerType container = getContainerById(id);
        
        // Check if container is being used in any sales before deleting
        // You can add this check if you have a sales repository
        
        containerRepository.delete(container);
        
        activityLogger.log("system", "DELETE_CONTAINER", "Container", id, 
            "Deleted container: " + container.getName());
    }
    
    @Transactional
    public ContainerType toggleContainerStatus(Long id) {
        ContainerType container = getContainerById(id);
        container.setIsActive(!container.getIsActive());
        
        ContainerType updatedContainer = containerRepository.save(container);
        
        activityLogger.log("system", "TOGGLE_CONTAINER_STATUS", "Container", id, 
            "Container status changed to: " + (container.getIsActive() ? "ACTIVE" : "INACTIVE"));
        
        return updatedContainer;
    }
}