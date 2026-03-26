import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { 
  Droplets, 
  LogOut, 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Settings, 
  BarChart3, 
  Menu, 
  X,
  Filter,
  Package
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SalesProvider } from './context/SalesContext';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import FirstTimeSetup from './components/Auth/FirstTimeSetup';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import StaffDashboard from './components/Dashboard/StaffDashboard';
import RefillPOS from './components/POS/RefillPOS';
import SalesHistory from './components/Sales/SalesHistory';
import TankLevel from './components/Inventory/TankLevel';
import FilterStatus from './components/Inventory/FilterStatus';
import StockManagement from './components/Inventory/StockManagement';
import ExpenseTracker from './components/Expenses/ExpenseTracker';
import UserManagement from './components/Users/UserManagement';
import ProfileSettings from './components/Users/ProfileSettings';
import toast from 'react-hot-toast';
import logoImage from './assets/profile.png';

// Layout component with sidebar
const Layout = ({ children, userRole }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
    toast.success('Logged out successfully');
  };
  
  const adminMenuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/pos', icon: ShoppingCart, label: 'POS' },
    { path: '/admin/sales', icon: BarChart3, label: 'Sales' },
    { path: '/admin/inventory/tank', icon: Droplets, label: 'Tank Level' },
    { path: '/admin/inventory/filters', icon: Filter, label: 'Filter Status' },
    { path: '/admin/inventory/stock', icon: Package, label: 'Stock Management' },
    { path: '/admin/expenses', icon: DollarSign, label: 'Expenses' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/profile', icon: Settings, label: 'Settings' },
  ];
  
  const staffMenuItems = [
    { path: '/staff', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/staff/pos', icon: ShoppingCart, label: 'POS' },
    { path: '/staff/my-sales', icon: BarChart3, label: 'My Sales' },
    { path: '/staff/inventory/tank', icon: Droplets, label: 'Tank Level' },
    { path: '/staff/profile', icon: Settings, label: 'Settings' },
  ];
  
  const menuItems = userRole === 'ADMIN' ? adminMenuItems : staffMenuItems;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden mr-4 text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Profile Image and Brand */}
              <div className="flex items-center space-x-3">
                <img 
                  src={logoImage} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/40?text=KA';
                  }}
                />
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-blue-600">KAAFI AQUA</h1>
                  <span className="text-xs text-gray-500">
                    {userRole === 'ADMIN' ? 'Administrator Panel' : 'Staff Operations Panel'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {getGreeting()}, {user?.name || 'User'}!
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole === 'ADMIN' ? 'Administrator' : 'Sales Staff'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 w-64 bg-white border-r border-gray-200 h-full lg:h-auto overflow-y-auto`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <h2 className="font-semibold text-gray-900">Menu</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole) {
    const user = JSON.parse(userStr);
    if (user.role !== requiredRole) {
      return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
    }
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SalesProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/FirstTimeSetup" element={<FirstTimeSetup />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout userRole="ADMIN">
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout userRole="ADMIN">
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout userRole="ADMIN">
                  <ProfileSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/pos" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout userRole="ADMIN">
                  <RefillPOS />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/sales" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout userRole="ADMIN">
                  <SalesHistory />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/inventory/tank" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout userRole="ADMIN">
                  <TankLevel />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/inventory/filters" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout userRole="ADMIN">
                  <FilterStatus />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/inventory/stock" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout userRole="ADMIN">
                  <StockManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/expenses" element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout userRole="ADMIN">
                  <ExpenseTracker />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Staff Routes */}
            <Route path="/staff" element={
              <ProtectedRoute requiredRole="STAFF">
                <Layout userRole="STAFF">
                  <StaffDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/staff/profile" element={
              <ProtectedRoute requiredRole="STAFF">
                <Layout userRole="STAFF">
                  <ProfileSettings />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/staff/pos" element={
              <ProtectedRoute requiredRole="STAFF">
                <Layout userRole="STAFF">
                  <RefillPOS />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/staff/my-sales" element={
              <ProtectedRoute requiredRole="STAFF">
                <Layout userRole="STAFF">
                  <SalesHistory />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/staff/inventory/tank" element={
              <ProtectedRoute requiredRole="STAFF">
                <Layout userRole="STAFF">
                  <TankLevel />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </SalesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;