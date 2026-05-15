import React from 'react';

export default function Select({
  label,
  id,
  icon: Icon,
  options,
  error,
  ...props
}) {
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
        <select
          id={id}
          className={`
            block w-full rounded-xl sm:text-sm transition-all duration-200 ease-in-out
            bg-gray-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 border appearance-none
            ${Icon ? 'pl-10' : 'pl-4'} pr-10
            py-2.5
            ${error 
              ? 'border-red-300 text-red-900 dark:text-red-200 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-300 dark:hover:border-slate-500'}
            focus:outline-none focus:ring-2 focus:ring-opacity-50 dark:focus:ring-opacity-30
          `}
          {...props}
        >
          <option value="" disabled defaultChecked>Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 animate-pulse">{error}</p>
      )}
    </div>
  );
}
