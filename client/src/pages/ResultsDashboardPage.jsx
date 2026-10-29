import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eligibilityAPI, savedSchemesAPI } from '../services/api';
import SchemeCard from '../components/SchemeCard';
import {
  FileCheck,
  CheckCircle2,
  HelpCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Info,
  ArrowUpDown,
  Bookmark,
  Calendar,
  AlertCircle,
  ShieldAlert,
  User,
  ArrowRight,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export function ResultsDashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [evaluationData, setEvaluationData] = useState(null);
  const [savedSchemeIds, setSavedSchemeIds] = useState(new Set());
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Filters & Sorting state
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score_desc');
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const runEvaluation = async () => {
    setEvaluating(true);
    setErrorMessage('');
    try {
      const res = await eligibilityAPI.evaluate();
      setEvaluationData(res.data.data);
      // Also reload history
      loadHistory();
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.message?.includes('complete your citizen profile')) {
        navigate('/profile');
      } else {
        setErrorMessage(err.response?.data?.message || 'Failed to execute eligibility evaluation.');
      }
    } finally {
      setLoading(false);
      setEvaluating(false);
    }
  };

  const loadSaved = async () => {
    try {
      const res = await savedSchemesAPI.getAll();
      const ids = new Set((res.data.data || []).map((s) => s.id));
      setSavedSchemeIds(ids);
    } catch {
      // ignore
    }
  };

  const loadHistory = async () => {
    try {
      const res = await eligibilityAPI.getHistory();
      setAssessmentHistory(res.data.data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    runEvaluation();
    loadSaved();
    loadHistory();
  }, []);

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
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  // Compute profile completion percentage
  const computeProfileCompletion = () => {
    if (!profile) return 50;
    const requiredFields = [
      'full_name',
      'age',
      'state',
      'district',
      'annual_income',
      'occupation',
      'housing_status',
      'area_type',
    ];
    let filled = 0;
    requiredFields.forEach((field) => {
      if (profile[field] !== undefined && profile[field] !== null && profile[field] !== '') {
        filled += 1;
      }
    });
    return Math.round((filled / requiredFields.length) * 100);
  };

  const completionPercent = computeProfileCompletion();

  // Filter and sort recommendations
  const allRecommendations = evaluationData?.recommendations || [];

  const filteredRecommendations = allRecommendations.filter((rec) => {
    // Status filter
    if (statusFilter !== 'All' && rec.result_category !== statusFilter) {
      return false;
    }
    // Category filter
    if (categoryFilter !== 'All' && rec.category !== categoryFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = rec.scheme_name.toLowerCase().includes(query);
      const matchDept = rec.department?.toLowerCase().includes(query);
      const matchCat = rec.category.toLowerCase().includes(query);
      if (!matchName && !matchDept && !matchCat) return false;
    }
    return true;
  });

  // Sorting
  filteredRecommendations.sort((a, b) => {
    if (sortBy === 'score_desc') {
      return b.matching_score - a.matching_score;
    }
    if (sortBy === 'score_asc') {
      return a.matching_score - b.matching_score;
    }
    if (sortBy === 'name_asc') {
      return a.scheme_name.localeCompare(b.scheme_name);
    }
    return 0;
  });

  // Unique categories for filter dropdown
  const uniqueCategories = [
    'All',
    ...Array.from(new Set(allRecommendations.map((r) => r.category))),
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 bg-slate-50">
        <RefreshCw className="w-10 h-10 animate-spin text-teal-600 mb-4" />
        <h2 className="text-base font-bold text-slate-800">
          Running Socio-Economic Rule Evaluation...
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Comparing your profile against active welfare schemes, mandatory conditions, and income ceilings.
        </p>
      </div>
    );
  }

  const citizenName = profile?.full_name || user?.full_name || 'Citizen';

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome & Profile Summary Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={citizenName}
                className="w-14 h-14 rounded-full border-2 border-teal-500/30 object-cover shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-extrabold text-xl shrink-0 shadow-2xs">
                {citizenName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1">
              <div className="inline-flex items-center text-xs font-semibold text-teal-700 uppercase tracking-wider">
                <FileCheck className="w-4 h-4 mr-1.5" />
                Citizen Welfare Dashboard
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {citizenName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Profile: <span className="font-semibold text-slate-800">{profile?.occupation || 'General'}</span> • {profile?.state || 'National'} • Income: ₹{profile?.annual_income?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/profile"
              className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
            >
              <User className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Update Profile
            </Link>

            <button
              onClick={runEvaluation}
              disabled={evaluating}
              className="inline-flex items-center px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${evaluating ? 'animate-spin' : ''}`} />
              {evaluating ? 'Checking...' : 'Check My Eligibility'}
            </button>
          </div>
        </div>

        {/* Profile Completion Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Profile Completion Status</span>
              <span className="text-teal-700 font-bold">{completionPercent}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-1.5">
              <div
                className="bg-teal-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              {completionPercent >= 100
                ? 'Your socio-economic profile is fully filled for high accuracy predictions.'
                : 'Complete all socio-economic fields to ensure all mandatory conditions can be verified.'}
            </p>
          </div>

          {completionPercent < 100 && (
            <Link
              to="/profile"
              className="inline-flex items-center text-xs font-semibold text-teal-700 hover:text-teal-800 shrink-0"
            >
              <span>Add Missing Details</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          )}
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center shadow-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-teal-400 mr-2" />
            {toastMessage}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center">
            <AlertCircle className="w-5 h-5 text-rose-600 mr-2 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. Total Evaluated */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Total Evaluated
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {evaluationData?.total_evaluated || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Active schemes checked
            </div>
          </div>

          {/* 2. Potential Matches */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'Potentially Eligible' ? 'All' : 'Potentially Eligible')}
            className={`bg-white p-5 rounded-xl border cursor-pointer transition shadow-2xs ${
              statusFilter === 'Potentially Eligible'
                ? 'border-teal-500 ring-2 ring-teal-200 bg-teal-50/20'
                : 'border-slate-200 hover:border-teal-300'
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1 flex items-center justify-between">
              <span>Potential Matches</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-extrabold text-teal-700">
              {evaluationData?.potential_matches || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Mandatory rules satisfied
            </div>
          </div>

          {/* 3. Needs More Information */}
          <div
            onClick={() => setStatusFilter(statusFilter === 'Needs More Information' ? 'All' : 'Needs More Information')}
            className={`bg-white p-5 rounded-xl border cursor-pointer transition shadow-2xs ${
              statusFilter === 'Needs More Information'
                ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/20'
                : 'border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-1 flex items-center justify-between">
              <span>Needs More Info</span>
              <HelpCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-700">
              {evaluationData?.needs_more_info || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Missing profile parameters
            </div>
          </div>

          {/* 4. Saved Schemes */}
          <Link
            to="/saved-schemes"
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-teal-300 transition shadow-2xs block"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 flex items-center justify-between">
              <span>Saved Schemes</span>
              <Bookmark className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">
              {savedSchemeIds.size}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center">
              <span>View Bookmarks</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </div>
          </Link>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search scheme name, ministry, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Sectors' : c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Potentially Eligible">Potentially Eligible</option>
              <option value="Needs More Information">Needs More Information</option>
              <option value="Unlikely to Qualify">Unlikely to Qualify</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFormulaModal(true)}
              className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center transition"
            >
              <Info className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              Formula Info
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-700"
            >
              <option value="score_desc">Highest Match First</option>
              <option value="score_asc">Lowest Match First</option>
              <option value="name_asc">Scheme Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Scheme Recommendation Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Evaluated Schemes ({filteredRecommendations.length})
            </h2>
            <span className="text-xs text-slate-500">
              Showing filtered results
            </span>
          </div>

          {filteredRecommendations.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-2xs">
              <h3 className="text-base font-bold text-slate-800">No schemes match criteria filter</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Reset the status or sector filters to view other evaluated welfare schemes.
              </p>
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setCategoryFilter('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((scheme) => (
                <SchemeCard
                  key={scheme.scheme_id}
                  scheme={scheme}
                  onSave={handleSaveToggle}
                  isSaved={savedSchemeIds.has(scheme.scheme_id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Eligibility Assessments History Section */}
        {assessmentHistory.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Eligibility Assessments
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Audit Log History
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Schemes Checked</th>
                    <th className="py-2.5 px-3">Potential Matches</th>
                    <th className="py-2.5 px-3">Needs More Info</th>
                    <th className="py-2.5 px-3">Unlikely</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessmentHistory.slice(0, 5).map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {new Date(session.evaluated_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">{session.total_schemes_evaluated}</td>
                      <td className="py-2.5 px-3 text-teal-700 font-bold">{session.eligible_count}</td>
                      <td className="py-2.5 px-3 text-amber-700">{session.needs_info_count}</td>
                      <td className="py-2.5 px-3 text-slate-400">{session.unlikely_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Advisory Next Steps Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-start space-x-3 text-xs text-slate-600 leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">Application Next Steps:</span> Recommended schemes are potential matches based on submitted profile parameters. For any scheme marked <span className="font-semibold text-teal-700">Potentially Eligible</span>, click "View Details" to examine the complete document checklist, then click the official portal link to access the verified government application service.
          </div>
        </div>
      </div>

      {/* Formula & Calculation Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
              <Info className="w-5 h-5 text-teal-600 mr-2" />
              How Matching Scores Are Calculated
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                The prediction engine implements an explainable, deterministic mathematical rule algorithm:
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 text-center font-bold">
                Matching Score = (∑ Weight × Match_Value / ∑ Weights) × 100
              </div>
              <ul className="space-y-1.5 list-disc pl-5">
                <li><span className="font-bold text-slate-800">Match Values:</span> 1.0 (satisfied), 0.0 (unsatisfied), 0.5 (marginal 5% buffer on optional parameters).</li>
                <li><span className="font-bold text-slate-800">Mandatory Rules Gating:</span> Mandatory conditions must be satisfied. A high matching score never overrides a failed mandatory condition.</li>
                <li><span className="font-bold text-slate-800">Unknown Parameters:</span> Missing profile attributes are identified as "Needs More Information" rather than assumed satisfied.</li>
              </ul>
              <div className="p-3 bg-teal-50 rounded-lg text-teal-900 text-[11px]">
                Matching scores indicate internal alignment with eligibility guidelines, not official government approval.
              </div>
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsDashboardPage;
