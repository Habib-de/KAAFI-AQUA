import React, { useState, useEffect } from 'react';
import { Search, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSales } from '../../context/SalesContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SalesHistory = () => {
  const { sales, refreshSales } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [loading, setLoading] = useState(false);
  const [userMap, setUserMap] = useState({});

  // Fetch users to map username to full name and role
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch sales on component mount
  useEffect(() => {
    refreshSales();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const userList = response.data.data;
      
      // Create a map: username -> { name, roleDisplay }
      const map = {};
      userList.forEach(user => {
        map[user.username] = {
          name: user.name,
          roleDisplay: user.role === 'ADMIN' ? 'Administrator' : 'Sales Staff'
        };
      });
      setUserMap(map);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Get user info by username
  const getUserInfo = (username) => {
    return userMap[username] || { name: username, roleDisplay: '' };
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || 
      (filterMethod === 'Cash' && sale.method === 'CASH') ||
      (filterMethod === 'M-Pesa' && sale.method === 'M_PESA');
    
    const today = new Date();
    const saleDate = new Date(sale.date);
    
    if (dateRange === 'today') {
      return matchesSearch && matchesMethod && saleDate.toDateString() === today.toDateString();
    } else if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      return matchesSearch && matchesMethod && saleDate >= weekAgo;
    } else if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      return matchesSearch && matchesMethod && saleDate >= monthAgo;
    }
    
    return matchesSearch && matchesMethod;
  });
  
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
  const totalTransactions = filteredSales.length;
  
  const formatMethod = (method) => {
    if (method === 'CASH') return 'Cash';
    if (method === 'M_PESA') return 'M-Pesa';
    return method;
  };
  
  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredSales.map(sale => {
      const userInfo = getUserInfo(sale.staff);
      return {
        'Date': sale.date,
        'Time': sale.time,
        'Customer': sale.customer,
        'Size': sale.size,
        'Quantity': sale.quantity,
        'Amount (KES)': sale.amount,
        'Payment Method': formatMethod(sale.method),
        'Staff Name': userInfo.name,
        'Staff Role': userInfo.roleDisplay,
        'Status': sale.status
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales History');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `sales_history_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported to Excel successfully!');
  };
  
  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('KAAFI AQUA - Sales History Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Revenue: KES ${totalRevenue.toLocaleString()}`, 14, 38);
    doc.text(`Total Transactions: ${totalTransactions}`, 14, 46);
    
    const tableData = filteredSales.map(sale => {
      const userInfo = getUserInfo(sale.staff);
      return [
        sale.date,
        sale.time,
        sale.customer,
        sale.size,
        sale.quantity.toString(),
        `KES ${sale.amount}`,
        formatMethod(sale.method),
        userInfo.name,
        userInfo.roleDisplay,
        sale.status
      ];
    });
    
    autoTable(doc, {
      startY: 54,
      head: [['Date', 'Time', 'Customer', 'Size', 'Qty', 'Amount', 'Method', 'Staff', 'Role', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 7 },
      bodyStyles: { fontSize: 6 },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 15 },
        2: { cellWidth: 28 },
        3: { cellWidth: 10 },
        4: { cellWidth: 8 },
        5: { cellWidth: 18 },
        6: { cellWidth: 15 },
        7: { cellWidth: 25 },
        8: { cellWidth: 18 },
        9: { cellWidth: 12 }
      }
    });
    
    doc.save(`sales_history_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Exported to PDF successfully!');
  };
  
  const getDateRangeLabel = () => {
    switch(dateRange) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Time';
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-600 mt-1">View and manage all water refill transactions</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">KES {totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{getDateRangeLabel()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
          <p className="text-xs text-gray-500 mt-1">{getDateRangeLabel()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-600 mb-1">Average Sale</p>
          <p className="text-2xl font-bold text-gray-900">KES {totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0}</p>
          <p className="text-xs text-gray-500 mt-1">Per transaction</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="M-Pesa">M-Pesa</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>
            
            <button
              onClick={exportToPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => {
                  const userInfo = getUserInfo(sale.staff);
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {sale.date}<br />
                        <span className="text-xs text-gray-500">{sale.time}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{sale.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{sale.size}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{sale.quantity}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">KES {sale.amount}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${sale.method === 'M_PESA' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {formatMethod(sale.method)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{userInfo.name}</div>
                          <div className="text-xs text-gray-500">{userInfo.roleDisplay}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <p className="text-gray-500">No sales found for the selected filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;