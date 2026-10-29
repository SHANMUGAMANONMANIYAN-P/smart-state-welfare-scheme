import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eligibilityAPI, savedSchemesAPI, profileAPI } from '../services/api';
import SchemeCard from '../components/SchemeCard';
import SchemeDetailModal from '../components/SchemeDetailModal';
import {
  FileCheck,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Award,
  Bookmark,
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  BarChart2,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export default function CitizenDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [evaluationData, setEvaluationData] = useState(null);
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [completionStatus, setCompletionStatus] = useState({
    completion_percentage: 0,
    is_complete: false,
  });
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load summary metrics, evaluation status, and saved schemes
  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Fetch completion status (does NOT return private field values)
      try {
        const compRes = await profileAPI.getCompletion();
        if (compRes.data?.data) {
          setCompletionStatus(compRes.data.data);
        }
      } catch {
        // Fallback default
      }

      // 2. Fetch latest evaluation
      try {
        const evalRes = await eligibilityAPI.evaluate();
        setEvaluationData(evalRes.data?.data);
      } catch (e) {
        // If not evaluated yet or needs profile
        if (e.response?.status === 400 && e.response.data?.message?.includes('profile')) {
          setErrorMessage('Please complete your profile to enable personalized scheme matching.');
        }
      }

      // 3. Fetch saved schemes
      try {
        const savedRes = await savedSchemesAPI.getAll();
        setSavedSchemes(savedRes.data?.data || []);
      } catch {
        // ignore
      }

      // 4. Fetch evaluation history
      try {
        const histRes = await eligibilityAPI.getHistory();
        setHistoryList(histRes.data?.data || []);
      } catch {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    setErrorMessage('');
    try {
      const res = await eligibilityAPI.evaluate();
      setEvaluationData(res.data?.data);
      // Refresh history
      const histRes = await eligibilityAPI.getHistory();
      setHistoryList(histRes.data?.data || []);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to execute eligibility evaluation.'
      );
    } finally {
      setEvaluating(false);
    }
  };

  const handleRemoveSaved = async (schemeId) => {
    try {
      await savedSchemesAPI.remove(schemeId);
      setSavedSchemes((prev) => prev.filter((s) => s.id !== schemeId));
    } catch {
      // ignore
    }
  };

  // Metrics calculation
  const recommendations = evaluationData?.recommendations || [];
  const evaluatedCount = evaluationData?.total_evaluated || recommendations.length || 0;
  const potentiallyEligibleCount = recommendations.filter(
    (r) => r.result_category === 'Potentially Eligible'
  ).length;
  const highlyMatchedCount = recommendations.filter(
    (r) => r.matching_score >= 80 && r.result_category === 'Potentially Eligible'
  ).length;

  // Calculate missing documents count across potentially eligible schemes
  const missingDocsCount = recommendations
    .filter((r) => r.result_category === 'Potentially Eligible')
    .reduce((acc, curr) => acc + (curr.documents?.length || 2), 0);

  // Chart data for matching breakdown
  const outcomeData = [
    { name: 'Eligible', count: potentiallyEligibleCount, color: '#10B981' },
    {
      name: 'Needs Info',
      count: recommendations.filter((r) => r.result_category === 'Needs More Information').length,
      color: '#F59E0B',
    },
    {
      name: 'Unlikely',
      count: recommendations.filter((r) => r.result_category === 'Unlikely to Qualify').length,
      color: '#EF4444',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-10 h-10 animate-spin text-brand-purple mb-4" />
        <h3 className="text-base font-bold text-brand-navy">
          Loading Citizen Welfare Dashboard...
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Synchronizing verified schemes and eligibility criteria.
        </p>
      </div>
    );
  }

  const displayName = user?.full_name || 'Citizen';

  return (
    <div className="space-y-6">
      {/* Top Banner / Evaluation Trigger Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Welfare Recommendation Dashboard
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-navy tracking-tight">
            Welcome back, {displayName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent, rule-based government scheme matching for your household.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Link
            to="/check-eligibility"
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-bold shadow-md shadow-brand-purple/20 transition"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Check Eligibility
          </Link>

          <button
            onClick={handleRunEvaluation}
            disabled={evaluating}
            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            title="Re-run assessment"
          >
            <RefreshCw className={`w-4 h-4 ${evaluating ? 'animate-spin text-brand-purple' : ''}`} />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 4 Summary Cards (Section 6.A: Lavender, Mint Green, Light Blue, Pale Orange) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Schemes Evaluated (Lavender) */}
        <div className="bg-gradient-to-br from-brand-lavender/90 to-brand-lavender/50 border border-brand-lavenderDark/90 p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-purple">Schemes Evaluated</span>
            <div className="w-8 h-8 rounded-xl bg-white/80 border border-brand-purple/20 flex items-center justify-center text-brand-purple shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-brand-navy tracking-tight">
              {evaluatedCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Active central & state schemes
            </p>
          </div>
        </div>

        {/* Card 2: Potentially Eligible Schemes (Mint green) */}
        <div className="bg-gradient-to-br from-brand-mint/90 to-brand-mint/50 border border-brand-mintDark/90 p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Potentially Eligible</span>
            <div className="w-8 h-8 rounded-xl bg-white/80 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-950 tracking-tight">
              {potentiallyEligibleCount}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">
              Satisfies criteria rules
            </p>
          </div>
        </div>

        {/* Card 3: Highly Matched Schemes (Light blue) */}
        <div className="bg-gradient-to-br from-brand-blue/90 to-brand-blue/50 border border-brand-blueDark/90 p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800">Highly Matched (&ge;80%)</span>
            <div className="w-8 h-8 rounded-xl bg-white/80 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-2xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-blue-950 tracking-tight">
              {highlyMatchedCount}
            </div>
            <p className="text-[11px] text-blue-700 mt-1 font-medium">
              High weighted confidence
            </p>
          </div>
        </div>

        {/* Card 4: Missing Documents (Pale orange) */}
        <div className="bg-gradient-to-br from-brand-orange/90 to-brand-orange/50 border border-brand-orangeDark/90 p-5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">Required Documents</span>
            <div className="w-8 h-8 rounded-xl bg-white/80 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-2xs">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-950 tracking-tight">
              {missingDocsCount}
            </div>
            <p className="text-[11px] text-amber-800 mt-1 font-medium">
              Checklist across eligible programs
            </p>
          </div>
        </div>
      </div>

      {/* Profile Completion Reminder (Section 5.B & 6.D) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-brand-navy">
            <span>Complete your profile to improve welfare scheme matching.</span>
            <span className="text-brand-purple font-black">
              {completionStatus.completion_percentage}% Complete
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-purple h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionStatus.completion_percentage}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500">
            A comprehensive socio-economic profile unlocks verified matches across agriculture, education, housing, and social security.
          </p>
        </div>

        <Link
          to="/profile"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-lavender hover:bg-brand-lavenderDark/60 text-brand-purple text-xs font-bold transition shrink-0"
        >
          <span>Complete Profile</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      {/* Grid: Recommended Welfare Schemes (Left 2 cols) & Eligibility Activity (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended Welfare Schemes (Section 6.B) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-brand-navy tracking-tight">
                Recommended Welfare Schemes
              </h3>
              <p className="text-xs text-slate-500">
                Ranked by suitability score and mandatory condition satisfaction.
              </p>
            </div>

            <Link
              to="/recommended"
              className="text-xs font-bold text-brand-purple hover:underline flex items-center"
            >
              <span>View All ({recommendations.length})</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="font-bold text-sm text-slate-700">
                No Evaluation Results Yet
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "Check Eligibility" to run the rule matching engine against active government schemes.
              </p>
              <Link
                to="/check-eligibility"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-bold shadow-xs hover:bg-brand-purpleDark transition"
              >
                Start Evaluation
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((scheme) => (
                <SchemeCard
                  key={scheme.id || scheme.scheme_id}
                  scheme={scheme}
                  onSave={() => {}}
                  isSaved={savedSchemes.some((s) => s.id === (scheme.id || scheme.scheme_id))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Eligibility Activity & Charts (Section 6.C) */}
        <div className="space-y-6">
          {/* Activity Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-brand-navy">
                Eligibility Activity
              </h3>
              <Link
                to="/history"
                className="text-[11px] font-bold text-brand-purple hover:underline"
              >
                Full History
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Evaluations</div>
                <div className="text-xl font-black text-brand-navy mt-0.5">
                  {historyList.length || 1}
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Last Run</div>
                <div className="text-xs font-bold text-brand-navy mt-1 truncate">
                  {historyList[0]?.evaluated_at
                    ? new Date(historyList[0].evaluated_at).toLocaleDateString()
                    : 'Today'}
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Match Distribution
              </div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={outcomeData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={75} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {outcomeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Saved Schemes Preview (Section 6.E) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-sm font-extrabold text-brand-navy">
                <Bookmark className="w-4 h-4 text-brand-purple" />
                <span>Saved Schemes</span>
              </div>
              <Link
                to="/saved-schemes"
                className="text-[11px] font-bold text-brand-purple hover:underline"
              >
                View All ({savedSchemes.length})
              </Link>
            </div>

            {savedSchemes.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No bookmarked schemes yet. Click the bookmark icon on any scheme to save it.
              </div>
            ) : (
              <div className="space-y-2">
                {savedSchemes.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:border-brand-purple/30 transition"
                  >
                    <div className="flex-1 pr-2 truncate">
                      <div className="font-bold text-brand-navy truncate">
                        {item.scheme_name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {item.category}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => setSelectedScheme(item)}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-brand-purple text-[11px] font-bold hover:bg-brand-lavender/40 transition"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleRemoveSaved(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition"
                        title="Remove from saved"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
