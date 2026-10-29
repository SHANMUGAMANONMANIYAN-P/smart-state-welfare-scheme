import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { savedSchemesAPI } from '../services/api';
import {
  Bookmark,
  ExternalLink,
  Trash2,
  FileText,
  Printer,
  Building,
  MapPin,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import SchemeDetailModal from '../components/SchemeDetailModal';

export function SavedSchemesPage() {
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await savedSchemesAPI.getAll();
      setSavedSchemes(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching saved schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (schemeId) => {
    try {
      await savedSchemesAPI.remove(schemeId);
      setSavedSchemes((prev) => prev.filter((s) => s.id !== schemeId));
      setToastMessage('Scheme removed from saved bookmarks.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Loading Bookmarked Schemes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <Bookmark className="w-3.5 h-3.5 mr-1.5" />
            Personal Bookmarks & Applications
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            Saved Schemes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your saved welfare programs and document checklists for fast reference.
          </p>
        </div>

        {savedSchemes.length > 0 && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition"
          >
            <Printer className="w-4 h-4 mr-1.5 text-brand-purple" />
            Print Checklist
          </button>
        )}
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center shadow-md animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bookmarks List */}
      {savedSchemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-sm text-slate-700">No Saved Schemes Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't bookmarked any welfare schemes. Browse the scheme directory to save relevant programs.
          </p>
          <Link
            to="/schemes"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-bold shadow-xs hover:bg-brand-purpleDark transition"
          >
            Explore Welfare Schemes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedSchemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-brand-purple/40 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-lavender text-brand-purple">
                    {scheme.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {scheme.state_coverage || 'All-India'}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-brand-navy">
                  {scheme.scheme_name}
                </h3>

                <p className="text-xs text-slate-500 flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                  {scheme.department}
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {scheme.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedScheme(scheme)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-brand-navy hover:text-brand-purple hover:border-brand-purple/40 transition shadow-2xs flex items-center"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-400" />
                </button>

                <div className="flex items-center space-x-2">
                  {scheme.official_url && (
                    <a
                      href={scheme.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-500 hover:text-brand-purple flex items-center transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      Portal
                    </a>
                  )}

                  <button
                    onClick={() => handleRemove(scheme.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          isOpen={Boolean(selectedScheme)}
          onClose={() => setSelectedScheme(null)}
          onSave={handleRemove}
          isSaved={true}
        />
      )}
    </div>
  );
}

export default SavedSchemesPage;
