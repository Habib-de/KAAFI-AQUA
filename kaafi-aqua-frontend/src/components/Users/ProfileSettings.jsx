import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Camera, Save, Lock, Eye, EyeOff, Bell, Shield, Globe, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    position: user?.role === 'ADMIN' ? 'System Administrator' : 'Sales Staff',
    department: 'Operations',
    joinDate: user?.joinDate || new Date().toISOString().split('T')[0],
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    salesAlerts: true,
    lowStockAlerts: true,
    systemUpdates: false
  });

  // Fetch user data from backend on mount
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/users/${user.id}`);
      const userData = response.data.data;
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        position: userData.role === 'ADMIN' ? 'System Administrator' : 'Sales Staff',
        department: 'Operations',
        joinDate: userData.joinDate || new Date().toISOString().split('T')[0],
        bio: ''
      });
      
      // Load existing profile image if any
      if (userData.profileImage) {
        const imageUrl = `http://localhost:8080${userData.profileImage}`;
        setProfileImagePreview(imageUrl);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    // Show preview immediately with proper cropping
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload image to server
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await api.post('/users/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = response.data.data.imageUrl;
      setProfileImage(imageUrl);
      
      // Update user context with new image
      if (updateProfile) {
        updateProfile({ ...user, profileImage: imageUrl });
      }
      
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
      // Revert preview on error
      fetchUserProfile();
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    
    setUploadingImage(true);
    try {
      await api.delete('/users/profile/image');
      
      setProfileImage(null);
      setProfileImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Update user context
      if (updateProfile) {
        updateProfile({ ...user, profileImage: null });
      }
      
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Failed to remove image:', error);
      toast.error('Failed to remove image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await api.put(`/users/${user.id}`, {
        username: user.username,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        role: user.role
      });
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh user data in auth context
      if (updateProfile) {
        updateProfile({ ...user, name: profileData.name, email: profileData.email, phone: profileData.phone });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      await api.put(`/users/${user.id}`, {
        username: user.username,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        role: user.role,
        password: passwordData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (key) => {
    const newValue = !notifications[key];
    setNotifications({
      ...notifications,
      [key]: newValue
    });
    
    try {
      await api.put('/users/notifications', {
        [key]: newValue
      });
      toast.success(`${key} preference updated`);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      setNotifications({
        ...notifications,
        [key]: !newValue
      });
      toast.error('Failed to update preference');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  {/* Circular container with proper styling */}
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden ring-4 ring-white/50 shadow-lg">
                    {profileImagePreview ? (
                      <img 
                        src={profileImagePreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <User className="w-10 h-10 text-blue-600" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button 
                    onClick={handleImageClick}
                    disabled={uploadingImage}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 ring-2 ring-white"
                    title="Change profile picture"
                  >
                    <Camera className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  {profileImagePreview && (
                    <button 
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 shadow-md hover:bg-red-600 transition-colors disabled:opacity-50 ring-2 ring-white"
                      title="Remove image"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{profileData.name}</h2>
                  <p className="text-blue-100 text-sm">{profileData.position}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        fetchUserProfile();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <p className="text-gray-900">{profileData.position}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.department}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Join Date
                    </label>
                    <p className="text-gray-900">{profileData.joinDate}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself"
                    />
                  ) : (
                    <p className="text-gray-600">{profileData.bio || 'No bio added yet'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Preferences */}
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Email Notifications</label>
                <button
                  onClick={() => handleNotificationChange('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Sales Alerts</label>
                <button
                  onClick={() => handleNotificationChange('salesAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.salesAlerts ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.salesAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Low Stock Alerts</label>
                <button
                  onClick={() => handleNotificationChange('lowStockAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.lowStockAlerts ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.lowStockAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">System Updates</label>
                <button
                  onClick={() => handleNotificationChange('systemUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.systemUpdates ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.systemUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                <span className="text-xs text-gray-500">Coming Soon</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Login History</span>
                <button className="text-xs text-blue-600 hover:text-blue-700">
                  View Logs
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Active Sessions</span>
                <button className="text-xs text-blue-600 hover:text-blue-700">
                  Manage
                </button>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Session</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Login:</span>
                <span className="text-gray-900">{user?.lastLogin || 'Today'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="text-gray-900">{user?.role === 'ADMIN' ? 'Administrator' : 'Sales Staff'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span className="text-gray-900">{profileData.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;