import React, { useState } from 'react';
import { Tag, Store, MapPin, CheckCircle } from 'lucide-react';
import { useOffers } from '../../context/OfferContext';
import { fetchApi } from '../../api/api';
import Input from '../ui/Input';
import Select from '../ui/Select';

const categories = [
  { value: 'Food & Beverages', label: 'Food & Beverages' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Groceries', label: 'Groceries' },
  { value: 'Beauty & Personal Care', label: 'Beauty & Personal Care' },
  { value: 'Home & Furniture', label: 'Home & Furniture' },
  { value: 'Pharmacy', label: 'Pharmacy' },
  { value: 'Stationery', label: 'Stationery' },
  { value: 'Sports & Fitness', label: 'Sports & Fitness' },
  { value: 'Others', label: 'Others' }
];

export default function RequestForm({ onSuccess }) {
  const { addRequest } = useOffers();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [stores, setStores] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);

  React.useEffect(() => {
    fetchApi('/requests/stores')
      .then(data => setStores(data))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // When store changes, update location dynamically natively
    if (id === 'storeName') {
      const selectedStore = stores.find(s => s.storeName === value);
      const locations = selectedStore ? [selectedStore.location] : [];
      setAvailableLocations(locations);
      setFormData(prev => ({ ...prev, storeName: value, location: locations[0] || '' }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
    
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.storeName) newErrors.storeName = 'Store Name is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.name) newErrors.name = 'Offer Name is required';
    if (!formData.category) newErrors.category = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addRequest(formData);
    setIsSubmitted(true);
    
    if (onSuccess) {
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({});
        onSuccess(formData);
      }, 3000);
    }
  };

  if (isSubmitted) {
    return (
      <div className="py-12 text-center flex flex-col items-center bg-white rounded-2xl border border-green-100 shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Your request has been sent to the store owner. If approved, it will be added to the main offers list!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Suggest a Community Offer</h3>
      
      <Select 
        id="storeName" 
        label="Select Store *" 
        icon={Store}
        value={formData.storeName || ''} 
        onChange={handleChange} 
        error={errors.storeName} 
        options={[{ value: '', label: 'Choose a distinct location first...' }, ...Array.from(new Set(stores.map(s => s.storeName))).map(name => ({ value: name, label: name }))]}
      />

      <Select 
        id="location" 
        label="Location *" 
        icon={MapPin}
        value={formData.location || ''} 
        onChange={handleChange} 
        error={errors.location} 
        options={availableLocations.map(loc => ({ value: loc, label: loc }))}
      />

      <Input 
        id="name" 
        label="Offer Name *" 
        placeholder="e.g., Buy 1 Get 1 Free on Coffees" 
        value={formData.name || ''} 
        onChange={handleChange} 
        error={errors.name} 
      />

      <Select 
        id="category" 
        label="Category *" 
        icon={Tag} 
        value={formData.category || ''} 
        onChange={handleChange} 
        error={errors.category}
        options={categories}
      />

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          className="py-2.5 px-6 bg-indigo-600 border border-transparent text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit Request
        </button>
      </div>
    </form>
  );
}
