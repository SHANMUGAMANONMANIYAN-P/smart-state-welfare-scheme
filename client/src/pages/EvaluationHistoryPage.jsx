import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eligibilityAPI } from '../services/api';
import {
  History,
  Calendar,
  CheckCircle2,
  HelpCircle,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Layers,
  FileCheck,
} from 'lucide-react';

export default function EvaluationHistoryPage() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await eligibilityAPI.getHistory();
        setHistoryList(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load assessment history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Loading Evaluation History...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5 mr-1.5" />
            Audit & Prediction Trail
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            Evaluation History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical log of all scheme matching assessments generated for your profile.
          </p>
        </div>

        <Link
          to="/check-eligibility"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-bold shadow-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Run New Assessment
        </Link>
      </div>

      {/* History Records Table / Cards */}
      {historyList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <History className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-sm text-slate-700">No Assessment History Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't executed any scheme evaluations yet. Run your first check to record an assessment.
          </p>
          <Link
            to="/check-eligibility"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-bold shadow-xs hover:bg-brand-purpleDark transition"
          >
            Check Eligibility
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {historyList.map((item, index) => {
            const dateStr = item.evaluated_at
              ? new Date(item.evaluated_at).toLocaleString()
              : 'Recent Evaluation';

            return (
              <div
                key={item.id || index}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-brand-purple/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-lavender text-brand-purple">
                      Assessment #{item.id || index + 1}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {dateStr}
                    </span>
                  </div>

                  <div className="text-sm font-extrabold text-brand-navy pt-0.5">
                    Evaluated {item.total_schemes_evaluated || 7} Welfare Programs
                  </div>
                </div>

                {/* Outcome Pill Counters */}
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-bold">
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{item.eligible_count || 0} Eligible</span>
                  </div>

                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-100">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{item.needs_info_count || 0} Needs Info</span>
                  </div>

                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-100">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{item.unlikely_count || 0} Unlikely</span>
                  </div>

                  <Link
                    to="/recommended"
                    className="p-2 rounded-xl text-brand-purple hover:bg-brand-lavender/40 transition"
                    title="View recommendations"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
