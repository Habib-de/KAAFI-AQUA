import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Search, X, Save, ToggleLeft, ToggleRight, Droplet } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const ContainersManagement = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingContainer, setEditingContainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    type: '',
    price: '',
    isActive: true  // Changed from is_active to isActive
  });

  const containerTypes = [
    { value: 'Hard Plastic', label: 'Hard Plastic' },
    { value: 'PET', label: 'PET' },
    { value: 'Plastic', label: 'Plastic' },
    { value: 'Glass', label: 'Glass' }
  ];

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    try {
      const response = await api.get('/admin/containers');
      console.log('Containers fetched:', response.data.data);
      setContainers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch containers:', error);
      toast.error('Failed to load containers');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get active status from container
  const getContainerActiveStatus = (container) => {
    if (container.isActive !== undefined) return container.isActive;
    if (container.is_active !== undefined) return container.is_active;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMISSION ===');
    console.log('formData:', formData);
    
    if (!formData.name || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    // Prepare data for backend
    const containerData = {
      name: formData.name,
      size: formData.size || null,
      type: formData.type || null,
      price: Number(formData.price),
      isActive: formData.isActive  // Send as isActive
    };
    
    console.log('Sending to backend:', containerData);

    try {
      if (editingContainer) {
        await api.put(`/admin/containers/${editingContainer.id}`, containerData);
        toast.success('Container updated successfully');
      } else {
        await api.post('/admin/containers', containerData);
        toast.success('Container created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchContainers();
    } catch (error) {
      console.error('Failed to save container:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save container');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/admin/containers/${id}`);
        toast.success('Container deleted successfully');
        fetchContainers();
      } catch (error) {
        console.error('Failed to delete container:', error);
        toast.error('Failed to delete container');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await api.patch(`/admin/containers/${id}/toggle-status`);
      console.log('Toggle status response:', response.data);
      toast.success('Container status updated');
      fetchContainers();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update container status');
    }
  };

  const openEditModal = (container) => {
    const activeStatus = getContainerActiveStatus(container);
    setEditingContainer(container);
    setFormData({
      name: container.name,
      size: container.size || '',
      type: container.type || '',
      price: container.price,
      isActive: activeStatus  // Use isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      size: '',
      type: '',
      price: '',
      isActive: true  // Use isActive
    });
    setEditingContainer(null);
  };

  const filteredContainers = containers.filter(container => {
    const matchesSearch = container.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         container.size?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || container.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Containers</h2>
          <p className="text-sm text-gray-500">Manage water containers, bottles, and jerricans</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Container</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search containers by name or size..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Types</option>
            {containerTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Containers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContainers.length > 0 ? (
          filteredContainers.map((container) => (
            <div key={container.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Droplet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{container.name}</h3>
                      <p className="text-sm text-gray-500">{container.size || 'No size specified'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(container.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      getContainerActiveStatus(container) ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={getContainerActiveStatus(container) ? 'Deactivate' : 'Activate'}
                  >
                    {getContainerActiveStatus(container) ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium text-gray-900">{container.type || 'Standard'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-semibold text-blue-600">KES {container.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      getContainerActiveStatus(container) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getContainerActiveStatus(container) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(container)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(container.id, container.name)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No containers found</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Add your first container
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Container Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingContainer ? 'Edit Container' : 'Add New Container'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Container Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Hard Bottle, PET Bottle"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 20L, 18.9L"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {containerTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingContainer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContainersManagement;