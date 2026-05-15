import React from 'react';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex p-1 space-x-1 bg-gray-100 dark:bg-slate-700 rounded-xl mb-8 transition-colors duration-300">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`
              w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ease-out
              ${isActive 
                ? 'bg-white dark:bg-slate-600 text-indigo-700 dark:text-indigo-400 shadow flex-1' 
                : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50/50 dark:hover:bg-slate-600/50 hover:text-gray-700 dark:hover:text-slate-200 flex-1'}
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
