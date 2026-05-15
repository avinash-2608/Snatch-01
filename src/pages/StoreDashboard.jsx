import React, { useState, useEffect } from 'react';
import { Store, Plus, LogOut, Package, Loader2, Tag, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOffers } from '../context/OfferContext';
import { useTheme } from '../context/ThemeContext';
import OfferCard from '../components/offers/OfferCard';
import OfferForm from '../components/offers/OfferForm';
import RequestCard from '../components/offers/RequestCard';
import ProfilePanel from '../components/profile/ProfilePanel';
import Select from '../components/ui/Select';

export default function StoreDashboard() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { offers, userRequests, updateRequestStatus, fetchStoreOffers, fetchStoreRequests, isLoading } = useOffers();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const STORE_ID = user._id || 'store_1';

  useEffect(() => {
    if (user._id) {
      fetchStoreOffers(user._id);
      fetchStoreRequests(user._id);
    }
  }, [fetchStoreOffers, fetchStoreRequests, user._id]);

  const [activeTab, setActiveTab] = useState('active_offers');
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [approvingRequestId, setApprovingRequestId] = useState(null);
  const [approveFormData, setApproveFormData] = useState({});

  const offerTypes = [
  { value: 'BOGO Offer', label: 'BOGO Offer' },
  { value: 'Percentage Discount Offer', label: 'Percentage Discount Offer' },
  { value: 'Flat Discount Offer', label: 'Flat Discount Offer' },
  { value: 'Combo Offer', label: 'Combo Offer' },
  { value: 'First Order Offer', label: 'First Order Offer' },
  { value: 'Freebie Offer', label: 'Freebie Offer' }
];

const storeData = {
    role: 'store',
    id: STORE_ID,
    storeName: user.storeName || 'Snatch Deals Store',
    location: user.location || '123 Main St, City',
    phone: user.phone || '+1 234 567 890',
    email: user.email || 'store@example.com'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900/95 flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-slate-100">
                Store Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="hidden sm:flex items-center justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Post New Offer
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => setShowProfile(true)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Store className="w-4 h-4" />
              </button>

              <Link 
                to="/login"
                className="flex items-center text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 sm:hidden">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Post New Offer
          </button>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b border-gray-200 dark:border-slate-700 pb-px">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('active_offers')}
              className={`text-lg font-bold pb-3 border-b-2 transition-colors ${activeTab === 'active_offers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'}`}
            >
              Your Active Offers
            </button>
            <button
              onClick={() => setActiveTab('user_requests')}
              className={`text-lg font-bold pb-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'user_requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'}`}
            >
              User Offer Requests
              {userRequests.filter(r => r.status?.toLowerCase() === 'pending').length > 0 && (
                <span className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full">
                  {userRequests.filter(r => r.status?.toLowerCase() === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'active_offers' && (
          isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
          ) : offers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {offers.filter(o => !o.isCommunityOffer).map(offer => (
                <OfferCard key={offer._id || offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
              <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-500" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">No offers posted yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 mb-6">Attract more customers by posting your first offer!</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-xl text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Post New Offer
              </button>
            </div>
          )
        )}

        {activeTab === 'user_requests' && (
          userRequests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userRequests.map(req => (
                <RequestCard 
                  key={req.id} 
                  request={req} 
                  isStoreOwner={true} 
                  onAccept={() => {
                    setApprovingRequestId(req.id);
                    setApproveFormData({});
                  }} 
                  onReject={(id) => updateRequestStatus(id, 'Rejected')} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <Package className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No user requests</h3>
              <p className="mt-1 text-sm text-gray-500">When users submit offers for your store, they will appear here.</p>
            </div>
          )
        )}
      </main>

      {showProfile && (
        <ProfilePanel userData={storeData} onClose={() => setShowProfile(false)} />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl sticky top-0 z-10">
              <h3 className="text-xl font-bold text-gray-900">Create New Offer</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <OfferForm 
                onCancel={() => setShowModal(false)} 
                onSuccess={() => setShowModal(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Approve Request Modal */}
      {approvingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl">
              <h3 className="text-xl font-bold text-gray-900">Approve Request</h3>
              <button 
                onClick={() => setApprovingRequestId(null)}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!approveFormData.offerType) {
                  alert('Please select an offer type');
                  return;
                }
                await updateRequestStatus(approvingRequestId, 'Approved', approveFormData);
                setApprovingRequestId(null);
                alert('Request approved and offer generated!');
              }}
              className="p-6 space-y-4"
            >
              <Select
                id="offerType"
                label="Offer Type *"
                icon={Tag}
                value={approveFormData.offerType || ''}
                onChange={(e) => setApproveFormData({...approveFormData, offerType: e.target.value})}
                error={!approveFormData.offerType ? 'Offer type is required' : ''}
                options={[{ value: '', label: 'Select offer type...' }, ...offerTypes]}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="date" required className="w-full border-gray-300 rounded-xl px-3 py-2 text-sm border focus:ring-indigo-500 focus:border-indigo-500"
                    onChange={e => setApproveFormData({...approveFormData, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input type="date" required className="w-full border-gray-300 rounded-xl px-3 py-2 text-sm border focus:ring-indigo-500 focus:border-indigo-500"
                    onChange={e => setApproveFormData({...approveFormData, endDate: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea required rows={4} className="w-full border-gray-300 rounded-xl px-3 py-2 text-sm border focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Offer details and conditions..."
                  onChange={e => setApproveFormData({...approveFormData, description: e.target.value})} />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-2.5 px-4 bg-green-600 border border-transparent text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Approve & Generate Offer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
