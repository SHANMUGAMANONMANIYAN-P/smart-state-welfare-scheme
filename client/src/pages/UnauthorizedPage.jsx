import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-black text-brand-navy">Access Restricted</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
        You do not have the required role or administrative privileges to view this area.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-purple text-white text-xs font-bold shadow-xs hover:bg-brand-purpleDark transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Return to Citizen Dashboard
      </Link>
    </div>
  );
}
