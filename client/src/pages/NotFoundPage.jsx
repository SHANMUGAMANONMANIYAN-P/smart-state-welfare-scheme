import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-lavender text-brand-purple flex items-center justify-center mb-4">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-black text-brand-navy">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
        The requested path does not exist in the SmartWelfare portal.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-purple text-white text-xs font-bold shadow-xs hover:bg-brand-purpleDark transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Return to Home
      </Link>
    </div>
  );
}
