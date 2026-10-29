import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthToken } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function processCallback() {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');
      const messageParam = searchParams.get('message');

      if (errorParam) {
        setError(messageParam || errorParam);
        setTimeout(() => {
          navigate(`/login?error=${encodeURIComponent(errorParam)}&message=${encodeURIComponent(messageParam || '')}`);
        }, 3000);
        return;
      }

      if (!token) {
        setError('No authentication token received from Google callback.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const user = await handleAuthToken(token);
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('OAuth callback processing failed:', err);
        setError('Failed to initialize session from Google authentication response.');
        setTimeout(() => navigate('/login'), 3000);
      }
    }

    processCallback();
  }, [searchParams, handleAuthToken, navigate]);

  return (
    <div className="min-h-[70vh] bg-[#F0F2F9] flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-8 max-w-sm w-full text-center space-y-4 animate-in fade-in">
        <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto shadow-2xs">
          <ShieldCheck className="w-6 h-6 text-teal-600" />
        </div>

        {error ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center text-rose-600">
              <AlertCircle className="w-5 h-5 mr-1.5" />
              <span className="text-sm font-bold">Authentication Notice</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
            <p className="text-[11px] text-slate-400">Redirecting to login...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">
              Verifying Google Account...
            </h3>
            <p className="text-xs text-slate-500">
              Securing session and loading your welfare scheme profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OAuthCallbackPage;
