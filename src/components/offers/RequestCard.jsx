import React from 'react';
import { Store, MapPin, Tag, Check, X } from 'lucide-react';
import StatusBadge from '../admin/StatusBadge';

export default function RequestCard({ request, isStoreOwner = false, onAccept, onReject }) {
  const isPending = request.status?.toLowerCase() === 'pending';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-full transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{request.name}</h3>
        <StatusBadge status={request.status} />
      </div>
      
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-center text-sm text-gray-600">
          <Store className="w-4 h-4 mr-2 text-gray-400" />
          <span>{request.storeName}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          <span>{request.location || 'Not provided'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Tag className="w-4 h-4 mr-2 text-gray-400" />
          <span>{request.category}</span>
        </div>
      </div>

      {isStoreOwner && isPending && (
        <div className="flex gap-3 pt-4 border-t border-gray-50">
          <button
            onClick={() => onAccept(request.id)}
            className="flex-1 flex justify-center items-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="flex-1 flex justify-center items-center gap-2 py-2 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
