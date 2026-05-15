import React, { createContext, useState, useContext, useCallback } from 'react';
import { fetchApi } from '../api/api';

const OfferContext = createContext();

export function OfferProvider({ children }) {
  const [offers, setOffers] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all offers (for customers)
  const fetchAllOffers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get userId from localStorage to check subscription status
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?._id;
      
      // Pass userId as query param for subscription check
      const url = userId ? `/offers?userId=${userId}` : '/offers';
      const data = await fetchApi(url);
      
      setOffers(data.map(offer => ({
        ...offer,
        name: offer.title,
        id: offer._id,
        storeName: offer.storeId?.storeName || 'Unknown Store'
      })));
    } catch (e) {
      setError('Failed to fetch offers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch offers by specific store (for store dashboard)
  const fetchStoreOffers = useCallback(async (storeId) => {
    setIsLoading(true);
    try {
      const data = await fetchApi(`/offers/store/${storeId}`);
      setOffers(data.map(offer => ({
        ...offer,
        name: offer.title,
        id: offer._id
      })));
    } catch (e) {
      setError('Failed to fetch store offers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add offer directly to DB
  const addOffer = async (offerData) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    try {
      const data = await fetchApi('/offers', {
        method: 'POST',
        body: JSON.stringify({
          ...offerData,
          title: offerData.name, // Map name back to title for backend
          storeId: user._id,
          createdBy: 'store'
        })
      });
      // Pre-pend locally for immediate UI update
      setOffers(prev => [{ ...data.offer, name: data.offer.title, id: data.offer._id }, ...prev]);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const fetchUserRequests = useCallback(async (userId) => {
    try {
      const data = await fetchApi(`/requests/user/${userId}`);
      setUserRequests(data.map(req => ({ ...req, name: req.offerName, id: req._id })));
    } catch (e) {
      console.error('Failed to fetch user requests', e);
    }
  }, []);

  const fetchStoreRequests = useCallback(async (storeId) => {
    try {
      const data = await fetchApi(`/requests/store/${storeId}`);
      setUserRequests(data.map(req => ({ ...req, name: req.offerName, id: req._id })));
    } catch (e) {
      console.error('Failed to fetch store requests', e);
    }
  }, []);

  const addRequest = async (request) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user._id) return;
    
    const data = await fetchApi('/requests', {
      method: 'POST',
      body: JSON.stringify({ 
        storeName: request.storeName, 
        location: request.location, 
        offerName: request.name, 
        category: request.category, 
        userId: user._id 
      })
    });
    
    const newReq = { ...data.request, name: data.request.offerName, id: data.request._id };
    setUserRequests(prev => [newReq, ...prev]);
  };

  const updateRequestStatus = async (id, newStatus, additionalData = {}) => {
    try {
      if (newStatus === 'Approved') {
        await fetchApi(`/requests/approve/${id}`, {
          method: 'PUT',
          body: JSON.stringify(additionalData)
        });
        setUserRequests(prev => prev.filter(req => req.id !== id));
      } else if (newStatus === 'Rejected') {
        await fetchApi(`/requests/reject/${id}`, { method: 'PUT' });
        setUserRequests(prev => prev.filter(req => req.id !== id));
      }
    } catch (e) {
      console.error('Update request status failed:', e);
      throw e;
    }
  };

  const likeOffer = async (id, userId) => {
    try {
      const data = await fetchApi(`/offers/like/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ userId })
      });
      setOffers(prev => prev.map(o => (o._id === id || o.id === id) ? {
        ...o,
        likes: data.likes,
        likedBy: data.likedBy
      } : o));
      return data;
    } catch (e) {
      console.error('Like failed', e);
      throw e;
    }
  };

  return (
    <OfferContext.Provider value={{ 
      offers, 
      isLoading, 
      error,
      fetchAllOffers,
      fetchStoreOffers,
      addOffer, 
      userRequests, 
      fetchUserRequests,
      fetchStoreRequests,
      addRequest, 
      updateRequestStatus, 
      likeOffer 
    }}>
      {children}
    </OfferContext.Provider>
  );
}

export function useOffers() {
  return useContext(OfferContext);
}
