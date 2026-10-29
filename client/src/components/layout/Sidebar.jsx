import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  User,
  Sparkles,
  Award,
  Compass,
  Bookmark,
  History,
  HelpCircle,
  LogOut,
  Layers,
  Sliders,
  FileText,
  Users,
  TrendingUp,
  Settings,
  ShieldCheck,
  UploadCloud,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  // Citizen items
  const citizenNavItems = [
    { key: 'navDashboard', name: t('navDashboard', 'Dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { key: 'navProfile', name: t('navProfile', 'My Profile'), path: '/profile', icon: User },
    { key: 'navCheckEligibility', name: t('navCheckEligibility', 'Check Eligibility'), path: '/check-eligibility', icon: Sparkles },
    { key: 'navRecommended', name: t('navRecommended', 'Recommended Schemes'), path: '/recommended', icon: Award },
    { key: 'navAllSchemes', name: t('navAllSchemes', 'All Welfare Schemes'), path: '/schemes', icon: Compass },
    { key: 'navSavedSchemes', name: t('navSavedSchemes', 'Saved Schemes'), path: '/saved-schemes', icon: Bookmark },
    { key: 'navHistory', name: t('navHistory', 'Evaluation History'), path: '/history', icon: History },
    { key: 'navHelp', name: t('navHelp', 'Help and About'), path: '/help', icon: HelpCircle },
  ];

  // Admin navigation items
  const adminNavItems = [
    { key: 'adminDashboard', name: t('adminDashboard', 'Admin Dashboard'), path: '/admin', icon: LayoutDashboard },
    { key: 'manageSchemes', name: t('manageSchemes', 'Manage Schemes'), path: '/admin/schemes', icon: Layers },
    { key: 'importSchemes', name: t('importSchemes', 'Import Schemes'), path: '/admin/import', icon: UploadCloud },
    { key: 'eligibilityCriteria', name: t('eligibilityCriteria', 'Eligibility Criteria'), path: '/admin/criteria', icon: Sliders },
    { key: 'requiredDocuments', name: t('requiredDocuments', 'Required Documents'), path: '/admin/documents', icon: FileText },
    { key: 'citizenRecords', name: t('citizenRecords', 'Citizen Records'), path: '/admin/citizens', icon: Users },
    { key: 'reportsAnalytics', name: t('reportsAnalytics', 'Reports and Analytics'), path: '/admin/reports', icon: TrendingUp },
    { key: 'settings', name: t('settings', 'Settings'), path: '/admin/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : citizenNavItems;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm w-64 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
        <NavLink to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand-purple flex items-center justify-center text-white shadow-md shadow-brand-purple/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-brand-navy flex items-center">
              Smart<span className="text-brand-purple">Welfare</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {isAdmin ? t('adminConsole', 'Admin Console') : t('citizenServices', 'Citizen Services')}
            </div>
          </div>
        </NavLink>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {isAdmin ? t('adminConsole', 'Administration') : t('citizenServices', 'Welfare Services')}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && item.path !== '/admin' && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-purple text-white shadow-sm shadow-brand-purple/30 font-semibold'
                  : 'text-slate-600 hover:text-brand-purple hover:bg-brand-lavender/50'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout button at bottom */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4 mr-3 shrink-0 text-rose-500" />
          <span>{t('navLogout', 'Logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop and panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
