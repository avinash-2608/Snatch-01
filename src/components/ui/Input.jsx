import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label,
  id,
  type = 'text',
  icon: Icon,
  error,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <div className="relative rounded-xl shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={id}
          type={inputType}
          className={`
            block w-full rounded-xl sm:text-sm transition-all duration-200 ease-in-out
            bg-gray-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 border
            ${Icon ? 'pl-10' : 'pl-4'}
            ${isPassword ? 'pr-10' : 'pr-4'}
            py-2.5
            ${error 
              ? 'border-red-300 text-red-900 dark:text-red-200 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-slate-500'}
            focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:focus:ring-opacity-30
          `}
          {...props}
        />
        {isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className="text-gray-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none focus:text-indigo-500 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-pulse">{error}</p>
      )}
    </div>
  );
}
