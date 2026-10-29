import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import {
  TrendingUp,
  Printer,
  FileCheck,
  RefreshCw,
  Layers,
  Award,
  Bookmark,
  Building,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getReports();
      setReports(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Compiling Administrative Reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Policy & Coverage Analytics
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            Administrative Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit breakdown of program demand, matched beneficiaries, and bookmark popularity.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition"
        >
          <Printer className="w-4 h-4 mr-1.5 text-brand-purple" />
          Print / Export Report
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-brand-navy">
            Welfare Program Efficacy & Match Summary
          </h3>
          <span className="text-xs text-slate-400 font-semibold">
            {reports.length} Monitored Schemes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Scheme Name & Department</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Configured Criteria</th>
                <th className="py-3.5 px-4 text-center">Required Docs</th>
                <th className="py-3.5 px-4 text-center">Citizen Bookmarks</th>
                <th className="py-3.5 px-4 text-center">Matched Citizens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-brand-navy text-sm">
                      {s.scheme_name}
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center mt-0.5">
                      <Building className="w-3 h-3 mr-1" />
                      {s.department}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-lavender text-brand-purple">
                      {s.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {s.criteria_count || 0}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {s.documents_count || 0}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700">
                      {s.bookmark_count || 0}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                      {s.matched_citizens_count || 0} Eligible
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
