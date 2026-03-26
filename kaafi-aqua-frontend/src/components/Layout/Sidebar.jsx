import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Droplets, LayoutDashboard, ShoppingCart, Users, DollarSign, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ userRole, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  
  const adminMenuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/pos', icon: ShoppingCart, label: 'POS' },
    { path: '/admin/sales', icon: BarChart3, label: 'Sales' },
    { path: '/admin/inventory/tank', icon: Droplets, label: 'Inventory' },
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
  );
};

export default Sidebar;