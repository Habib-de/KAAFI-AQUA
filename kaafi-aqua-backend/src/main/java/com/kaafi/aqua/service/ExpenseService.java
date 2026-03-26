package com.kaafi.aqua.service;

import com.kaafi.aqua.dto.request.ExpenseRequest;
import com.kaafi.aqua.model.Expense;
import com.kaafi.aqua.repository.ExpenseRepository;
import com.kaafi.aqua.util.ActivityLogger;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    
    private final ExpenseRepository expenseRepository;
    private final ActivityLogger activityLogger;
    
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }
    
    public List<Expense> getExpensesBetweenDates(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByDateBetween(startDate, endDate);
    }
    
    public List<Expense> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(category);
    }
    
    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
    }
    
    @Transactional
    public Expense createExpense(ExpenseRequest request, String addedBy) {
        Expense expense = new Expense();
        expense.setDate(request.getDate());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setAddedBy(addedBy);
        
        Expense savedExpense = expenseRepository.save(expense);
        
        activityLogger.log(addedBy, "CREATE_EXPENSE", "Expense", savedExpense.getId(), 
            "Created expense: " + request.getCategory() + " - " + request.getAmount());
        
        return savedExpense;
    }
    
    @Transactional
    public void deleteExpense(Long id, String deletedBy) {
        Expense expense = getExpenseById(id);
        expenseRepository.delete(expense);
        
        activityLogger.log(deletedBy, "DELETE_EXPENSE", "Expense", id, 
            "Deleted expense: " + expense.getCategory() + " - " + expense.getAmount());
    }
    
    public Map<String, Object> getExpenseDashboardStats(LocalDate startDate, LocalDate endDate) {
        List<Expense> expenses = getExpensesBetweenDates(startDate, endDate);
        BigDecimal totalExpenses = expenseRepository.getTotalExpensesBetweenDates(startDate, endDate);
        List<Object[]> expensesByCategory = expenseRepository.getExpensesByCategory(startDate, endDate);
        List<Object[]> expensesByPaymentMethod = expenseRepository.getExpensesByPaymentMethod(startDate, endDate);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalExpenses", totalExpenses != null ? totalExpenses : BigDecimal.ZERO);
        stats.put("transactionCount", expenses.size());
        stats.put("expensesByCategory", expensesByCategory);
        stats.put("expensesByPaymentMethod", expensesByPaymentMethod);
        
        // Calculate average daily expense
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        BigDecimal averageDaily = totalExpenses != null ? totalExpenses.divide(BigDecimal.valueOf(daysBetween), 2, BigDecimal.ROUND_HALF_UP) : BigDecimal.ZERO;
        stats.put("averageDaily", averageDaily);
        
        return stats;
    }
}