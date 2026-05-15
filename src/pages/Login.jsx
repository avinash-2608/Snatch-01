import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Tabs from '../components/ui/Tabs';
import Input from '../components/ui/Input';
import { fetchApi } from '../api/api';

const roles = [
  { id: 'customer', label: 'Customer' },
  { id: 'store', label: 'Store Owner' },
  { id: 'admin', label: 'Admin' }
];

export default function Login() {
  const [role, setRole] = useState('customer');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      const requestBody = { ...formData, role };
      console.log('Sending:', requestBody);
      
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response:', data);
      
      let userData;
      if (data.user) {
        userData = data.user;
      } else if (data._id) {
        userData = data;
      } else {
        alert(data.message || 'Login failed');
        return;
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      if (userData.role === 'admin') {
        navigate('/admin');
      } else if (userData.role === 'store') {
        navigate('/store');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Invalid credentials');
    }
  };

  return (
    <AuthLayout 
      title={`Sign in to Snatch`} 
      subtitle="Discover the best local deals today."
    >
      <Tabs tabs={roles} activeTab={role} onChange={(newRole) => {
        setRole(newRole);
        setLoginError('');
      }} />
      
      {role === 'admin' && (
        <div className="mb-6 glass-card p-4 rounded-xl flex items-start gap-3 border-l-4 border-amber-400">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-sm text-amber-800 dark:text-amber-200 flex-1">
            <p className="font-semibold">Admin access only</p>
            <p className="mt-1 opacity-80 text-xs">Please use your authorized credentials to access the admin portal.</p>
          </div>
        </div>
      )}

      {loginError && (
        <div className="mb-6 glass-card p-4 rounded-xl border-l-4 border-red-500 bg-red-50/80 dark:bg-red-900/20">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {loginError}
          </p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input 
          id="email" 
          label="Email Address" 
          type="email" 
          icon={Mail} 
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        
        <div>
          <Input 
            id="password" 
            label="Password" 
            type="password" 
            icon={Lock} 
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <div className="flex items-center justify-end mt-1">
            <button type="button" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
              Forgot password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex justify-center items-center text-base mt-2"
        >
          Sign in
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      {role !== 'admin' && (
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-slate-400">
          Not registered yet?{' '}
          <Link to="/signup" state={{ role }} className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 hover:opacity-80 transition-opacity">
            Create an account
          </Link>
        </p>
      )}

      <div className="mt-8 text-center sm:text-left">
        <p className="text-xs text-gray-400 dark:text-slate-500 font-medium tracking-wide uppercase">Quick Nav (Demo)</p>
        <div className="mt-2 flex justify-center sm:justify-start gap-4 text-sm">
          <Link to="/store" className="text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Store Dashboard</Link>
          <Link to="/customer" className="text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Customer Dashboard</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
