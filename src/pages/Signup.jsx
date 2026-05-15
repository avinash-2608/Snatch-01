import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, User, Calendar, Users, Store, MapPin, Phone, ShieldAlert, CheckCircle } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Tabs from '../components/ui/Tabs';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { fetchApi } from '../api/api';

const roles = [
  { id: 'customer', label: 'Customer' },
  { id: 'store', label: 'Store Owner' }
];

export default function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialRole = location.state?.role || 'customer';
  const [role, setRole] = useState(initialRole === 'admin' ? 'customer' : initialRole);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: '' }));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setFormData({});
    setErrors({});
    setIsSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (role === 'customer') {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.age) newErrors.age = 'Age is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    } else if (role === 'store') {
      if (!formData.storeName) newErrors.storeName = 'Store name is required';
      if (!formData.location) newErrors.location = 'Location is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    }

    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await fetchApi('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ ...formData, role })
      });
      
      setIsSubmitted(true);
      if (role === 'customer') {
        setTimeout(() => {
          navigate('/login', { state: { role: 'customer' } });
        }, 2000);
      }
    } catch (err) {
      setErrors({ email: err.message });
    }
  };

  return (
    <AuthLayout 
      title={`Join Snatch`} 
      subtitle="Start discovering local deals today."
    >
      <Tabs tabs={roles} activeTab={role} onChange={handleRoleChange} />
      
      {isSubmitted ? (
        <div className="py-8 text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Account created successfully</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 max-w-sm">
            {role === 'store' 
              ? 'Your account has been submitted for verification. The admin will review your details and enable your account shortly.'
              : 'Redirecting you to the login page...'
            }
          </p>
          {role === 'store' && (
            <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm font-medium border border-yellow-200 dark:border-yellow-700 shadow-sm">
              Status: Pending Approval
            </div>
          )}
          <Link 
            to="/login" state={{ role: 'store' }} 
            className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-semibold rounded-xl text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Login
          </Link>
        </div>
      ) : (
        <>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {role === 'customer' && (
              <>
                <Input id="name" label="Full Name" icon={User} placeholder="John Doe" value={formData.name || ''} onChange={handleChange} error={errors.name} />
                <div className="grid grid-cols-2 gap-4">
                  <Input id="age" label="Age" type="number" icon={Calendar} placeholder="25" value={formData.age || ''} onChange={handleChange} error={errors.age} />
                  <Select 
                    id="gender" 
                    label="Gender" 
                    icon={Users} 
                    value={formData.gender || ''} 
                    onChange={handleChange} 
                    error={errors.gender}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer_not', label: 'Prefer not to say' }
                    ]}
                  />
                </div>
              </>
            )}

            {role === 'store' && (
              <>
                <Input id="storeName" label="Store Name" icon={Store} placeholder="Snatch Deals Store" value={formData.storeName || ''} onChange={handleChange} error={errors.storeName} />
                <Input id="location" label="Location" icon={MapPin} placeholder="123 Main St, City" value={formData.location || ''} onChange={handleChange} error={errors.location} />
                <Input id="phone" label="Phone Number" icon={Phone} placeholder="+1 234 567 890" value={formData.phone || ''} onChange={handleChange} error={errors.phone} />
              </>
            )}

            <Input id="email" label="Email Address" type="email" icon={Mail} placeholder="you@example.com" value={formData.email || ''} onChange={handleChange} error={errors.email} />
            <Input id="password" label="Password" type="password" icon={Lock} placeholder="••••••••" value={formData.password || ''} onChange={handleChange} error={errors.password} />
            <Input id="confirmPassword" label="Confirm Password" type="password" icon={Lock} placeholder="••••••••" value={formData.confirmPassword || ''} onChange={handleChange} error={errors.confirmPassword} />

            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-6"
            >
              Create {role === 'customer' ? 'Customer' : 'Store'} Account
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" state={{ role }} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
