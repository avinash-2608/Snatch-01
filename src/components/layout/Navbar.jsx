import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, Crown, Tag } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ 
  title, 
  subtitle,
  icon: Icon,
  actions,
  showLogout = true,
  showThemeToggle = true,
  isGoldMember = false 
}) {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl mx-4 mt-4 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          {Icon ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Icon className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Tag className="w-4 h-4 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-base font-semibold text-white">
              {title || 'Snatch'}
            </h1>
            {subtitle && (
              <p className="text-[10px] text-gray-400">{subtitle}</p>
            )}
          </div>
          
          {isGoldMember && (
            <div className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-amber-400/30">
              <Crown className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">Gold</span>
            </div>
          )}
        </div>

        {/* Center: Custom Actions */}
        {actions && (
          <div className="hidden md:flex items-center gap-2">
            {actions}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {showThemeToggle && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-105"
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {showLogout && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 hover:scale-105 text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
