import React from 'react';
import { Tag, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function AuthLayout({ children, title, subtitle }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white/80 to-cyan-50/80 dark:from-slate-900/85 dark:via-slate-900/85 dark:to-slate-800/85 backdrop-blur-sm flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative transition-colors duration-300">
      {/* Theme Toggle - Top Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 transition-all duration-300 shadow-sm"
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center flex-col items-center">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 transition-colors duration-300">
            <Tag className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 tracking-tight">
              Snatch
            </h1>
          </div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100 transition-colors duration-300">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-slate-400 max-w-sm transition-colors duration-300">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-indigo-100/50 dark:shadow-slate-900/50 sm:rounded-3xl sm:px-10 border border-white dark:border-slate-700 transition-colors duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}
