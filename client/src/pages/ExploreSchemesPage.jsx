import React, { useEffect, useState, useMemo } from 'react';
import { schemesAPI, savedSchemesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SchemeCard from '../components/SchemeCard';
import { Search, Filter, Layers, AlertCircle, RefreshCw, Compass, CheckCircle2, Users } from 'lucide-react';

export function ExploreSchemesPage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [savedSchemeIds, setSavedSchemeIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  const categories = [
    'All',
    'Agriculture & Farmers',
    'Health & Healthcare',
    'Housing & Shelter',
    'Education & Youth',
    'Social Security & Pension',
    'Disability Welfare',
    'Handloom & Handicrafts',
  ];

  const states = [
    'All',
    'All-India',
    'Tamil Nadu',
    'Uttar Pradesh',
    'Maharashtra',
    'Gujarat',
    'Karnataka',
    'Rajasthan',
    'Madhya Pradesh',
    'West Bengal',
  ];

  const beneficiaries = [
    { id: 'All', label: t('allBeneficiaries', 'All Beneficiaries') },
    { id: 'farmer', label: t('farmers', 'Farmers & Cultivators') },
    { id: 'women', label: t('women', 'Women & Mothers') },
    { id: 'student', label: t('students', 'Students & Youth') },
    { id: 'senior', label: t('seniors', 'Senior Citizens') },
    { id: 'artisan', label: t('artisans', 'Artisans & Weavers') },
  ];

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await schemesAPI.getAll({
        search: search || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
      });
      setSchemes(res.data.data || []);
    } catch (err) {
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSaved = async () => {
    try {
      const res = await savedSchemesAPI.getAll();
      const ids = new Set((res.data.data || []).map((s) => s.id));
      setSavedSchemeIds(ids);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory, selectedState]);

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  const handleSaveToggle = async (schemeId) => {
    try {
      if (savedSchemeIds.has(schemeId)) {
        await savedSchemesAPI.remove(schemeId);
        setSavedSchemeIds((prev) => {
          const next = new Set(prev);
          next.delete(schemeId);
          return next;
        });
        setToastMessage('Scheme removed from bookmarks.');
      } else {
        await savedSchemesAPI.save(schemeId);
        setSavedSchemeIds((prev) => new Set([...prev, schemeId]));
        setToastMessage('Scheme saved to your bookmarks!');
      }
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Error bookmarking scheme:', err);
    }
  };

  const displayedSchemes = useMemo(() => {
    if (selectedBeneficiary === 'All') return schemes;
    return schemes.filter((s) => {
      const text = `${s.scheme_name} ${s.description} ${s.category} ${JSON.stringify(s.eligible_occupations || [])}`.toLowerCase();
      if (selectedBeneficiary === 'farmer') {
        return text.includes('farmer') || text.includes('kisan') || text.includes('agri') || text.includes('uzhavar') || text.includes('cultivator');
      }
      if (selectedBeneficiary === 'women') {
        return text.includes('women') || text.includes('magalir') || text.includes('mother') || text.includes('girl') || text.includes('pudhumai') || text.includes('female');
      }
      if (selectedBeneficiary === 'student') {
        return text.includes('student') || text.includes('education') || text.includes('college') || text.includes('scholarship') || text.includes('youth');
      }
      if (selectedBeneficiary === 'senior') {
        return text.includes('senior') || text.includes('pension') || text.includes('old age') || text.includes('ignoaps');
      }
      if (selectedBeneficiary === 'artisan') {
        return text.includes('artisan') || text.includes('weaver') || text.includes('handloom') || text.includes('craft');
      }
      return true;
    });
  }, [schemes, selectedBeneficiary]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5 mr-1.5" />
            {t('appName')} Directory
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            {t('navAllSchemes')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ta'
              ? 'தமிழ்நாடு மற்றும் மத்திய அரசுத் துறைகளின் சரிபார்க்கப்பட்ட நலத்திட்டங்கள்.'
              : 'Browse verified welfare schemes across Central and State ministries.'}
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          Showing <span className="text-brand-purple font-black">{displayedSchemes.length}</span> Active Programs
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center shadow-md animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-brand-purple outline-hidden transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white font-bold text-xs shadow-xs transition"
          >
            {t('askQuestion', 'Search')}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
          {/* Beneficiary Type */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600 text-[11px]">{t('filterByBeneficiary')}:</span>
            <select
              value={selectedBeneficiary}
              onChange={(e) => setSelectedBeneficiary(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium focus:border-brand-purple outline-hidden bg-white"
            >
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600 text-[11px]">{t('category')}:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium focus:border-brand-purple outline-hidden bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Region / Coverage */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-600 text-[11px]">{t('coverage')}:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium focus:border-brand-purple outline-hidden bg-white"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Schemes */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
          <div className="text-xs font-bold text-slate-700">Loading Schemes...</div>
        </div>
      ) : displayedSchemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-sm text-slate-700">No schemes found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your beneficiary, category, or region filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onSave={handleSaveToggle}
              isSaved={savedSchemeIds.has(scheme.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExploreSchemesPage;
