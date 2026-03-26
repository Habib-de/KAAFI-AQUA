import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../context/SalesContext';
import api from '../../services/api';
import { 
  Droplets, 
  ShoppingCart, 
  ClipboardList, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const { sales, getTodaySales, getTodayRevenue, refreshSales } = useSales();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    todaySales: 0,
    todayRevenue: 0,
    totalSalesThisMonth: 0,
    tankLevel: 2850,
    tankCapacity: 5000,
    tankPercentage: 57,
    tankStatus: 'Good',
    mySales: 0,
    myRevenue: 0
  });
  
  const [myRecentSales, setMyRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tankLoading, setTankLoading] = useState(false);
  
  useEffect(() => {
    fetchDashboardData();
    fetchTankData();
  }, [user]);
  
  useEffect(() => {
    // Update staff sales when sales context changes
    if (sales.length > 0 && user) {
      updateStaffStats();
    }
  }, [sales, user]);
  
  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/staff');
      const data = response.data.data;
      
      setStats(prev => ({
        ...prev,
        todaySales: data.todaySales || 0,
        todayRevenue: data.todayRevenue || 0,
        mySales: data.totalSales || 0,
      }));
      
      setMyRecentSales(data.recentSales || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTankData = async () => {
    setTankLoading(true);
    try {
      const response = await api.get('/tank/current');
      const data = response.data.data;
      setStats(prev => ({
        ...prev,
        tankLevel: data.currentLevel,
        tankCapacity: data.tankCapacity,
        tankPercentage: data.percentage || (data.currentLevel / data.tankCapacity * 100),
        tankStatus: data.status?.displayName || (data.percentage > 70 ? 'Good' : data.percentage > 30 ? 'Moderate' : 'Critical')
      }));
    } catch (error) {
      console.error('Failed to fetch tank data:', error);
    } finally {
      setTankLoading(false);
    }
  };
  
  const updateStaffStats = () => {
    const staffSales = sales.filter(sale => sale.staff === user?.name);
    const today = new Date().toISOString().split('T')[0];
    const todayStaffSales = staffSales.filter(sale => sale.date === today);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthSales = sales.filter(sale => sale.date.startsWith(currentMonth));
    
    setStats(prev => ({
      ...prev,
      todaySales: getTodaySales().length,
      todayRevenue: getTodayRevenue(),
      totalSalesThisMonth: monthSales.length,
      mySales: staffSales.length,
      myRevenue: staffSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
    }));
    
    setMyRecentSales(staffSales.slice(0, 5));
  };
  
  const formatMethod = (method) => {
    if (method === 'CASH') return 'Cash';
    if (method === 'M_PESA') return 'M-Pesa';
    return method;
  };
  
  const tankPercentage = stats.tankPercentage;
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.name || 'Staff'}!
        </h1>
        <p className="text-gray-600 mt-1">Ready to serve our customers today?</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.todaySales}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Today's Sales</h3>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <ArrowUp className="w-3 h-3 mr-1" /> 
            {stats.todaySales > 0 ? `${Math.round((stats.todaySales / (stats.totalSalesThisMonth || 1)) * 100)}%` : '0%'} of monthly target
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">KES {stats.todayRevenue.toLocaleString()}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Today's Revenue</h3>
          <p className="text-xs text-gray-500 mt-2">From {stats.todaySales} transactions</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 p-3 rounded-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.mySales}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">My Total Sales</h3>
          <p className="text-xs text-gray-500 mt-2">KES {stats.myRevenue.toLocaleString()} total value</p>
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
                style={{ width: `${Math.min(100, Math.max(0, tankPercentage))}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats.tankLevel}L / {stats.tankCapacity}L</p>
            <p className={`text-xs mt-1 ${tankPercentage < 30 ? 'text-red-500' : tankPercentage > 70 ? 'text-green-500' : 'text-yellow-500'}`}>
              Status: {stats.tankStatus}
            </p>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/staff/pos" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
          <ShoppingCart className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">New Refill</h3>
          <p className="text-blue-100 text-sm">Process a water refill sale</p>
          <div className="mt-4 text-sm font-semibold">Start Sale →</div>
        </Link>
        
        <Link to="/staff/my-sales" className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
          <ClipboardList className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">My Sales</h3>
          <p className="text-green-100 text-sm">View your sales history</p>
          <div className="mt-4 text-sm font-semibold">View Sales →</div>
        </Link>
        
        <Link to="/staff/inventory/tank" className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all transform hover:scale-105">
          <Droplets className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Tank Level</h3>
          <p className="text-yellow-100 text-sm">Check current water levels</p>
          <div className="mt-4 text-sm font-semibold">Check Status →</div>
        </Link>
      </div>
      
      {/* Recent Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">My Recent Sales</h2>
          <Link to="/staff/my-sales" className="text-sm text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myRecentSales.length > 0 ? (
                myRecentSales.map((sale) => (
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <ShoppingCart className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">No sales yet</p>
                      <Link to="/staff/pos" className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                        Make your first sale →
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Daily Tip */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Daily Tip</p>
            <p className="text-xs text-blue-700 mt-1">
              Remember to always verify the customer's payment before dispensing water. 
              For M-Pesa payments, wait for confirmation message.
            </p>
          </div>
        </div>
      </div>
      
      {/* Low Stock Alert */}
      {tankPercentage < 20 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-800">Low Water Level Alert!</p>
              <p className="text-xs text-red-600">Tank is at {Math.round(tankPercentage)}% capacity. Please notify admin.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/staff/inventory/tank')}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Check Tank
          </button>
        </div>
      )}
      
      {/* Refresh Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            fetchDashboardData();
            fetchTankData();
            refreshSales();
          }}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
};

export default StaffDashboard;