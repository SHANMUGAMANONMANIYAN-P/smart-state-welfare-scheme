import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eligibilityAPI, savedSchemesAPI } from '../services/api';
import SchemeCard from '../components/SchemeCard';
import SchemeDetailModal from '../components/SchemeDetailModal';
import {
  Award,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  FileText,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

export default function RecommendedSchemesPage() {
  const navigate = useNavigate();

  const [evaluationData, setEvaluationData] = useState(null);
  const [savedSchemeIds, setSavedSchemeIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score_desc');

  const loadData = async () => {
    setLoading(true);
    try {
      const evalRes = await eligibilityAPI.evaluate();
      setEvaluationData(evalRes.data?.data);

      try {
        const savedRes = await savedSchemesAPI.getAll();
        setSavedSchemeIds(new Set((savedRes.data?.data || []).map((s) => s.id)));
      } catch {
        // ignore
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.message?.includes('profile')) {
        navigate('/profile');
      } else {
        setErrorMessage(
          err.response?.data?.message || 'Failed to load recommended schemes.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReevaluate = async () => {
    setEvaluating(true);
    try {
      const evalRes = await eligibilityAPI.evaluate();
      setEvaluationData(evalRes.data?.data);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Re-evaluation failed.');
    } finally {
      setEvaluating(false);
    }
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
      } else {
        await savedSchemesAPI.save(schemeId, 'Bookmarked from recommendations');
        setSavedSchemeIds((prev) => {
          const next = new Set(prev);
          next.add(schemeId);
          return next;
        });
      }
    } catch {
      // ignore
    }
  };

  const allRecommendations = evaluationData?.recommendations || [];

  // Filter recommendations
  const filtered = allRecommendations.filter((rec) => {
    if (statusFilter !== 'All' && rec.result_category !== statusFilter) {
      return false;
    }
    if (categoryFilter !== 'All' && rec.category !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.scheme_name.toLowerCase().includes(q);
      const matchDept = rec.department?.toLowerCase().includes(q);
      const matchCat = rec.category.toLowerCase().includes(q);
      if (!matchName && !matchDept && !matchCat) return false;
    }
    return true;
  });

  // Sort recommendations
  filtered.sort((a, b) => {
    if (sortBy === 'score_desc') return b.matching_score - a.matching_score;
    if (sortBy === 'score_asc') return a.matching_score - b.matching_score;
    if (sortBy === 'name_asc') return a.scheme_name.localeCompare(b.scheme_name);
    return 0;
  });

  const categories = ['All', ...Array.from(new Set(allRecommendations.map((r) => r.category)))];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-10 h-10 animate-spin text-brand-purple mb-4" />
        <h3 className="text-base font-bold text-brand-navy">
          Computing Scheme Rankings...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Scoring criteria and checking mandatory condition gates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Ranked Welfare Recommendations
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            Recommended Schemes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparently ranked according to weighted match scores and mandatory eligibility compliance.
          </p>
        </div>

        <button
          onClick={handleReevaluate}
          disabled={evaluating}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-bold shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${evaluating ? 'animate-spin' : ''}`} />
          {evaluating ? 'Evaluating...' : 'Re-evaluate All Schemes'}
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scheme name, department..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-hidden transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium focus:border-brand-purple outline-hidden bg-white"
          >
            <option value="All">All Match Statuses</option>
            <option value="Potentially Eligible">Potentially Eligible</option>
            <option value="Needs More Information">Needs More Information</option>
            <option value="Unlikely to Qualify">Unlikely to Qualify</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium focus:border-brand-purple outline-hidden bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium focus:border-brand-purple outline-hidden bg-white"
          >
            <option value="score_desc">Highest Score First</option>
            <option value="score_asc">Lowest Score First</option>
            <option value="name_asc">Scheme Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Scheme Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-sm text-slate-700">No matching schemes found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, status filter, or category selector.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((scheme) => (
            <SchemeCard
              key={scheme.id || scheme.scheme_id}
              scheme={scheme}
              onSave={() => handleSaveToggle(scheme.id || scheme.scheme_id)}
              isSaved={savedSchemeIds.has(scheme.id || scheme.scheme_id)}
            />
          ))}
        </div>
      )}

      {/* Official Government Disclaimer (Section 8 Step 7) */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed text-center">
        These results are preliminary guidance based on the information provided and the configured scheme criteria. Final eligibility and benefit approval depend on verification by the relevant government department.
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
}
