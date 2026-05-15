import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Store, MapPin, IndianRupee, ArrowLeft, Loader2, CheckCircle, Coins } from 'lucide-react';
import { fetchApi } from '../api/api';
import Navbar from '../components/layout/Navbar';

export default function PayBills() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [location, setLocation] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch approved shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetchApi('/admin/shops');
        console.log('Fetched shops:', response);
        setShops(response);
        
        // Extract unique locations from shops
        const uniqueLocations = [...new Set(response.map(shop => shop.location).filter(Boolean))];
        setLocations(uniqueLocations);
      } catch (err) {
        console.error('Failed to fetch shops:', err);
        setError('Failed to load shops');
      }
    };
    fetchShops();
  }, []);

  // Handle shop selection change
  const handleShopChange = (e) => {
    const shopId = e.target.value;
    setSelectedShop(shopId);
    
    // Auto-select location when shop changes
    if (shopId) {
      const shop = shops.find(s => s._id === shopId);
      if (shop && shop.location) {
        setLocation(shop.location);
      }
    } else {
      setLocation('');
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 0 && !isNaN(value))) {
      setAmount(value);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProceedToPay = async () => {
    if (!selectedShop || !amount || Number(amount) <= 0) {
      setError('Please select a shop and enter a valid amount');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      // Create order
      const orderResponse = await fetchApi('/payment/create-bill-order', {
        method: 'POST',
        body: JSON.stringify({
          userId: user._id,
          shopId: selectedShop,
          location: location,
          amount: Number(amount)
        })
      });

      if (!orderResponse.orderId) {
        setError('Failed to create payment order');
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'Snatch Bill Payment',
        description: `Payment to ${orderResponse.shopName}`,
        order_id: orderResponse.orderId,
        handler: async function (response) {
          setProcessing(true);
          try {
            // Verify payment
            const verifyResponse = await fetchApi('/payment/verify-bill', {
              method: 'POST',
              body: JSON.stringify({
                userId: user._id,
                shopId: selectedShop,
                location: location,
                amount: Number(amount),
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              })
            });

            if (verifyResponse.success) {
              setSuccess({
                amount: verifyResponse.payment.amount,
                tokensEarned: verifyResponse.payment.tokensEarned,
                shopName: verifyResponse.payment.shopName,
                newBalance: verifyResponse.newTokenBalance
              });
            } else {
              setError('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError('Payment verification failed');
          }
          setProcessing(false);
        },
        prefill: {
          name: user.name || '',
          email: user.email || ''
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');
    }

    setLoading(false);
  };

  const tokensToEarn = amount ? Math.floor(Number(amount) / 100) : 0;

  // Success view
  if (success) {
    return (
      <div className="min-h-screen flex flex-col pb-20">
        <Navbar 
          title="Pay Bills" 
          subtitle="Payment successful"
          showLogout={true}
        />
        
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 mb-6">
              You paid ₹{success.amount} to {success.shopName}
            </p>
            
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-6 h-6 text-amber-400" />
                <span className="text-3xl font-bold text-white">{success.tokensEarned}</span>
              </div>
              <p className="text-sm text-indigo-300">Snatch Tokens Earned</p>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              Your new token balance: <span className="text-white font-semibold">{success.newBalance}</span>
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/customer')}
                className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  setSuccess(null);
                  setSelectedShop('');
                  setAmount('');
                  setLocation('');
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:scale-105 transition-all"
              >
                Pay Another Bill
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Navbar 
        title="Pay Bills" 
        subtitle="Pay at your favorite stores"
        showLogout={true}
      />
      
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/customer')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Pay Your Bill</h2>
              <p className="text-xs text-gray-400">Earn 1 token per ₹100 spent</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Shop Dropdown */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Store className="w-4 h-4" />
                Select Shop
              </label>
              <select
                value={selectedShop}
                onChange={handleShopChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                disabled={loading || processing}
              >
                <option value="" className="bg-slate-900 text-gray-400">Choose a shop...</option>
                {shops.length === 0 && (
                  <option value="" disabled className="bg-slate-900 text-gray-500">No shops available</option>
                )}
                {shops.map(shop => (
                  <option key={shop._id} value={shop._id} className="bg-slate-900 text-white">
                    {shop.storeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                disabled={loading || processing || locations.length === 0}
              >
                <option value="" className="bg-slate-900 text-gray-400">
                  {locations.length === 0 ? 'No locations available' : 'Select location...'}
                </option>
                {locations.map((loc, idx) => (
                  <option key={idx} value={loc} className="bg-slate-900 text-white">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <IndianRupee className="w-4 h-4" />
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount..."
                min="1"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                disabled={loading || processing}
              />
              {amount && Number(amount) > 0 && (
                <p className="mt-2 text-xs text-indigo-300">
                  You will earn <span className="font-semibold text-white">{tokensToEarn}</span> Snatch Token{tokensToEarn !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Pay Button */}
            <button
              onClick={handleProceedToPay}
              disabled={!selectedShop || !amount || Number(amount) <= 0 || loading || processing}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Proceed to Pay ₹{amount || '0'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info card */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-2">How it works</h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">1.</span>
              Select the shop where you want to pay
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">2.</span>
              Enter the amount you need to pay
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">3.</span>
              Complete payment via Razorpay
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-400">4.</span>
              Earn 1 Snatch Token for every ₹100 spent!
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
