import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Tag, Search, Crown, User, Loader2, Users, MessageCircle, X, Send, Plus, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useOffers } from '../context/OfferContext';
import { useTheme } from '../context/ThemeContext';
import OfferCard from '../components/offers/OfferCard';
import UpgradeModal from '../components/subscription/UpgradeModal';
import RequestForm from '../components/offers/RequestForm';
import RequestCard from '../components/offers/RequestCard';
import ProfilePanel from '../components/profile/ProfilePanel';
import Navbar from '../components/layout/Navbar';
import { fetchApi } from '../api/api';

const categories = [
  'All',
  'Food & Beverages',
  'Clothing',
  'Electronics',
  'Groceries',
  'Beauty & Personal Care',
  'Home & Furniture',
  'Pharmacy',
  'Stationery',
  'Sports & Fitness',
  'Others'
];

export default function CustomerDashboard() {
  useTheme(); // Initialize theme context
  const { offers, userRequests, fetchAllOffers, fetchUserRequests, isLoading } = useOffers();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGoldMember, setIsGoldMember] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('available_offers');
  const [showProfile, setShowProfile] = useState(false);
  
  // Split offers state
  const [userSplits, setUserSplits] = useState({ active: [], pending: [], matched: [], history: [] });
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [isLoadingSplits, setIsLoadingSplits] = useState(false);
  
  useEffect(() => {
    console.log('CustomerDashboard: Initial load effect running');
    fetchAllOffers();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('CustomerDashboard: User from localStorage:', { userId: user._id });
    if (user._id) {
      fetchUserRequests(user._id);
      fetchUserSplits(user._id);
    } else {
      console.warn('CustomerDashboard: No user._id found, skipping fetchUserRequests and fetchUserSplits');
    }
    if (user.isPremium) setIsGoldMember(true);
  }, [fetchAllOffers, fetchUserRequests]); // Include dependencies to fix lint warning

  // Fetch user splits
  const fetchUserSplits = async (userId) => {
    if (!userId) {
      console.warn('fetchUserSplits: userId is undefined/null, skipping API call');
      return;
    }
    console.log('fetchUserSplits: Fetching for userId:', userId);
    setIsLoadingSplits(true);
    try {
      const data = await fetchApi(`/splits/user/${userId}`);
      console.log('fetchUserSplits: Received data:', data);
      setUserSplits(data);
    } catch (e) {
      console.error('fetchUserSplits: Failed to fetch splits', e);
    } finally {
      setIsLoadingSplits(false);
    }
  };

  // Open chat for a split - fetch messages from database
  const openChat = async (split) => {
    if (!split || !split.id) {
      console.warn('openChat: split or split.id is undefined, aborting');
      return;
    }
    console.log('openChat: Opening chat for split:', split.id);
    setSelectedSplit(split);
    try {
      const data = await fetchApi(`/api/messages/${split.id}`);
      console.log('openChat: Received messages:', data.messages?.length || 0);
      setChatMessages(data.messages || []);
      setShowChatModal(true);
    } catch (e) {
      console.error('openChat: Failed to load chat', e);
    }
  };

  // Send message - store in database
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSplit || !selectedSplit.id) {
      console.warn('sendMessage: Missing required data', { 
        hasMessage: !!newMessage.trim(), 
        hasSelectedSplit: !!selectedSplit, 
        splitId: selectedSplit?.id 
      });
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user._id) {
      console.warn('sendMessage: No user._id found');
      return;
    }

    console.log('sendMessage: Sending message to split:', selectedSplit.id);
    try {
      await fetchApi('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          splitId: selectedSplit.id,
          senderId: user._id,
          senderName: user.name || user.email || 'Anonymous',
          message: newMessage.trim()
        })
      });

      // Refresh messages from database
      const data = await fetchApi(`/api/messages/${selectedSplit.id}`);
      setChatMessages(data.messages || []);
      setNewMessage('');
    } catch (e) {
      console.error('sendMessage: Failed to send message', e);
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const CUSTOMER_ID = user._id || 'customer_session_123';
  const customerData = {
    role: 'customer',
    id: CUSTOMER_ID,
    name: user.name || 'Alex Customer',
    email: user.email || 'alex@example.com',
    age: user.age || 26,
    gender: user.gender || 'Male',
    snatchTokens: user.snatchTokens || 0
  };

  const customerRequests = userRequests; // the context already isolates based on endpoint or we can assume state is localized!

  const filteredOffers = offers.filter(offer => {
    const matchesCategory = selectedCategory === 'All' || offer.category === selectedCategory;
    const matchesSearch = offer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          offer.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const navigate = useNavigate();

  // Custom Navbar actions
  const navbarActions = (
    <>
      <div className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-300 bg-white/10 py-1.5 px-3 rounded-full backdrop-blur-sm border border-white/10">
        <MapPin className="w-4 h-4 text-indigo-400" />
        Current Location
      </div>
      <button
        onClick={() => navigate('/pay-bills')}
        className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white py-2 px-3 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Pay Bills</span>
      </button>
      {isGoldMember ? null : (
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white py-2 px-3 rounded-full shadow-lg shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <Crown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Go Gold</span>
        </button>
      )}
      <button 
        onClick={() => setShowProfile(true)}
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all hover:scale-105 border border-white/10"
      >
        <User className="w-4 h-4" />
      </button>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Modern Navbar */}
      <Navbar 
        title="Snatch" 
        subtitle="Discover amazing deals"
        icon={Tag}
        isGoldMember={isGoldMember}
        actions={navbarActions}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
        
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab('available_offers')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'available_offers' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
          >
            Available Offers
          </button>
          <button
            onClick={() => setActiveTab('split_offers')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'split_offers' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
          >
            Split Offers
            {userSplits.active.length > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {userSplits.active.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('post_request')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'post_request' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
          >
            Post Request
          </button>
        </div>

        {activeTab === 'available_offers' && (
          <>
            {/* Header and Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex-1 min-w-[200px]">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  Available Offers <Sparkles className="w-5 h-5 text-amber-400" />
                </h1>
                <p className="mt-1 text-sm text-gray-400">Discover the best local deals tailored just for you.</p>
              </div>
              
              <div className="w-full md:w-64 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search offers or stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap
                      ${selectedCategory === category 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                        : 'bg-white/10 text-gray-300 hover:bg-indigo-500 hover:text-white border border-white/10'}
                    `}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : filteredOffers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOffers.map(offer => (
                  <OfferCard key={offer._id || offer.id} offer={offer} showStoreName={true} isCustomerView={true} userId={CUSTOMER_ID} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-dashed border-white/10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-4">
                  <Search className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-base font-semibold text-white">No offers found</h3>
                <p className="mt-1 text-sm text-gray-400 max-w-sm mx-auto">
                  We couldn't find any offers matching your search or selected category. Try adjusting your filters.
                </p>
                {(searchQuery || selectedCategory !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="mt-4 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'split_offers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Split Offers
              </h2>
              <p className="text-sm text-gray-400 mt-1">Team up with others to unlock shared discounts on eligible offers.</p>
            </div>

            {isLoadingSplits ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : (
              <>
                {/* Pending Splits */}
                {userSplits.pending.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      Pending Splits (Waiting for partner)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userSplits.pending.map(split => (
                        <div key={split.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm text-white">{split.offer?.name || split.offer?.title}</h4>
                              <p className="text-xs text-gray-400">{split.offer?.offerType}</p>
                            </div>
                            <span className="text-[10px] font-medium bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                              1/2 people
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Splits */}
                {userSplits.matched.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      Matched Splits (Ready to chat)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userSplits.matched.map(split => (
                        <div key={split.id} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm text-white">{split.offer?.name || split.offer?.title}</h4>
                              <p className="text-xs text-gray-400">{split.offer?.offerType}</p>
                            </div>
                            <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                              2/2 Matched
                            </span>
                          </div>
                          <button
                            onClick={() => openChat(split)}
                            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:scale-105 active:scale-95 transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Open Chat
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Split History */}
                {userSplits.history.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">Split History</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {userSplits.history.map(split => (
                        <div key={split.id} className="bg-white/5 border border-white/10 rounded-xl p-3 opacity-70">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm text-gray-300">{split.offer?.name || split.offer?.title}</h4>
                              <p className="text-xs text-gray-500">{split.offer?.offerType}</p>
                            </div>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              split.status === 'completed' 
                                ? 'bg-white/10 text-gray-400' 
                                : 'bg-red-500/20 text-red-300'
                            }`}>
                              {split.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {userSplits.active.length === 0 && (
                  <div className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-dashed border-white/10">
                    <Users className="mx-auto h-10 w-10 text-gray-500" />
                    <h3 className="mt-2 text-sm font-semibold text-white">No active splits</h3>
                    <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
                      Browse offers and click "Join" on Percentage or Flat Discount offers to team up!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'post_request' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white">Request an Offer</h2>
                <p className="text-sm text-gray-400 mt-1">Found a great local deal? Submit it here. If approved, you earn likes & tokens!</p>
              </div>
              <RequestForm />
            </div>

            {customerRequests.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-white mb-4 border-b border-white/10 pb-2">Your Sent Requests</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerRequests.map(req => (
                    <RequestCard key={req.id} request={req} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {showProfile && (
        <ProfilePanel userData={customerData} onClose={() => setShowProfile(false)} />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            setShowUpgradeModal(false);
            setIsGoldMember(true);
          }}
        />
      )}

      {/* Chat Modal */}
      {showChatModal && selectedSplit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="px-5 py-3 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {selectedSplit.offer?.name || selectedSplit.offer?.title}
                </h3>
                <p className="text-indigo-200 text-xs">
                  Chat with your split partner
                </p>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-black/20 min-h-[250px] max-h-[350px] custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const isMe = msg.senderId === CUSTOMER_ID;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                          : 'bg-white/10 text-gray-200 border border-white/10 rounded-bl-sm'
                      }`}>
                        <p className="text-[10px] opacity-60 mb-0.5">{msg.senderName}</p>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-2 border-t border-white/10 bg-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
