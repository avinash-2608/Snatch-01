import React, { useState, useEffect } from 'react';
import { User, Store, Heart, Coins, X, Calendar, Users, MapPin, Phone, Mail, Tag } from 'lucide-react';
import { useOffers } from '../../context/OfferContext';
import { fetchApi } from '../../api/api';

export default function ProfilePanel({ userData, onClose }) {
  const { userRequests, offers } = useOffers();
  const [offerStats, setOfferStats] = useState({ totalLikes: 0, offerCount: 0 });

  // Snatch Tokens from user data (awarded for likes on user-generated offers)
  const snatchTokens = userData.snatchTokens || 0;

  // Fetch actual likes from user's offers
  useEffect(() => {
    const fetchOfferStats = async () => {
      if (!userData.id) return;
      try {
        const data = await fetchApi(`/offers/stats/${userData.id}`);
        setOfferStats({
          totalLikes: data.totalLikes || 0,
          offerCount: data.offerCount || 0
        });
      } catch (e) {
        console.error('Failed to fetch offer stats:', e);
      }
    };
    fetchOfferStats();
  }, [userData.id]);

  // Specifically for Customer rewards calculation (for display purposes)
  const customerId = userData.role === 'customer' ? userData.id : null;
  const userSubmittedRequests = customerId
    ? userRequests.filter(r => r.submitterId === customerId)
    : [];
  const totalLikes = offerStats.totalLikes;

  // Specifically for Store Owner metrics (e.g., active offers)
  const storeActiveOffers = offers.filter(o => o.storeName === userData.storeName && !o.isCommunityOffer).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transform animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {userData.role === 'customer' ? 'Your Profile' : 'Store Profile'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Header Section */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-lg ${userData.role === 'customer' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {userData.role === 'customer' ? <User className="w-10 h-10" /> : <Store className="w-10 h-10" />}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {userData.role === 'customer' ? userData.name : userData.storeName}
            </h3>
            <p className="text-gray-500 text-sm mt-1 flex items-center justify-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {userData.email}
            </p>
          </div>

          {/* Details Section */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Basic Details</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
              {userData.role === 'customer' ? (
                <>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-500 w-20">Age:</span>
                    <span className="font-medium text-gray-900">{userData.age} years</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-500 w-20">Gender:</span>
                    <span className="font-medium text-gray-900">{userData.gender}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-gray-500 w-20 shrink-0">Location:</span>
                    <span className="font-medium text-gray-900">{userData.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-500 w-20">Phone:</span>
                    <span className="font-medium text-gray-900">{userData.phone}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rewards / Store Stats Section */}
          {userData.role === 'customer' ? (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Rewards Metrics</h4>
              
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 flex items-center border border-rose-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-4">
                  <Heart className="w-6 h-6 text-rose-500 fill-current" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Likes Received</p>
                  <p className="text-2xl font-bold text-gray-900">{totalLikes}</p>
                  <p className="text-xs text-rose-500/70">Across {offerStats.offerCount} offers</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-4 flex items-center border border-amber-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-amber-200 to-transparent opacity-20 rounded-bl-full" />
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-4 z-10">
                  <Coins className="w-6 h-6 text-amber-500" />
                </div>
                <div className="z-10">
                  <p className="text-sm text-gray-500 font-medium">Snatch Tokens Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{snatchTokens}</p>
                </div>
                <p className="text-[10px] text-amber-600/60 font-medium absolute bottom-2 right-4 z-10">
                  1 Token per 10 Likes
                </p>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Your Submissions</h4>
                {userSubmittedRequests.length > 0 ? (
                  <div className="space-y-3">
                    {userSubmittedRequests.map(req => (
                      <div key={req.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-gray-900 text-sm truncate pr-2">{req.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {req.storeName}
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center text-rose-500 font-medium">
                            <Heart className="w-3 h-3 mr-0.5 fill-current" />
                            {req.likes || 0}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">You haven't requested any offers yet.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Store Overview</h4>
              
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 flex items-center border border-emerald-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-4">
                  <Tag className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Active Offers Posted</p>
                  <p className="text-2xl font-bold text-gray-900">{storeActiveOffers}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
