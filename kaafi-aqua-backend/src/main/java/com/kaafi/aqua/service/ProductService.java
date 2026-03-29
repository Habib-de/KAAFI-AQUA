package com.kaafi.aqua.service;

import com.kaafi.aqua.model.Product;
import com.kaafi.aqua.model.ProductCategory;
import com.kaafi.aqua.repository.ProductRepository;
import com.kaafi.aqua.repository.ProductCategoryRepository;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final ActivityLogger activityLogger;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }
    
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }
    
    public List<Product> getActiveProducts() {
        return productRepository.findByIsActive(true);
    }
    
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword);
    }
    
    @Transactional
    public Product createProduct(Product product) {
        // Verify category exists
        ProductCategory category = categoryRepository.findById(product.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        Product savedProduct = productRepository.save(product);
        
        activityLogger.log("system", "CREATE_PRODUCT", "Product", savedProduct.getId(), 
            "Created product: " + savedProduct.getName() + " - Price: " + savedProduct.getPrice());
        
        return savedProduct;
    }
    
    @Transactional
    public Product updateProduct(Long id, Product productData) {
        Product product = getProductById(id);
        
        product.setName(productData.getName());
        product.setCategoryId(productData.getCategoryId());
        product.setSize(productData.getSize());
        product.setUnit(productData.getUnit());
        product.setPrice(productData.getPrice());
        product.setIsActive(productData.getIsActive());
        
        Product updatedProduct = productRepository.save(product);
        
        activityLogger.log("system", "UPDATE_PRODUCT", "Product", id, 
            "Updated product: " + product.getName() + " - New price: " + product.getPrice());
        
        return updatedProduct;
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
        
        activityLogger.log("system", "DELETE_PRODUCT", "Product", id, 
            "Deleted product: " + product.getName());
    }
    
    public List<ProductCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public ProductCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }
}