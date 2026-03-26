import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Droplets, CreditCard, DollarSign, CheckCircle, User } from 'lucide-react';
import { useSales } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';

const RefillPOS = () => {
  const { addSale, getTodayRevenue, refreshSales } = useSales();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerName, setCustomerName] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Refresh sales when component mounts to get latest data
  //useEffect(() => {
    //refreshSales();
  //}, [refreshSales]);
  
  const products = [
    { size: '5L', price: 15, icon: '🥤' },
    { size: '10L', price: 25, icon: '🧴' },
    { size: '18.9L', price: 45, icon: '💧' },
    { size: '20L', price: 50, icon: '🚰' }
  ];
  
  const calculateTotal = () => {
    if (!selectedSize) return 0;
    return selectedSize.price * quantity;
  };
  
  // Get today's revenue from context
  const todayRevenue = getTodayRevenue();
  
  const handleSale = async () => {
    if (!selectedSize) {
      toast.error('Please select a container size');
      return;
    }
    
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    
    setProcessing(true);
    
    try {
      const saleData = {
        customer: customerName,
        size: selectedSize.size,
        quantity: quantity,
        amount: calculateTotal(),
        method: paymentMethod
      };
      
      const result = await addSale(saleData);
      
      if (result.success) {
        toast.success(`Sale complete! ${quantity}x ${selectedSize.size} water refill - KES ${calculateTotal()}`);
        
        // Reset form
        setSelectedSize(null);
        setQuantity(1);
        setCustomerName('');
        setPaymentMethod('CASH');
        
        // Refresh sales to update today's revenue
        await refreshSales();
      } else {
        toast.error(result.message);
      }
      
    } catch (error) {
      console.error('Sale failed:', error);
      toast.error(error.response?.data?.message || 'Failed to process sale. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
        <p className="text-gray-600 mt-1">Process water refill transactions</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Container Size</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <button
                  key={product.size}
                  onClick={() => setSelectedSize(product)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSize?.size === product.size
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{product.icon}</div>
                  <div className="font-semibold text-gray-900">{product.size}</div>
                  <div className="text-sm text-gray-600">KES {product.price}</div>
                </button>
              ))}
            </div>
            
            {/* Customer Name Input */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="pl-9 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter customer name"
                  required
                />
              </div>
            </div>
            
            {selectedSize && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Payment Section */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            {selectedSize ? (
              <>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">{customerName || 'Not entered'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Item:</span>
                    <span className="font-medium">{quantity}x {selectedSize.size}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Unit Price:</span>
                    <span>KES {selectedSize.price}</span>
                  </div>
                  <div className="flex justify-between py-2 text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">KES {calculateTotal()}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('CASH')}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 ${
                        paymentMethod === 'CASH'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <DollarSign className="w-5 h-5" />
                      <span>Cash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('M_PESA')}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 ${
                        paymentMethod === 'M_PESA'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>M-Pesa</span>
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={handleSale}
                  disabled={processing}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Complete Sale'}
                </button>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Droplets className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Select a container size to start</p>
              </div>
            )}
          </div>
          
          {/* Quick Stats - NOW DYNAMIC */}
          <div className="mt-6 bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">Today's Sales</span>
              <span className="text-xl font-bold text-blue-900">KES {todayRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Active Staff</span>
              <span className="text-xl font-bold text-blue-900">{user?.name || 'Staff'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefillPOS;