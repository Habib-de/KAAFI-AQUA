import React, { useState, useEffect } from 'react';
import { Droplets, AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TankLevel = () => {
  const [tankLevel, setTankLevel] = useState(2850);
  const [targetLevel, setTargetLevel] = useState(5000);
  const [percentage, setPercentage] = useState(57);
  const [status, setStatus] = useState('Good');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState(false);
  
  // Fetch tank data on component mount
  useEffect(() => {
    fetchTankData();
    fetchTankHistory();
  }, []);
  
  const fetchTankData = async () => {
    try {
      const response = await api.get('/tank/current');
      const data = response.data.data;
      setTankLevel(data.currentLevel);
      setTargetLevel(data.tankCapacity);
      setPercentage(data.percentage || (data.currentLevel / data.tankCapacity * 100));
      setStatus(data.status?.displayName || (data.percentage > 70 ? 'Good' : data.percentage > 30 ? 'Moderate' : 'Critical'));
    } catch (error) {
      console.error('Failed to fetch tank data:', error);
      toast.error('Failed to load tank data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTankHistory = async () => {
    try {
      const response = await api.get('/tank/usage/last7days');
      const data = response.data.data;
      
      // Format history for display
      const formattedHistory = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        level: item.level
      }));
      setHistory(formattedHistory);
    } catch (error) {
      console.error('Failed to fetch tank history:', error);
      // Use mock data as fallback
      setHistory([
        { date: 'Mar 24', level: tankLevel },
        { date: 'Mar 23', level: tankLevel + 300 },
        { date: 'Mar 22', level: tankLevel + 600 },
        { date: 'Mar 21', level: tankLevel + 900 },
        { date: 'Mar 20', level: tankLevel + 1200 },
        { date: 'Mar 19', level: tankLevel + 1500 },
      ]);
    }
  };
  
  const handleAddWater = async (liters) => {
    setRestocking(true);
    try {
      const response = await api.post('/tank/restock', {
        amountLiters: liters,
        notes: 'Restocked from dashboard'
      });
      
      const newLevel = response.data.data.currentLevel;
      setTankLevel(newLevel);
      setPercentage((newLevel / targetLevel) * 100);
      setStatus(response.data.data.status?.displayName || 
        (newLevel / targetLevel * 100 > 70 ? 'Good' : newLevel / targetLevel * 100 > 30 ? 'Moderate' : 'Critical'));
      
      toast.success(`Successfully added ${liters}L of water`);
      
      // Refresh history after restock
      fetchTankHistory();
    } catch (error) {
      console.error('Failed to restock tank:', error);
      toast.error(error.response?.data?.message || 'Failed to restock tank');
    } finally {
      setRestocking(false);
    }
  };
  
  const handleFillToFull = async () => {
    const remainingCapacity = targetLevel - tankLevel;
    if (remainingCapacity <= 0) {
      toast.error('Tank is already full!');
      return;
    }
    await handleAddWater(remainingCapacity);
  };
  
  const estimatedDays = Math.floor(tankLevel / 300);
  const tankPercentage = percentage;
  const remainingCapacity = targetLevel - tankLevel;
  
  const getStatusColor = () => {
    if (tankPercentage > 70) return 'text-green-600';
    if (tankPercentage > 30) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getStatusText = () => {
    return status;
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tank Level Monitor</h1>
        <p className="text-gray-600 mt-1">Monitor and manage water tank levels</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Tank Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Droplets className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Current Tank Status</h2>
            </div>
            <RefreshCw 
              onClick={fetchTankData} 
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
            />
          </div>
          
          {/* Tank Visualization */}
          <div className="relative mb-6">
            <div className="bg-gray-100 rounded-lg h-64 overflow-hidden">
              <div 
                className="bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                style={{ height: `${Math.min(100, Math.max(0, tankPercentage))}%`, width: '100%' }}
              >
                <div className="flex items-center justify-center h-full text-white font-bold">
                  {Math.round(tankPercentage)}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Level</p>
              <p className="text-2xl font-bold text-gray-900">{tankLevel}L</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Capacity</p>
              <p className="text-2xl font-bold text-gray-900">{targetLevel}L</p>
            </div>
          </div>
          
          <div className={`mb-6 p-4 rounded-lg ${tankPercentage < 30 ? 'bg-red-50' : 'bg-blue-50'}`}>
            <p className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</p>
            {tankPercentage < 30 && (
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Estimated {estimatedDays} days of water remaining
              </p>
            )}
            {tankPercentage > 90 && (
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <Droplets className="w-3 h-3 mr-1" />
                Tank is nearly full. Only {remainingCapacity}L remaining capacity.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => handleAddWater(500)}
              disabled={restocking}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {restocking ? 'Adding...' : 'Add 500L'}
            </button>
            <button
              onClick={() => handleAddWater(1000)}
              disabled={restocking}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {restocking ? 'Adding...' : 'Add 1000L'}
            </button>
            <button
              onClick={handleFillToFull}
              disabled={restocking || tankPercentage >= 100}
              className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                tankPercentage >= 100
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>
                {tankPercentage >= 100 
                  ? 'Tank Full' 
                  : `Fill to Full (${remainingCapacity}L needed)`}
              </span>
            </button>
          </div>
        </div>
        
        {/* Usage History & Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Usage</h2>
            <div className="space-y-3">
              {history.length > 0 ? (
                history.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{day.date}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(day.level / targetLevel) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{day.level}L</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No usage history available
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Consumption Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Level</span>
                <span className="font-medium text-gray-900">{tankLevel}L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining Capacity</span>
                <span className="font-medium text-gray-900">{remainingCapacity}L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Percentage Remaining</span>
                <span className="font-medium text-gray-900">{Math.round(tankPercentage)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${getStatusColor()}`}>{status}</span>
              </div>
              {tankPercentage < 30 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Days Left</span>
                  <span className="font-medium text-red-600">{estimatedDays} days</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TankLevel;