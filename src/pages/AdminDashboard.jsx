import React, { useState, useEffect } from 'react';
import { Shield, Users, Store, LogOut, Crown, Tag, Trash2, Loader2, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ApprovalCard from '../components/admin/ApprovalCard';
import { fetchApi } from '../api/api';
import { useTheme } from '../context/ThemeContext';

export default function AdminDashboard() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('approval');
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribers state
  const [subscribers, setSubscribers] = useState([]);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);

  // Offers state
  const [offers, setOffers] = useState([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  // Store owners state
  const [storeOwners, setStoreOwners] = useState([]);
  const [isLoadingStoreOwners, setIsLoadingStoreOwners] = useState(false);

  // Fetch pending stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        const data = await fetchApi('/admin/pending-stores');
        setStores(data.map(s => ({ ...s, id: s._id, status: 'Pending' })));
      } catch(err) {
        console.error('Failed to fetch pending stores', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStores();
  }, []);

  // Fetch subscribers when tab is active
  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    }
  }, [activeTab]);

  // Fetch offers when tab is active
  useEffect(() => {
    if (activeTab === 'offers') {
      fetchOffers();
    }
  }, [activeTab]);

  // Fetch store owners when tab is active
  useEffect(() => {
    if (activeTab === 'storeOwners') {
      fetchStoreOwners();
    }
  }, [activeTab]);

  const fetchSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
      const data = await fetchApi('/admin/subscribers');
      setSubscribers(data);
    } catch (err) {
      console.error('Failed to fetch subscribers', err);
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  const fetchOffers = async () => {
    setIsLoadingOffers(true);
    try {
      const data = await fetchApi('/admin/offers');
      setOffers(data);
    } catch (err) {
      console.error('Failed to fetch offers', err);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const fetchStoreOwners = async () => {
    setIsLoadingStoreOwners(true);
    try {
      const data = await fetchApi('/admin/store-owners');
      setStoreOwners(data);
    } catch (err) {
      console.error('Failed to fetch store owners', err);
    } finally {
      setIsLoadingStoreOwners(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await fetchApi(`/admin/approve/${id}`, { method: 'PUT' });
      setStores(stores.filter(store => store.id !== id));
      alert('Store approved successfully');
    } catch(err) {
      alert('Failed to approve store');
    }
  };

  const handleReject = async (id) => {
    try {
      await fetchApi(`/admin/reject/${id}`, { method: 'DELETE' });
      setStores(stores.filter(store => store.id !== id));
      alert('Store rejected successfully');
    } catch(err) {
      alert('Failed to reject store');
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    try {
      await fetchApi(`/admin/offers/${offerId}`, { method: 'DELETE' });
      setOffers(offers.filter(offer => offer._id !== offerId));
      alert('Offer deleted successfully');
    } catch (err) {
      alert('Failed to delete offer');
    }
  };

  const handleDeleteStoreOwner = async (ownerId) => {
    if (!confirm('Are you sure you want to delete this store owner? All their offers will also be deleted.')) return;
    try {
      await fetchApi(`/admin/store-owners/${ownerId}`, { method: 'DELETE' });
      setStoreOwners(storeOwners.filter(owner => owner._id !== ownerId));
      alert('Store owner and their offers deleted successfully');
    } catch (err) {
      alert('Failed to delete store owner');
    }
  };

  const handleToggleGoldExclusive = async (offerId, currentStatus) => {
    try {
      const res = await fetchApi(`/admin/offers/${offerId}/gold-exclusive`, { method: 'PATCH' });
      setOffers(offers.map(offer => 
        offer._id === offerId ? { ...offer, isGoldExclusive: res.isGoldExclusive } : offer
      ));
      alert(res.message);
    } catch (err) {
      alert('Failed to toggle Gold Exclusive status');
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900/95 flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">
                Snatch Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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

      <div className="flex-1 max-w-[1600px] mx-auto w-full px-2 sm:px-4 lg:px-8 py-6 flex flex-col md:flex-row gap-4 lg:gap-6">
        
        {/* Sidebar */}
        <aside className="w-full md:w-56 lg:w-60 shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('approval')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'approval'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <Store className={`mr-3 h-5 w-5 ${activeTab === 'approval' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Store Owner Approval
              {stores.filter(s => s.status === 'Pending').length > 0 && (
                <span className="ml-auto bg-indigo-100 text-indigo-600 py-0.5 px-2 rounded-full text-xs font-semibold">
                  {stores.filter(s => s.status === 'Pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'subscribers'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <Crown className={`mr-3 h-5 w-5 ${activeTab === 'subscribers' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Subscribers
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'offers'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <Tag className={`mr-3 h-5 w-5 ${activeTab === 'offers' ? 'text-indigo-500' : 'text-gray-400'}`} />
              All Offers
            </button>
            <button
              onClick={() => setActiveTab('storeOwners')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'storeOwners'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className={`mr-3 h-5 w-5 ${activeTab === 'storeOwners' ? 'text-indigo-500' : 'text-gray-400'}`} />
              Store Owners
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeTab === 'approval' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Store Owner Approval</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Review and manage store owner verification requests.</p>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">Loading pending requests...</p>
                </div>
              ) : stores.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                  <Store className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-500" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">No stores found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">There are no pending requests to review right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {stores.map(store => (
                    <ApprovalCard 
                      key={store.id} 
                      store={store} 
                      onApprove={handleApprove} 
                      onReject={handleReject} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscribers Tab */}
          {activeTab === 'subscribers' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Snatch Gold Subscribers</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">View all premium subscribers and their subscription details.</p>
              </div>

              {isLoadingSubscribers ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
                  <Loader2 className="w-10 h-10 mx-auto text-indigo-600 animate-spin" />
                  <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">Loading subscribers...</p>
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                  <Crown className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-500" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">No subscribers yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">No Snatch Gold subscribers found.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Subscribed Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                              {subscriber.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                              {subscriber.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100">
                                {subscriber.plan}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                              {formatDate(subscriber.subscribedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Offers Tab */}
          {activeTab === 'offers' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">All Offers</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage all offers from stores and customers.</p>
              </div>

              {isLoadingOffers ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
                  <Loader2 className="w-10 h-10 mx-auto text-indigo-600 animate-spin" />
                  <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">Loading offers...</p>
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                  <Tag className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-500" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">No offers found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">There are no offers in the system.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200 dark:divide-slate-700 table-fixed">
                      <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-1/3 sm:w-[25%] lg:w-[22%]">Title</th>
                          <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-[25%] lg:w-[28%]">Description</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-[20%] sm:w-24 lg:w-28">Type</th>
                          <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-[20%] sm:w-24 lg:w-32">Category</th>
                          <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-24">Gold</th>
                          <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-28">Created By</th>
                          <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-32 lg:w-40">Store</th>
                          <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-28 lg:w-36">Dates</th>
                          <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider w-16 sm:w-20">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {offers.map((offer) => (
                          <tr key={offer._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-2 sm:px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">
                              <div className="flex flex-col gap-1">
                                <span className="truncate block" title={offer.title}>{offer.title}</span>
                                {offer.isGoldExclusive && (
                                  <span className="w-max px-1.5 py-0.5 text-[10px] leading-tight font-semibold rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100 xl:hidden">
                                    Gold
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                              <div className="truncate block" title={offer.description}>
                                {offer.description}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3">
                              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 inline-flex text-[10px] sm:text-xs leading-tight sm:leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 truncate max-w-full" title={offer.offerType}>
                                {offer.offerType}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                              <div className="truncate block" title={offer.category}>
                                {offer.category}
                              </div>
                            </td>
                            <td className="hidden xl:table-cell px-4 py-3">
                              {offer.isGoldExclusive ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100">
                                  Yes
                                </span>
                              ) : (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
                                  No
                                </span>
                              )}
                            </td>
                            <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                              <div className="truncate block capitalize" title={offer.createdBy}>
                                {offer.createdBy}
                              </div>
                            </td>
                            <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                              <div className="truncate block" title={offer.storeId?.storeName || offer.storeId?.name || 'N/A'}>
                                {offer.storeId?.storeName || offer.storeId?.name || 'N/A'}
                              </div>
                            </td>
                            <td className="hidden xl:table-cell px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                              <div className="flex flex-col text-xs gap-0.5">
                                <span className="truncate block" title={`Start: ${offer.startDate}`}>S: {offer.startDate}</span>
                                <span className="truncate block" title={`End: ${offer.endDate}`}>E: {offer.endDate}</span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3 text-sm font-medium">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <button
                                  onClick={() => handleToggleGoldExclusive(offer._id, offer.isGoldExclusive)}
                                  className={`p-1 rounded transition-colors ${
                                    offer.isGoldExclusive 
                                      ? 'text-amber-600 hover:text-amber-900 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-500 dark:hover:bg-amber-900' 
                                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700'
                                  }`}
                                  title={offer.isGoldExclusive ? 'Remove Gold Exclusive' : 'Make Gold Exclusive'}
                                >
                                  <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOffer(offer._id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:text-red-500 dark:hover:bg-red-900"
                                  title="Delete Offer"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Store Owners Tab */}
          {activeTab === 'storeOwners' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Store Owners</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage all registered store owners. Deleting a store owner will also delete all their offers.</p>
              </div>

              {isLoadingStoreOwners ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
                  <Loader2 className="w-10 h-10 mx-auto text-indigo-600 animate-spin" />
                  <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">Loading store owners...</p>
                </div>
              ) : storeOwners.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                  <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-500" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">No store owners found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">There are no registered store owners.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Store Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Created At</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {storeOwners.map((owner) => (
                          <tr key={owner._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
                              {owner.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                              {owner.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                              {owner.storeName || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                              {formatDate(owner.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteStoreOwner(owner._id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors dark:text-red-400 dark:hover:text-red-500 dark:hover:bg-red-900"
                                title="Delete Store Owner"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
