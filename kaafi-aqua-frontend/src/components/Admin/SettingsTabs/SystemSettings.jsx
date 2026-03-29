import React, { useState, useEffect } from 'react';
import { Save, Settings, RefreshCw, DollarSign, Phone, Mail, AlertTriangle, Droplets, TrendingUp, Building2, Globe, Plus } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState(null);

  // Default settings to initialize if none exist
  const defaultSettings = [
    { settingKey: 'system_name', settingValue: 'KAAFI AQUA', description: 'System display name' },
    { settingKey: 'company_email', settingValue: 'info@kaafi.com', description: 'Company contact email' },
    { settingKey: 'company_phone', settingValue: '0712345678', description: 'Company contact phone' },
    { settingKey: 'currency', settingValue: 'KES', description: 'Currency symbol' },
    { settingKey: 'low_stock_threshold', settingValue: '20', description: 'Low stock alert threshold percentage' },
    { settingKey: 'tank_capacity', settingValue: '5000', description: 'Water tank capacity in liters' },
    { settingKey: 'daily_consumption_avg', settingValue: '300', description: 'Average daily water consumption in liters' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    console.log('🔍 [SystemSettings] Fetching settings from API...');
    
    try {
      const response = await api.get('/admin/settings');
      console.log('✅ [SystemSettings] API Response:', response);
      console.log('📦 [SystemSettings] Response data:', response.data);
      console.log('📋 [SystemSettings] Settings array:', response.data.data);
      
      if (response.data && response.data.data) {
        if (response.data.data.length > 0) {
          console.log(`✅ [SystemSettings] Found ${response.data.data.length} settings`);
          setSettings(response.data.data);
        } else {
          console.warn('⚠️ [SystemSettings] Settings array is empty');
          setSettings([]);
        }
      } else {
        console.warn('⚠️ [SystemSettings] No data property in response');
        setSettings([]);
      }
    } catch (error) {
      console.error('❌ [SystemSettings] Failed to fetch settings:', error);
      console.error('🔍 [SystemSettings] Error status:', error.response?.status);
      console.error('📝 [SystemSettings] Error message:', error.response?.data?.message);
      console.error('📄 [SystemSettings] Full error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
      console.log('🏁 [SystemSettings] Fetch complete, loading:', false);
    }
  };

  const initializeSettings = async () => {
    console.log('🚀 [SystemSettings] Initializing settings with defaults:', defaultSettings);
    setInitializing(true);
    setError(null);
    
    try {
      const response = await api.post('/admin/settings/initialize', defaultSettings);
      console.log('✅ [SystemSettings] Initialize response:', response);
      console.log('📦 [SystemSettings] Initialized settings:', response.data.data);
      setSettings(response.data.data);
      toast.success('System settings initialized successfully');
    } catch (error) {
      console.error('❌ [SystemSettings] Failed to initialize settings:', error);
      console.error('🔍 [SystemSettings] Error status:', error.response?.status);
      console.error('📝 [SystemSettings] Error message:', error.response?.data?.message);
      setError(error.response?.data?.message || 'Failed to initialize settings');
      toast.error(error.response?.data?.message || 'Failed to initialize settings');
    } finally {
      setInitializing(false);
    }
  };

  const handleUpdateSetting = async (key, value) => {
    console.log(`✏️ [SystemSettings] Updating setting: ${key} = ${value}`);
    setSaving(true);
    setError(null);
    
    try {
      const response = await api.put(`/admin/settings/${key}`, {
        settingValue: value
      });
      
      console.log(`✅ [SystemSettings] Update response for ${key}:`, response.data);
      
      // Update the local state
      setSettings(settings.map(setting => 
        setting.settingKey === key 
          ? { ...setting, settingValue: value, updatedAt: new Date().toISOString() }
          : setting
      ));
      
      toast.success(`${getSettingLabel(key)} updated successfully`);
      setEditingKey(null);
      setEditValue('');
    } catch (error) {
      console.error(`❌ [SystemSettings] Failed to update ${key}:`, error);
      console.error('🔍 [SystemSettings] Error status:', error.response?.status);
      console.error('📝 [SystemSettings] Error message:', error.response?.data?.message);
      setError(error.response?.data?.message || 'Failed to update setting');
      toast.error(error.response?.data?.message || 'Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  const getSettingLabel = (key) => {
    const labels = {
      'system_name': 'System Name',
      'company_email': 'Company Email',
      'company_phone': 'Company Phone',
      'currency': 'Currency',
      'low_stock_threshold': 'Low Stock Threshold',
      'tank_capacity': 'Tank Capacity',
      'daily_consumption_avg': 'Average Daily Consumption'
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSettingIcon = (key) => {
    const icons = {
      'system_name': <Building2 className="w-5 h-5 text-blue-600" />,
      'company_email': <Mail className="w-5 h-5 text-blue-600" />,
      'company_phone': <Phone className="w-5 h-5 text-blue-600" />,
      'currency': <DollarSign className="w-5 h-5 text-blue-600" />,
      'low_stock_threshold': <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      'tank_capacity': <Droplets className="w-5 h-5 text-blue-600" />,
      'daily_consumption_avg': <TrendingUp className="w-5 h-5 text-green-600" />
    };
    return icons[key] || <Settings className="w-5 h-5 text-gray-600" />;
  };

  const getSettingInputType = (key) => {
    const types = {
      'system_name': 'text',
      'company_email': 'email',
      'company_phone': 'tel',
      'currency': 'text',
      'low_stock_threshold': 'number',
      'tank_capacity': 'number',
      'daily_consumption_avg': 'number'
    };
    return types[key] || 'text';
  };

  const getSettingPlaceholder = (key) => {
    const placeholders = {
      'system_name': 'e.g., KAAFI AQUA',
      'company_email': 'e.g., info@kaafiaqua.com',
      'company_phone': 'e.g., 0712345678',
      'currency': 'e.g., KES, USD',
      'low_stock_threshold': 'Percentage (e.g., 20)',
      'tank_capacity': 'Liters (e.g., 5000)',
      'daily_consumption_avg': 'Liters per day (e.g., 300)'
    };
    return placeholders[key] || 'Enter value';
  };

  const formatDisplayValue = (key, value) => {
    if (key === 'low_stock_threshold') {
      return `${value}%`;
    }
    if (key === 'tank_capacity' || key === 'daily_consumption_avg') {
      return `${value} L`;
    }
    return value;
  };

  console.log('🎨 [SystemSettings] Rendering with state:', { 
    settingsCount: settings.length, 
    loading, 
    error,
    editingKey 
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading settings...</p>
      </div>
    );
  }

  // Show error state
  if (error && settings.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure your system preferences and business settings</p>
        </div>
        
        <div className="bg-red-50 rounded-xl p-8 text-center border border-red-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Settings</h3>
          <p className="text-red-700 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchSettings}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // Show initialization screen if no settings found
  if (settings.length === 0) {
    console.log('📭 [SystemSettings] No settings found, showing initialization screen');
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure your system preferences and business settings</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Settings Found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your system settings haven't been configured yet. Click the button below to initialize with default settings.
          </p>
          <button
            onClick={initializeSettings}
            disabled={initializing}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {initializing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>{initializing ? 'Initializing...' : 'Initialize Default Settings'}</span>
          </button>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-gray-600 font-medium mb-2">Default settings include:</p>
            <ul className="text-xs text-gray-500 space-y-1 text-left">
              <li>• System Name: KAAFI AQUA</li>
              <li>• Company Email: info@kaafi.com</li>
              <li>• Company Phone: 0712345678</li>
              <li>• Currency: KES</li>
              <li>• Low Stock Threshold: 20%</li>
              <li>• Tank Capacity: 5000 L</li>
              <li>• Daily Consumption: 300 L</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Group settings into categories
  const generalSettings = settings.filter(s => 
    ['system_name', 'company_email', 'company_phone', 'currency'].includes(s.settingKey)
  );
  
  const businessSettings = settings.filter(s => 
    ['low_stock_threshold'].includes(s.settingKey)
  );
  
  const tankSettings = settings.filter(s => 
    ['tank_capacity', 'daily_consumption_avg'].includes(s.settingKey)
  );

  console.log('📊 [SystemSettings] Categorized settings:', {
    general: generalSettings.length,
    business: businessSettings.length,
    tank: tankSettings.length
  });

  const SettingCard = ({ setting }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            {getSettingIcon(setting.settingKey)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{getSettingLabel(setting.settingKey)}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{setting.settingKey}</p>
          </div>
        </div>
        {setting.updatedAt && (
          <span className="text-xs text-gray-400">
            Updated: {new Date(setting.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      
      <div className="mb-4">
        {editingKey === setting.settingKey ? (
          <div className="space-y-3">
            <input
              type={getSettingInputType(setting.settingKey)}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={getSettingPlaceholder(setting.settingKey)}
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleUpdateSetting(setting.settingKey, editValue)}
                disabled={saving}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditingKey(null);
                  setEditValue('');
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatDisplayValue(setting.settingKey, setting.settingValue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
            </div>
            <button
              onClick={() => {
                setEditingKey(setting.settingKey);
                setEditValue(setting.settingValue);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Configure your system preferences and business settings</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* General Settings */}
      {generalSettings.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generalSettings.map(setting => (
              <SettingCard key={setting.id} setting={setting} />
            ))}
          </div>
        </div>
      )}

      {/* Business Settings */}
      {businessSettings.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Business Settings</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businessSettings.map(setting => (
              <SettingCard key={setting.id} setting={setting} />
            ))}
          </div>
        </div>
      )}

      {/* Tank Settings */}
      {tankSettings.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Droplets className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Tank Configuration</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tankSettings.map(setting => (
              <SettingCard key={setting.id} setting={setting} />
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900">About System Settings</h4>
            <p className="text-sm text-blue-800 mt-1">
              These settings control the core behavior of your system. Changes take effect immediately.
              Please ensure values are entered correctly to avoid system issues.
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>System name appears in the header and reports</li>
              <li>Email and phone are used for customer communications</li>
              <li>Low stock threshold determines when to alert for stock items</li>
              <li>Tank capacity affects water level calculations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;