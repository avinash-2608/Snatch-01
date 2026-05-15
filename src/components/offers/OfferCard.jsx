import React, { useState, useEffect } from 'react';
import { Calendar, Tag, Store, Lock, Unlock, Heart, Users, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { generateReferralCode } from '../../utils/codeGenerator';
import { useOffers } from '../../context/OfferContext';
import { fetchApi } from '../../api/api';

export default function OfferCard({ offer, showStoreName = false, isCustomerView = false, userId = 'guest' }) {
  const { likeOffer } = useOffers();
  const [revealedCode, setRevealedCode] = useState(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [splitStatus, setSplitStatus] = useState(null);
  const [isJoiningSplit, setIsJoiningSplit] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const offerId = offer._id || offer.id;
  const eligibleForSplit = offer.offerType === 'Percentage Discount Offer' || offer.offerType === 'Flat Discount Offer';

  useEffect(() => {
    if (!isCustomerView) return;
    const storedCode = localStorage.getItem(`referral_code_${userId}_${offer.id}`);
    if (storedCode) {
      setRevealedCode(storedCode);
    }
  }, [offer.id, isCustomerView, userId]);

  useEffect(() => {
    const currentOfferId = offer._id || offer.id;
    if (!isCustomerView || !eligibleForSplit || !currentOfferId) return;

    const fetchSplitStatus = async () => {
      try {
        const data = await fetchApi(`/splits/status/${currentOfferId}`);
        setSplitStatus(data);
      } catch (e) {
        console.error('Failed to fetch split status', e);
      }
    };

    fetchSplitStatus();
    const interval = setInterval(fetchSplitStatus, 10000);
    return () => clearInterval(interval);
  }, [offer?._id, offer?.id, isCustomerView, eligibleForSplit]);

  const handleReveal = () => {
    if (revealedCode) return;
    setIsRevealing(true);
    setTimeout(() => {
      const newCode = generateReferralCode();
      setRevealedCode(newCode);
      localStorage.setItem(`referral_code_${userId}_${offer.id}`, newCode);
      setIsRevealing(false);
    }, 400);
  };

  const currentUserId = userId === 'guest' ? null : userId;
  const userHasLiked = currentUserId && offer.likedBy && offer.likedBy.some(id =>
    id.toString() === currentUserId.toString()
  );

  const handleLike = async () => {
    if (userHasLiked || !currentUserId) return;
    try {
      await likeOffer(offer.id, currentUserId);
    } catch (e) {
      console.error('Like failed:', e);
    }
  };

  const handleSplit = async () => {
    if (!userId || userId === 'guest') {
      alert('Please login to split offers');
      return;
    }

    const currentOfferId = offer._id || offer.id;
    if (!currentOfferId) {
      alert('Offer ID not found');
      return;
    }

    setIsJoiningSplit(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user._id) {
        alert('Please login again');
        return;
      }
      const data = await fetchApi(`/splits/join/${currentOfferId}`, {
        method: 'POST',
        body: JSON.stringify({
          userId: user._id,
          userName: user.name || user.email || 'Anonymous'
        })
      });
      
      setSplitStatus(data.split);
      alert(data.message);
    } catch (err) {
      alert(err.message || 'Failed to join split');
    } finally {
      setIsJoiningSplit(false);
    }
  };

  const getSplitDisplayText = () => {
    if (!splitStatus || splitStatus.status === 'none') return '0/2 people';
    if (splitStatus.status === 'pending') return `${splitStatus.count}/2 people`;
    if (splitStatus.status === 'matched') return '2/2 (Matched)';
    return '0/2 people';
  };

  const isUserInSplit = () => {
    if (!splitStatus || !splitStatus.users) return false;
    return splitStatus.users.some(u => u.userId === userId || u._id === userId);
  };

  // Get gradient based on offer type
  const getOfferGradient = () => {
    switch (offer.offerType) {
      case 'Percentage Discount Offer': return 'from-rose-500 to-pink-600';
      case 'Flat Discount Offer': return 'from-blue-500 to-indigo-600';
      case 'BOGO Offer': return 'from-amber-500 to-orange-600';
      case 'Combo Offer': return 'from-emerald-500 to-teal-600';
      case 'First Order Offer': return 'from-violet-500 to-purple-600';
      case 'Freebie Offer': return 'from-cyan-500 to-blue-600';
      default: return 'from-indigo-500 to-purple-600';
    }
  };

  return (
    <div 
      className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full animate-entry group hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Accent Bar */}
      <div className={`h-1.5 bg-gradient-to-r ${getOfferGradient()} transform origin-left transition-transform duration-500 ${isHovered ? 'scale-x-100' : 'scale-x-0'}`} />
      
      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Category & Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gray-300 border border-white/10 backdrop-blur-sm">
            <Tag className="w-3 h-3 mr-1.5" />
            {offer.category}
          </span>
          
          {offer.offerType && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getOfferGradient()} text-white shadow-md`}>
              <Sparkles className="w-3 h-3 mr-1.5" />
              {offer.offerType}
            </span>
          )}
          
          {offer.isGoldExclusive && isCustomerView && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md border border-amber-300/50">
              <Crown className="w-3 h-3 mr-1.5" />
              Gold
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300 line-clamp-2">
          {offer.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-400 line-clamp-3 mb-3 flex-1 leading-relaxed">
          {offer.description}
        </p>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-3" />

        {/* Footer Actions */}
        <div className="space-y-2">
          {/* Split Section */}
          {isCustomerView && eligibleForSplit && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="font-medium text-xs">{getSplitDisplayText()}</span>
              </div>
              <button
                onClick={handleSplit}
                disabled={isJoiningSplit || isUserInSplit() || splitStatus?.status === 'matched'}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 ${
                  isUserInSplit() || splitStatus?.status === 'matched'
                    ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isJoiningSplit ? 'Joining...' : 
                 isUserInSplit() ? 'Joined ✓' : 
                 splitStatus?.status === 'matched' ? 'Full' : 
                 'Join'}
              </button>
            </div>
          )}

          {/* Store & Date Info */}
          {showStoreName && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Store className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-300">{offer.storeName}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{offer.startDate}</span>
            <ArrowRight className="w-3 h-3 mx-1" />
            <span className="text-rose-400 font-semibold">{offer.endDate}</span>
          </div>

          {/* Like Button */}
          {isCustomerView && (
            <div className={`flex items-center pt-1 ${offer.isCommunityOffer ? 'justify-between' : 'justify-end'}`}>
              {offer.isCommunityOffer && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20">
                  User Submitted
                </span>
              )}
              <button
                onClick={handleLike}
                disabled={userHasLiked || !currentUserId}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  userHasLiked
                    ? 'bg-rose-500/20 text-rose-400 cursor-default'
                    : 'bg-white/10 text-gray-300 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 hover:border-rose-500/30'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 transition-transform duration-300 ${userHasLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                <span>{offer.likes || 0}</span>
              </button>
            </div>
          )}
          
          {/* Referral Code Section */}
          {isCustomerView && (
            <div className="pt-1">
              <div className={`
                flex items-center justify-between p-3 rounded-xl border border-dashed transition-all duration-500
                ${revealedCode 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-white/5 border-white/10'}
              `}>
                <div className="flex-1">
                  {revealedCode ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-emerald-400 font-semibold mb-0.5 uppercase tracking-wider">Your Code</span>
                      <span className="font-mono text-xl tracking-[0.15em] font-bold text-emerald-300">
                        {revealedCode}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center ${isRevealing ? 'animate-pulse' : ''}`}>
                        <Lock className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-xs text-gray-400 font-medium">
                        {isRevealing ? 'Revealing...' : 'Tap to reveal'}
                      </span>
                    </div>
                  )}
                </div>
                
                {!revealedCode && (
                  <button
                    onClick={handleReveal}
                    disabled={isRevealing}
                    className="ml-2 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Unlock className="w-4 h-4" />
                  </button>
                )}
                
                {revealedCode && (
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Unlock className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

