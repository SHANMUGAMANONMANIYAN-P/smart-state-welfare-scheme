import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Handle direct form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 selection:bg-brand-lavender selection:text-brand-purple">
      {/* Top Navigation Bar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-3">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-purpleDark flex items-center justify-center text-white shadow-lg shadow-brand-purple/25 group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-brand-navy">
              Smart<span className="text-brand-purple">Welfare</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Eligibility Prediction Engine
            </div>
          </div>
        </Link>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          <span className="text-slate-500 hidden sm:inline">New to SmartWelfare?</span>
          <Link
            to="/register"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-brand-purple hover:bg-brand-lavender/50 hover:border-brand-purple/30 transition shadow-2xs font-bold"
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="max-w-md w-full mx-auto my-auto space-y-6 py-4">
        {/* Centered White Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-9 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          {/* Subtle Accent Glow Header */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-purple via-brand-purpleLight to-brand-purple" />

          {/* Logo & Headings */}
          <div className="text-center space-y-2 mb-7">
            <div className="w-14 h-14 rounded-2xl bg-brand-lavender text-brand-purple mx-auto flex items-center justify-center shadow-inner border border-brand-lavenderDark/50 mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              Welcome to SmartWelfare
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Discover government welfare schemes you may qualify for through rule-based matching.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 placeholder-slate-400 outline-hidden transition bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 placeholder-slate-400 outline-hidden transition bg-slate-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purpleDark hover:from-brand-purpleDark hover:to-primary-800 text-white font-bold text-xs shadow-md shadow-brand-purple/30 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Card Footer Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <Link
              to="/register"
              className="text-xs font-bold text-brand-purple hover:underline"
            >
              Create a Citizen Account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Legal Disclaimer */}
      <footer className="text-center text-[11px] text-slate-400 max-w-xl mx-auto py-3 leading-relaxed">
        <p>
          SmartWelfare is an academic decision-support & eligibility prediction prototype. All matching evaluations are preliminary advisory indicators subject to official ministerial verification.
        </p>
      </footer>
    </div>
  );
}
