import React, { useState, useEffect } from 'react';
import { Droplets, AlertTriangle, CheckCircle, RefreshCw, Filter, Activity, Plus, Edit } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FilterStatus = () => {
  const [filters, setFilters] = useState([]);
  const [maintenanceLog, setMaintenanceLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({
    filterName: '',
    action: '',
    technician: '',
    notes: ''
  });
  const [updateData, setUpdateData] = useState({
    status: '',
    percentage: 100,
    notes: ''
  });
  
  const [stats, setStats] = useState({
    totalFilters: 0,
    overallHealth: 0,
    warningCount: 0,
    criticalCount: 0,
    goodCount: 0
  });

  useEffect(() => {
    fetchFilters();
    fetchMaintenanceLogs();
  }, []);

  const fetchFilters = async () => {
    try {
      const response = await api.get('/filters');
      setFilters(response.data.data);
      
      const total = response.data.data.length;
      const critical = response.data.data.filter(f => f.percentage < 30).length;
      const warning = response.data.data.filter(f => f.percentage >= 30 && f.percentage < 70).length;
      const good = total - critical - warning;
      const overall = Math.round(response.data.data.reduce((sum, f) => sum + f.percentage, 0) / total);
      
      setStats({
        totalFilters: total,
        overallHealth: overall,
        warningCount: warning,
        criticalCount: critical,
        goodCount: good
      });
    } catch (error) {
      console.error('Failed to fetch filters:', error);
      toast.error('Failed to load filter data');
    }
  };

  const fetchMaintenanceLogs = async () => {
    try {
      const response = await api.get('/filters/maintenance-logs');
      setMaintenanceLog(response.data.data);
    } catch (error) {
      console.error('Failed to fetch maintenance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    
    if (!maintenanceData.filterName || !maintenanceData.action || !maintenanceData.technician) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await api.post('/filters/maintenance-log', null, {
        params: {
          filterName: maintenanceData.filterName,
          action: maintenanceData.action,
          technician: maintenanceData.technician,
          notes: maintenanceData.notes
        }
      });
      
      toast.success('Maintenance log added successfully!');
      setShowMaintenanceModal(false);
      setMaintenanceData({ filterName: '', action: '', technician: '', notes: '' });
      fetchMaintenanceLogs();
      
    } catch (error) {
      console.error('Failed to add maintenance log:', error);
      toast.error(error.response?.data?.message || 'Failed to add maintenance log');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFilter = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await api.put(`/filters/${selectedFilter.id}/update`, null, {
        params: {
          status: updateData.status,
          percentage: updateData.percentage,
          notes: updateData.notes
        }
      });
      
      toast.success(`Filter ${selectedFilter.name} updated successfully!`);
      setShowUpdateModal(false);
      setSelectedFilter(null);
      setUpdateData({ status: '', percentage: 100, notes: '' });
      fetchFilters(); // Refresh the list
      fetchMaintenanceLogs(); // Refresh maintenance logs
      
    } catch (error) {
      console.error('Failed to update filter:', error);
      toast.error(error.response?.data?.message || 'Failed to update filter');
    } finally {
      setSubmitting(false);
    }
  };

  const openUpdateModal = (filter) => {
    setSelectedFilter(filter);
    setUpdateData({
      status: filter.status,
      percentage: filter.percentage,
      notes: ''
    });
    setShowUpdateModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'GOOD': return 'text-green-600 bg-green-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDisplayStatus = (status) => {
    switch(status) {
      case 'GOOD': return 'Good';
      case 'WARNING': return 'Warning';
      case 'CRITICAL': return 'Critical';
      default: return status;
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage > 70) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (status) => {
    if (status === 'GOOD') return <CheckCircle className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Filter Status</h1>
          <p className="text-gray-600 mt-1">Monitor and manage water filtration system</p>
        </div>
        <button
          onClick={() => setShowMaintenanceModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Maintenance</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Filter className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.totalFilters}</span>
          </div>
          <p className="text-sm text-gray-600">Active Filters</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.overallHealth}%</span>
          </div>
          <p className="text-sm text-gray-600">Overall Health</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div className={`h-1 rounded-full ${getPercentageColor(stats.overallHealth)}`} style={{ width: `${stats.overallHealth}%` }}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.warningCount}</span>
          </div>
          <p className="text-sm text-gray-600">Need Attention</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.criticalCount}</span>
          </div>
          <p className="text-sm text-gray-600">Critical</p>
        </div>
      </div>

      {/* Filters Grid - Made clickable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {filters.map((filter) => (
          <div 
            key={filter.id} 
            onClick={() => openUpdateModal(filter)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Droplets className="w-6 h-6 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">{filter.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{filter.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(filter.status)}`}>
                  {getDisplayStatus(filter.status)}
                </span>
                <Edit className="w-4 h-4 text-gray-400 hover:text-blue-500" />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Lifespan Remaining</span>
                <span className="font-medium">{filter.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getPercentageColor(filter.percentage)}`}
                  style={{ width: `${filter.percentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Last Changed</p>
                <p className="font-medium text-gray-900">{filter.lastChanged}</p>
              </div>
              <div>
                <p className="text-gray-500">Expected Lifespan</p>
                <p className="font-medium text-gray-900">{filter.lifespan} days</p>
              </div>
            </div>
            
            {filter.percentage < 30 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-800 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Replace immediately! Filter efficiency is critically low.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Maintenance Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Maintenance Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {maintenanceLog.length > 0 ? (
                maintenanceLog.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{log.maintenanceDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.filterName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{log.technician}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-500">
                    No maintenance logs available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Add Maintenance Log</h2>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddMaintenance} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter Name *</label>
                <select
                  required
                  value={maintenanceData.filterName}
                  onChange={(e) => setMaintenanceData({...maintenanceData, filterName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Filter</option>
                  {filters.map(filter => (
                    <option key={filter.id} value={filter.name}>{filter.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action *</label>
                <select
                  required
                  value={maintenanceData.action}
                  onChange={(e) => setMaintenanceData({...maintenanceData, action: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Action</option>
                  <option value="Replaced">Replaced</option>
                  <option value="Cleaned">Cleaned</option>
                  <option value="Inspected">Inspected</option>
                  <option value="Repaired">Repaired</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician *</label>
                <input
                  type="text"
                  required
                  value={maintenanceData.technician}
                  onChange={(e) => setMaintenanceData({...maintenanceData, technician: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter technician name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={maintenanceData.notes}
                  onChange={(e) => setMaintenanceData({...maintenanceData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Additional notes (optional)"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Filter Modal */}
      {showUpdateModal && selectedFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Update Filter: {selectedFilter.name}</h2>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateFilter} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Percentage</label>
                <p className="text-lg font-semibold text-gray-900">{selectedFilter.percentage}%</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status *</label>
                <select
                  required
                  value={updateData.status}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GOOD">Good</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Percentage *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={updateData.percentage}
                  onChange={(e) => setUpdateData({...updateData, percentage: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={updateData.notes}
                  onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Maintenance notes (optional)"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Filter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterStatus;