import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Droplets, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertTriangle,
  Package,
  Calendar,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    tankLevel: 2850,
    tankCapacity: 5000,
    tankPercentage: 57,
    tankStatus: 'Good',
    activeUsers: 0,
    totalSales: 0,
    inventoryValue: 0,
    lowStockItems: 0
  });
  
  const [recentSales, setRecentSales] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [salesBySize, setSalesBySize] = useState([]);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/admin');
      const data = response.data.data;
      
      setStats({
        todaySales: data.todaySales || 0,
        todayRevenue: data.todayRevenue || 0,
        weeklyRevenue: data.weeklyRevenue || 0,
        monthlyRevenue: data.monthlyRevenue || 0,
        tankLevel: data.tankLevel || 2850,
        tankCapacity: data.tankCapacity || 5000,
        tankPercentage: data.tankPercentage || 57,
        tankStatus: data.tankStatus || 'Good',
        activeUsers: data.activeUsers || 0,
        totalSales: data.totalSales || 0,
        inventoryValue: data.inventoryValue || 0,
        lowStockItems: data.lowStockItems || 0
      });
      
      setRecentSales(data.recentSales || []);
      
      // Transform sales by size for chart
      if (data.salesBySize) {
        const sizeData = Object.entries(data.salesBySize).map(([size, count]) => ({
          size: size,
          sales: count
        }));
        setSalesBySize(sizeData);
      }
      
      // Weekly sales trend (if available from backend)
      if (data.weeklySales && data.weeklySales.length > 0) {
        setSalesData(data.weeklySales);
      } else {
        // Fallback mock data
        setSalesData([
          { day: 'Mon', sales: 320 },
          { day: 'Tue', sales: 450 },
          { day: 'Wed', sales: 380 },
          { day: 'Thu', sales: 520 },
          { day: 'Fri', sales: 480 },
          { day: 'Sat', sales: 610 },
          { day: 'Sun', sales: 430 },
        ]);
      }
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestock = async () => {
    try {
      await api.post('/tank/restock', { amountLiters: stats.tankCapacity - stats.tankLevel });
      toast.success('Tank restocked successfully!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to restock tank');
    }
  };
  
  const tankPercentage = stats.tankPercentage;
  
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'Admin'}!</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your water business today.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">KES {stats.todayRevenue.toLocaleString()}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Today's Revenue</h3>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <ArrowUp className="w-3 h-3 mr-1" /> +12% from yesterday
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.todaySales}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Today's Sales</h3>
          <p className="text-xs text-gray-500 mt-2">{stats.totalSales} total sales this month</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{Math.round(tankPercentage)}%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Tank Level</h3>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${tankPercentage < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${tankPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats.tankLevel}L / {stats.tankCapacity}L</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">Status: {stats.tankStatus}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.activeUsers}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Active Staff</h3>
          <p className="text-xs text-gray-500 mt-2">Inventory Value: KES {stats.inventoryValue?.toLocaleString() || 0}</p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Sales Trend</h2>
            <RefreshCw onClick={fetchDashboardData} className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sales by Volume</h2>
            <Package className="w-4 h-4 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesBySize.length > 0 ? salesBySize : [
              { size: '5L', sales: 0 },
              { size: '10L', sales: 0 },
              { size: '18.9L', sales: 0 },
              { size: '20L', sales: 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="size" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {sale.date}<br />
                      <span className="text-xs text-gray-500">{sale.time}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{sale.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{sale.size}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">KES {sale.amount}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${sale.method === 'M-Pesa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {sale.method}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    No recent sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Low Stock Alert */}
      {tankPercentage < 20 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-800">Low Water Level Alert!</p>
              <p className="text-xs text-red-600">Tank is at {Math.round(tankPercentage)}% capacity. Please restock soon.</p>
            </div>
          </div>
          <button 
            onClick={handleRestock}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Restock Now
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;