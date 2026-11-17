import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, User, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../assets/profile.png';
import loginBg from '../../assets/login3.jpg';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [inactiveError, setInactiveError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setInactiveError(false);
    
    const result = await login(formData.username, formData.password);
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Login successful!');
      if (result.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/staff');
      }
    } else {
      if (result.message.includes('inactive')) {
        setInactiveError(true);
      }
      toast.error(result.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setInactiveError(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      {/* Desktop-only background image */}
      <div
        className="hidden lg:block absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginBg})` }}
        aria-hidden="true"
      />
      <div className="hidden lg:block absolute inset-0 bg-[#0B2A3C]/40" aria-hidden="true" />

      <div className="relative z-10 max-w-md w-full bg-white rounded-2xl shadow-xl lg:shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-b from-cyan-100 via-cyan-50 to-white border-t-4 border-cyan-600 pt-4 pb-3 px-6 text-center relative">
          
          {/* BACK BUTTON INSIDE THE CARD */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 p-1.5 text-cyan-700 bg-white/60 hover:bg-white rounded-full transition-colors shadow-sm"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="mx-auto mb-3 flex justify-center mt-2">
            <img 
              src={logoImage} 
              alt="KAAFI AQUA" 
              className="w-40 sm:w-48 h-auto object-contain mix-blend-multiply"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <div class="w-40 h-20 flex items-center justify-center">
                    <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                  </div>
                `;
              }}
            />
          </div>
          <p className="text-sm font-medium text-cyan-700 mb-2">Pure Bliss in Every Sip</p>
        </div>
        
        <div className="bg-white px-6 pb-5">
          {/* Inactive Account Alert */}
          {inactiveError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Account Inactive</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Your account has been deactivated. Please contact your administrator to reactivate your account.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-9 w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-9 w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          {/* Additional Links */}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full text-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Forgot Password?
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/FirstTimeSetup')}
              className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span>Create New Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;