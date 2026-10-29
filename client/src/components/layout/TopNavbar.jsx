import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Menu,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Settings,
  Globe,
} from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': 'Citizen Dashboard',
  '/profile': 'My Profile',
  '/check-eligibility': 'Check Scheme Eligibility',
  '/recommended': 'Recommended Welfare Schemes',
  '/schemes': 'All Welfare Schemes',
  '/saved-schemes': 'Saved Welfare Schemes',
  '/history': 'Evaluation History',
  '/help': 'Help & Methodology',
  '/admin': 'Admin Dashboard',
  '/admin/schemes': 'Manage Welfare Schemes',
  '/admin/criteria': 'Eligibility Criteria Rules',
  '/admin/documents': 'Required Documents',
  '/admin/citizens': 'Citizen Records',
  '/admin/reports': 'Reports & Analytics',
  '/admin/settings': 'System Settings',
};

export default function TopNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Derive current page title
  const currentTitle = PAGE_TITLES[location.pathname] || 'SmartWelfare Portal';

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'CW';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = user?.full_name || (user?.role === 'admin' ? 'Administrator' : 'Citizen');
  const roleName = user?.role === 'admin' ? 'Admin' : 'Citizen';

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-2xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-brand-navy tracking-tight">
            {currentTitle}
          </h1>
          <div className="hidden sm:flex items-center text-[11px] text-slate-400 font-medium">
            <span>{t('tagline')}</span>
          </div>
        </div>
      </div>

      {/* Right: Language Switcher, User Avatar & Dropdown */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Language Switcher Pill */}
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-brand-lavender/50 text-slate-700 hover:text-brand-purple border border-slate-200 text-xs font-bold transition shadow-2xs"
          title="Switch Language / மொழியை மாற்றுக"
        >
          <Globe className="w-3.5 h-3.5 text-brand-purple" />
          <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>

        {/* User Capsule Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-full hover:bg-slate-50 border border-slate-200 transition focus:outline-hidden"
          >
            {/* Small Initials Avatar */}
            <div className="w-8 h-8 rounded-full bg-brand-purple text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {getInitials(displayName)}
            </div>

            {/* Minimal Display Name & Role Badge (NO email, income, address or age) */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-brand-navy leading-none truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] font-semibold text-brand-purple leading-tight mt-0.5">
                {roleName}
              </span>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 pr-1 shrink-0" />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-brand-navy">{displayName}</div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-lavender text-brand-purple">
                  {roleName} Account
                </div>
              </div>

              <div className="py-1">
                {user?.role === 'citizen' && (
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-brand-lavender/40 hover:text-brand-purple transition"
                  >
                    <User className="w-4 h-4 mr-2.5 text-slate-400" />
                    My Profile
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center px-4 py-2 text-xs font-medium text-slate-700 hover:bg-brand-lavender/40 hover:text-brand-purple transition"
                  >
                    <Settings className="w-4 h-4 mr-2.5 text-slate-400" />
                    System Settings
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4 mr-2.5 text-rose-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
