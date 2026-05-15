import React from 'react';

export default function StatusBadge({ status }) {
  let bgColor, textColor, borderColor;

  switch (status.toLowerCase()) {
    case 'approved':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      borderColor = 'border-green-200';
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      borderColor = 'border-red-200';
      break;
    case 'pending':
    default:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      borderColor = 'border-yellow-200';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm ${bgColor} ${textColor} ${borderColor} transition-colors duration-300`}>
      {status}
    </span>
  );
}
