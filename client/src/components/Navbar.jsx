import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Search,
  BookOpen,
  Info,
  User,
  LogOut,
  Menu,
  X,
  FileCheck,
  BookmarkCheck,
  Layers,
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore Schemes', path: '/schemes' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand Identity */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-2xs group-hover:bg-teal-100/70 transition">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  SmartWelfare
                </span>
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                  Engine
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Citizens Welfare Eligibility Portal
              </div>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-teal-700 bg-teal-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right: Auth Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-teal-300 hover:bg-slate-800 border border-slate-700 shadow-xs transition"
                  >
                    <Layers className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
                    Admin Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition"
                    >
                      <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                      Check Eligibility
                    </Link>
                    <Link
                      to="/saved-schemes"
                      className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                      title="Saved Schemes"
                    >
                      <BookmarkCheck className="w-4 h-4 text-teal-600 mr-1" />
                      Saved
                    </Link>
                    <Link
                      to="/profile"
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                      title="My Profile"
                    >
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name || 'Profile'}
                          className="w-5 h-5 rounded-full object-cover mr-1.5 border border-slate-300"
                        />
                      ) : (
                        <User className="w-4 h-4 text-slate-500 mr-1" />
                      )}
                      <span>{user?.full_name ? user.full_name.split(' ')[0] : 'Profile'}</span>
                    </Link>
                  </>
                )}

                <div className="h-6 w-px bg-slate-200 mx-1" />

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg animate-in fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3.5 py-2.5 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? 'text-teal-700 bg-teal-50 font-semibold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="border-t border-slate-200 pt-4 mt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 px-4 rounded-lg font-semibold bg-slate-900 text-teal-300"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center py-2.5 px-4 rounded-lg font-semibold bg-teal-600 text-white"
                    >
                      Check Eligibility
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center py-2.5 px-4 rounded-lg font-medium text-slate-700 bg-slate-100"
                    >
                      Citizen Profile
                    </Link>
                    <Link
                      to="/saved-schemes"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center py-2.5 px-4 rounded-lg font-medium text-slate-700 bg-slate-100"
                    >
                      Saved Schemes
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-center py-2.5 px-4 rounded-lg font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 px-4 rounded-lg font-medium text-slate-700 border border-slate-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 px-4 rounded-lg font-semibold bg-teal-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
