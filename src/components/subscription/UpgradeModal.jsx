import React, { useState } from 'react';
import { Crown, Check, X, CheckCircle } from 'lucide-react';

import { fetchApi } from '../../api/api';

export default function UpgradeModal({ onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    setIsSubmitting(true);
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert('Failed to load payment gateway. Check your connection.');
      setIsSubmitting(false);
      return;
    }

    try {
      const orderContent = await fetchApi('/payment/create-order', { method: 'POST' });
      
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};

      const options = {
        key: orderContent.key_id,
        amount: orderContent.amount,
        currency: 'INR',
        name: 'Snatch',
        description: 'Snatch Gold Membership (1 Month)',
        order_id: orderContent.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetchApi('/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                userId: user._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            // Update user localStorage dynamically
            if (verifyRes.isPremium) {
               user.isPremium = true;
               user.premiumExpiry = verifyRes.premiumExpiry;
               localStorage.setItem('user', JSON.stringify(user));
            }

            setShowSuccess(true);
            setTimeout(() => {
              onSuccess();
            }, 2000);
          } catch (verErr) {
             console.error('Verification failed', verErr);
             alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name || 'User',
          email: user.email || 'test@example.com',
          contact: user.contact || '9999999999'
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },
        theme: {
          color: '#3399cc'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response){
         setIsSubmitting(false);
         alert(response.error.description);
      });
      paymentObject.open();

    } catch (e) {
      console.error(e);
      alert('Failed to initialize subscription checkout. Please try again later.');
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center transform animate-in zoom-in-95 duration-300">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Gold!</h3>
          <p className="text-gray-500 mb-6">
            You have successfully upgraded to Snatch Gold. Enjoy your premium benefits!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl transform animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex-shrink-0 relative pt-8 pb-6 px-6 text-center border-b border-gray-100">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl mb-4 shadow-sm">
            <Crown className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Snatch Gold Membership</h2>
          <p className="mt-2 text-gray-500 max-w-lg mx-auto">
            Unlock exclusive deals, early access, and premium benefits designed for our best shoppers.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="flex flex-col lg:flex-row gap-6 max-w-3xl mx-auto items-stretch">
            
            {/* Free Plan Card */}
            <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Free Plan</h3>
              <p className="text-sm text-gray-500 mb-6">Standard shopping experience</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-gray-300 mr-3 shrink-0" />
                  <span className="text-sm text-gray-600">Limited daily offers</span>
                </li>
                <li className="flex items-start">
                  <X className="w-5 h-5 text-gray-300 mr-3 shrink-0" />
                  <span className="text-sm text-gray-400">No early access</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-gray-300 mr-3 shrink-0" />
                  <span className="text-sm text-gray-600">Standard coupons</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-gray-300 mr-3 shrink-0" />
                  <span className="text-sm text-gray-600">15% off up to ₹200</span>
                </li>
              </ul>
              
              <div className="mt-auto">
                <p className="text-center font-bold text-gray-400">Current Plan</p>
              </div>
            </div>

            {/* Gold Plan Card */}
            <div className="flex-1 bg-white rounded-2xl p-6 border-2 border-amber-400 shadow-xl shadow-amber-100 relative flex flex-col transform lg:-translate-y-4">
              <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-lg">
                  Recommended
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                Snatch Gold
              </h3>
              <p className="text-sm text-gray-600 mb-6">Maximize your savings instantly</p>
              
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                  <span className="text-sm font-medium text-gray-800">Unlimited premium offers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                  <span className="text-sm font-medium text-gray-800">Get offers before everyone else</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                  <span className="text-sm font-medium text-gray-800">Additional exclusive coupons</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-amber-500 mr-3 shrink-0" />
                  <span className="text-sm font-medium text-gray-800">15% off up to ₹250</span>
                </li>
              </ul>
              
              <button 
                onClick={handleSubscribe}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 hover:from-amber-500 to-orange-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    Subscribe to Snatch Gold
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
