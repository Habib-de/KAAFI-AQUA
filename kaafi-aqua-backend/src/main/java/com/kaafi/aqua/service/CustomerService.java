package com.kaafi.aqua.service;

import com.kaafi.aqua.model.Customer;
import com.kaafi.aqua.repository.CustomerRepository;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final ActivityLogger activityLogger;
    
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
    
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
    }
    
    public Customer getCustomerByPhone(String phone) {
        return customerRepository.findByPhone(phone)
            .orElse(null);
    }
    
    public Customer getCustomerByName(String name) {
        return customerRepository.findByName(name)
            .orElse(null);
    }
    
    @Transactional
    public Customer createCustomer(Customer customer) {
        // Check if customer already exists by phone
        if (customer.getPhone() != null && !customer.getPhone().isEmpty()) {
            Customer existing = customerRepository.findByPhone(customer.getPhone()).orElse(null);
            if (existing != null) {
                throw new RuntimeException("Customer with phone " + customer.getPhone() + " already exists");
            }
        }
        
        Customer savedCustomer = customerRepository.save(customer);
        activityLogger.log("system", "CREATE_CUSTOMER", "Customer", savedCustomer.getId(), 
            "Created customer: " + savedCustomer.getName());
        
        return savedCustomer;
    }
    
    @Transactional
    public Customer updateCustomer(Long id, Customer customerData) {
        Customer customer = getCustomerById(id);
        
        customer.setName(customerData.getName());
        customer.setPhone(customerData.getPhone());
        customer.setEmail(customerData.getEmail());
        customer.setCreditBalance(customerData.getCreditBalance());
        
        Customer updatedCustomer = customerRepository.save(customer);
        
        activityLogger.log("system", "UPDATE_CUSTOMER", "Customer", id, 
            "Updated customer: " + customer.getName());
        
        return updatedCustomer;
    }
    
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
        
        activityLogger.log("system", "DELETE_CUSTOMER", "Customer", id, 
            "Deleted customer: " + customer.getName());
    }
    
    public List<Customer> getInactiveCustomers(int days) {
        LocalDate cutoffDate = LocalDate.now().minusDays(days);
        return customerRepository.findInactiveCustomers(cutoffDate);
    }
    
    public List<Customer> getCustomersWithCredit() {
        return customerRepository.findCustomersWithCredit();
    }
    
    @Transactional
    public Customer updateCustomerAfterSale(Long customerId, BigDecimal amount, boolean isCredit) {
        Customer customer = getCustomerById(customerId);
        customer.setTotalRefills(customer.getTotalRefills() + 1);
        customer.setTotalSpent(customer.getTotalSpent().add(amount));
        customer.setLastRefillDate(LocalDate.now());
        
        if (isCredit) {
            customer.setCreditBalance(customer.getCreditBalance().add(amount));
            log.info("Added credit of {} to customer {}. New balance: {}", 
                amount, customer.getName(), customer.getCreditBalance());
        }
        
        return customerRepository.save(customer);
    }
    
    @Transactional
    public Customer createCustomerFromSale(String name, String phone) {
        Customer customer = new Customer();
        customer.setName(name);
        customer.setPhone(phone);
        customer.setTotalRefills(0);
        customer.setTotalSpent(BigDecimal.ZERO);
        customer.setCreditBalance(BigDecimal.ZERO);
        return customerRepository.save(customer);
    }
    
    @Transactional
    public void updateCreditBalance(Long customerId, BigDecimal amountPaid) {
        Customer customer = getCustomerById(customerId);
        BigDecimal newBalance = customer.getCreditBalance().subtract(amountPaid);
        
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            newBalance = BigDecimal.ZERO;
        }
        
        customer.setCreditBalance(newBalance);
        customerRepository.save(customer);
        
        activityLogger.log("system", "UPDATE_CREDIT", "Customer", customerId, 
            "Updated credit balance to: " + newBalance);
    }
}