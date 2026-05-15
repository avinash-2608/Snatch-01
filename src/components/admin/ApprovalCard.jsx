import React from 'react';
import { Store, MapPin, Phone, Mail, Check, X } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function ApprovalCard({ store, onApprove, onReject }) {
  const isPending = store.status.toLowerCase() === 'pending';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border p-6 transition-all duration-300 hover:shadow-md ${isPending ? 'border-gray-200' : store.status.toLowerCase() === 'approved' ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{store.storeName}</h4>
            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
              <StatusBadge status={store.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{store.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{store.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>{store.email}</span>
        </div>
      </div>

      {isPending && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => onApprove(store.id)}
            className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Check className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => onReject(store.id)}
            className="flex-1 flex justify-center items-center gap-2 py-2.5 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
