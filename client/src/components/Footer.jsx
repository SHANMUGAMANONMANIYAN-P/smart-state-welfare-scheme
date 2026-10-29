import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Info, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Visible Advisory Notice */}
        <div className="mb-10 p-4 sm:p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 leading-relaxed shadow-xs flex items-start space-x-3">
          <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block sm:inline sm:mr-1">
              Advisory Notice:
            </span>
            SmartWelfare provides informational eligibility guidance based on configured scheme criteria. Matching scores are not official approval or a guarantee of benefits. Verify all requirements with the relevant government department before applying.
          </div>
        </div>

        {/* 4 Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Purpose */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                SmartWelfare
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Smart Welfare Scheme Eligibility Prediction Engine helps citizens discover welfare programs matching their socio-economic profile through transparent, rule-based matching.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Explore Portal
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <Link to="/" className="hover:text-teal-300 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-teal-300 transition">
                  Explore Schemes
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-teal-300 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-300 transition">
                  About the Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Citizen Account */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Citizen Account
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <Link to="/login" className="hover:text-teal-300 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-300 transition">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-teal-300 transition">
                  Eligibility Dashboard
                </Link>
              </li>
              <li>
                <Link to="/saved-schemes" className="hover:text-teal-300 transition">
                  Saved Schemes
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Security */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center">
              <Lock className="w-3.5 h-3.5 text-teal-400 mr-1.5" />
              Privacy & Security
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Data minimization in practice. We never collect national identification numbers (Aadhaar/PAN) or banking passwords. Self-reported profile details are used strictly for criteria comparison.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-center sm:flex sm:justify-between sm:items-center text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} SmartWelfare • Citizens Welfare Eligibility Portal.
          </div>
          <div className="mt-2 sm:mt-0 text-slate-400">
            Transparent • Explainable • Citizen-First
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
