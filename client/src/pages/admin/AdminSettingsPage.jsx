import React, { useEffect, useState } from 'react';
import { adminAPI, authAPI } from '../../services/api';
import {
  Settings,
  Database,
  ShieldCheck,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [dbStatus, setDbStatus] = useState(null);
  const [googleStatus, setGoogleStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const [analyticsRes, googleRes] = await Promise.all([
        adminAPI.getAnalytics(),
        authAPI.getGoogleStatus(),
      ]);
      setDbStatus(analyticsRes.data?.data?.database_status);
      setGoogleStatus(googleRes.data?.data);
    } catch (err) {
      console.error('Failed to load settings status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Verifying System Health...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5 mr-1.5" />
          Environment & Security Configuration
        </div>
        <h2 className="text-2xl font-black text-brand-navy tracking-tight">
          System Settings & Diagnostics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review database connection status, authentication security, and deployment environment keys.
        </p>
      </div>

      {/* Database Connection Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-brand-purple" />
          <h3 className="font-extrabold text-sm text-brand-navy">
            Relational Database Connector (MySQL / SQLite Fallback)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium">Engine Mode</span>
            <div className="font-bold text-brand-navy">
              {dbStatus?.mode === 'mysql' ? 'MySQL 8.0+ Connection Pool' : 'Local Fallback Storage (SQLite Active)'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-slate-400 font-medium">Database Target</span>
            <div className="font-bold text-brand-navy font-mono">
              {dbStatus?.database || 'welfare_schemes_db'}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
          {dbStatus?.message || 'Database status operational.'}
        </div>
      </div>

      {/* Security & Authentication Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Lock className="w-5 h-5 text-brand-purple" />
          <h3 className="font-extrabold text-sm text-brand-navy">
            Authentication & Security Policies
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="font-bold text-brand-navy">Password Hashing</div>
              <div className="text-[11px] text-slate-500">bcrypt salt rounds = 10 for all citizen and admin accounts.</div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="font-bold text-brand-navy">Public Administrator Registration</div>
              <div className="text-[11px] text-slate-500">Strictly blocked on server-side. Public accounts always receive citizen role.</div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Enforced
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="font-bold text-brand-navy">Google OAuth 2.0 Integration</div>
              <div className="text-[11px] text-slate-500">{googleStatus?.message}</div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                googleStatus?.configured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {googleStatus?.configured ? 'Configured' : 'Optional Setup Required'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
