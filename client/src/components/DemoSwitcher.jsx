import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle, LogOut, X, Users, ChevronUp } from 'lucide-react';

export function DemoSwitcher() {
  const { user, loginAsDemoUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState(null);

  const personas = [
    {
      id: 'farmer',
      title: 'Ramesh Kumar',
      role: 'Rural Farmer (₹1.2L income)',
      icon: '👨‍🌾',
      badge: 'Matches PM-Kisan & Housing',
    },
    {
      id: 'student',
      title: 'Ananya Sharma',
      role: 'Urban Student (₹1.8L income)',
      icon: '🎓',
      badge: 'Matches Education Grant',
    },
    {
      id: 'senior',
      title: 'Suresh Patel',
      role: 'Senior Citizen (₹85k income)',
      icon: '👴',
      badge: 'Matches Pension & Healthcare',
    },
    {
      id: 'admin',
      title: 'Administrator',
      role: 'admin@welfare.gov.in',
      icon: '🛡️',
      badge: 'Full Scheme & Rules Management',
    },
  ];

  const handleSwitch = async (personaId) => {
    try {
      setLoadingPersona(personaId);
      await loginAsDemoUser(personaId);
      if (personaId === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      setIsOpen(false);
    } catch (err) {
      console.error('Demo switch error:', err);
    } finally {
      setLoadingPersona(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 w-80 animate-in fade-in slide-in-from-bottom-2 text-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-xl bg-brand-lavender text-brand-purple border border-brand-purple/20">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-brand-navy leading-tight">Evaluator Personas</h4>
                <p className="text-[10px] text-slate-400">1-Click Evaluation Switcher</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {personas.map((p) => {
              const isCurrent =
                user &&
                ((p.id === 'admin' && user.role === 'admin') ||
                  (p.id === 'farmer' && user.email === 'ramesh.kumar@example.com') ||
                  (p.id === 'student' && user.email === 'ananya.sharma@example.com') ||
                  (p.id === 'senior' && user.email === 'suresh.patel@example.com'));

              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitch(p.id)}
                  disabled={loadingPersona !== null}
                  className={`w-full p-2.5 rounded-xl text-left text-xs transition border flex items-center justify-between ${
                    isCurrent
                      ? 'bg-brand-lavender/60 border-brand-purple/50 text-brand-purple font-semibold shadow-2xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{p.icon}</span>
                    <div>
                      <div className="font-bold text-brand-navy leading-tight">{p.title}</div>
                      <div className="text-[10px] text-slate-500">{p.role}</div>
                      <div className="text-[9px] text-brand-purple font-medium mt-0.5">{p.badge}</div>
                    </div>
                  </div>
                  {isCurrent && <CheckCircle className="w-4 h-4 text-brand-purple shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {isAuthenticated && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                  setIsOpen(false);
                }}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition flex items-center"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Sign Out / Reset
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-navy hover:bg-brand-navyLight text-white text-xs font-semibold py-2 px-3.5 rounded-full shadow-lg border border-brand-purple/30 flex items-center space-x-2 transition-all hover:scale-105"
          title="Open Evaluator Test Personas"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-purpleLight" />
          <span className="text-[11px] font-bold text-white tracking-wide">Judge Personas</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}
    </div>
  );
}

export default DemoSwitcher;
