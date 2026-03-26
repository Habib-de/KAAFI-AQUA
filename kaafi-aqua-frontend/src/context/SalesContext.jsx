import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SalesContext = createContext();

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within SalesProvider');
  }
  return context;
};

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated } = useAuth(); // Get authentication state

  // Fetch sales only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSales();
    } else {
      // Not authenticated - don't fetch, just set loading to false
      setLoading(false);
      setSales([]);
    }
  }, [isAuthenticated]); // Re-run when auth state changes

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales');
      setSales(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      setError(error.response?.data?.message || 'Failed to load sales');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  

  const addSale = async (saleData) => {
    // Check if authenticated before adding
    if (!isAuthenticated) {
      return { 
        success: false, 
        message: 'Please login to add sales'
      };
    }

    try {
      const response = await api.post('/sales', saleData);
      const newSale = response.data.data;
      setSales([newSale, ...sales]);
      return { success: true, sale: newSale };
    } catch (error) {
      console.error('Failed to add sale:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to process sale'
      };
    }
  };

  const getTodaySales = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(sale => sale.date === today);
  };

  const getTotalRevenue = () => {
    return sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
  };

  const getTodayRevenue = () => {
    const today = new Date().toISOString().split('T')[0];
    return sales
      .filter(sale => sale.date === today)
      .reduce((sum, sale) => sum + (sale.amount || 0), 0);
  };

  const getSalesByStaff = (staffName) => {
    return sales.filter(sale => sale.staff === staffName);
  };

  const getSalesBetweenDates = (startDate, endDate) => {
    return sales.filter(sale => sale.date >= startDate && sale.date <= endDate);
  };

  const value = {
    sales,
    loading,
    error,
    addSale,
    getTodaySales,
    getTotalRevenue,
    getTodayRevenue,
    getSalesByStaff,
    getSalesBetweenDates,
    refreshSales: fetchSales
  };

  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
};