import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { eligibilityAPI, profileAPI } from '../services/api';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Sliders,
  FileCheck,
  Award,
} from 'lucide-react';

export default function CheckEligibilityPage() {
  const navigate = useNavigate();

  const [completion, setCompletion] = useState({ completion_percentage: 0, is_complete: false });
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function checkReadiness() {
      try {
        const res = await profileAPI.getCompletion();
        if (res.data?.data) {
          setCompletion(res.data.data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    checkReadiness();
  }, []);

  const handleEvaluate = async () => {
    setEvaluating(true);
    setErrorMessage('');
    try {
      const res = await eligibilityAPI.evaluate();
      setEvaluationResult(res.data?.data);
    } catch (err) {
      if (err.response?.status === 400 && err.response.data?.message?.includes('complete your citizen profile')) {
        navigate('/profile');
      } else {
        setErrorMessage(
          err.response?.data?.message || 'Failed to execute eligibility evaluation.'
        );
      }
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Verifying profile readiness...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Rule-Based Prediction Engine
        </div>
        <h2 className="text-2xl font-black text-brand-navy tracking-tight">
          Check Welfare Scheme Eligibility
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          The engine compares your saved socio-economic profile against active Central and State scheme criteria. Each criterion is weighted and strictly gates mandatory requirements.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Engine Formula & Methodology Card */}
      <div className="bg-gradient-to-br from-brand-lavender/40 to-white rounded-2xl border border-brand-lavenderDark/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2">
          <Calculator className="w-5 h-5 text-brand-purple" />
          <h3 className="text-sm font-extrabold text-brand-navy">
            Weighted Mathematical Scoring Formula
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono text-xs text-brand-purple font-bold text-center overflow-x-auto shadow-2xs">
          Eligibility Score = [ Σ (Criterion Weight × Criterion Match) / Σ (Applicable Criterion Weights) ] × 100
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
            <span className="font-bold text-brand-navy block mb-0.5">1. Criterion Match</span>
            Satisfied = 1.0, Unsatisfied = 0.0, Optional numerical near-boundary buffer = 0.5.
          </div>
          <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
            <span className="font-bold text-brand-navy block mb-0.5">2. Mandatory Gating</span>
            Failing any mandatory condition strictly sets status to <span className="text-rose-600 font-semibold">Unlikely to Qualify</span>.
          </div>
          <div className="p-3 rounded-xl bg-white/80 border border-slate-100">
            <span className="font-bold text-brand-navy block mb-0.5">3. Unknown Data Handling</span>
            Missing fields are excluded from applicable weights and categorized as <span className="text-amber-600 font-semibold">Needs More Info</span>.
          </div>
        </div>
      </div>

      {/* Profile Readiness & Action Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Profile Readiness Check
            </div>
            <div className="text-lg font-extrabold text-brand-navy flex items-center space-x-2">
              <span>{completion.completion_percentage}% Information Completed</span>
              {completion.completion_percentage >= 80 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Ready
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Partial
                </span>
              )}
            </div>
          </div>

          <Link
            to="/profile"
            className="text-xs font-bold text-brand-purple hover:underline"
          >
            Review Profile Fields &rarr;
          </Link>
        </div>

        <div className="pt-2">
          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-sm font-extrabold shadow-md shadow-brand-purple/25 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {evaluating
                ? 'Running Socio-Economic Rule Evaluation...'
                : 'Execute Eligibility Prediction Engine'}
            </span>
          </button>
        </div>
      </div>

      {/* Immediate Evaluation Result Box (if run) */}
      {evaluationResult && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="font-extrabold text-base text-brand-navy">
                  Evaluation Completed Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Assessment ID #{evaluationResult.assessment_id} recorded in audit database.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/recommended')}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
            >
              <span>View Ranked Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-2">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="text-xs font-bold text-emerald-700">Potentially Eligible</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                {evaluationResult.eligible_count}
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="text-xs font-bold text-amber-700">Needs More Info</div>
              <div className="text-2xl font-black text-amber-900 mt-1">
                {evaluationResult.needs_info_count}
              </div>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
              <div className="text-xs font-bold text-rose-700">Unlikely to Qualify</div>
              <div className="text-2xl font-black text-rose-900 mt-1">
                {evaluationResult.unlikely_count}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
        <strong>Government Source Disclaimer:</strong> These results are preliminary guidance based on the information provided and the configured scheme criteria. Final eligibility and benefit approval depend on verification by the relevant government department.
      </div>
    </div>
  );
}
