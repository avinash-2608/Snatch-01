import React, { useState } from 'react';
import { Tag, Calendar, AlignLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useOffers } from '../../context/OfferContext';
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

const offerTypes = [
  { value: 'BOGO Offer', label: 'BOGO Offer' },
  { value: 'Percentage Discount Offer', label: 'Percentage Discount Offer' },
  { value: 'Flat Discount Offer', label: 'Flat Discount Offer' },
  { value: 'Combo Offer', label: 'Combo Offer' },
  { value: 'First Order Offer', label: 'First Order Offer' },
  { value: 'Freebie Offer', label: 'Freebie Offer' }
];

export default function OfferForm({ onCancel, onSuccess }) {
  const { addOffer } = useOffers();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.offerType) newErrors.offerType = 'Offer type is required';
    if (!formData.name) newErrors.name = 'Offer name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.description) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await addOffer(formData);
      setIsSubmitted(true);
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setErrors({ form: err.message || 'Failed to publish offer' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="py-12 text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Offer Posted Successfully</h3>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Your offer is now live and visible to customers on the Snatch platform.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({});
            if (onCancel) onCancel(); // Actually calling onCancel properly as an exit strategy if they click close manually instead of waiting
          }}
          className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
        >
          Close window
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="category"
        label="Category *"
        icon={Tag}
        value={formData.category || ''}
        onChange={handleChange}
        error={errors.category}
        options={categories}
      />

      <Select
        id="offerType"
        label="Offer Type *"
        icon={Tag}
        value={formData.offerType || ''}
        onChange={handleChange}
        error={errors.offerType}
        options={[{ value: '', label: 'Select offer type...' }, ...offerTypes]}
      />

      <Input 
        id="name" 
        label="Offer Name *" 
        placeholder="e.g., Buy 1 Get 1 Free, 50% off up to ₹500" 
        value={formData.name || ''} 
        onChange={handleChange} 
        error={errors.name} 
      />

      <div className="grid grid-cols-2 gap-4">
        <Input 
          id="startDate" 
          label="Start Date *" 
          type="date"
          icon={Calendar} 
          value={formData.startDate || ''} 
          onChange={handleChange} 
          error={errors.startDate} 
        />
        <Input 
          id="endDate" 
          label="End Date *" 
          type="date"
          icon={Calendar} 
          value={formData.endDate || ''} 
          onChange={handleChange} 
          error={errors.endDate} 
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <div className="relative rounded-xl shadow-sm">
          <div className="absolute top-3 left-0 pl-3 pointer-events-none text-gray-400">
            <AlignLeft className="h-5 w-5" />
          </div>
          <textarea
            id="description"
            rows={4}
            className={`
              block w-full rounded-xl sm:text-sm transition-all duration-200 ease-in-out resize-none
              bg-gray-50/50 focus:bg-white border pl-10 pr-4 py-3
              ${errors.description 
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-opacity-50
            `}
            placeholder="Enter terms, conditions, and details about the offer"
            value={formData.description || ''}
            onChange={handleChange}
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 animate-pulse">{errors.description}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 px-4 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex justify-center items-center py-2.5 px-4 bg-indigo-600 border border-transparent text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
          ) : (
            'Publish Offer'
          )}
        </button>
      </div>
    </form>
  );
}
