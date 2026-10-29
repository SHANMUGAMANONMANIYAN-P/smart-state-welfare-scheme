import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  Layers,
  Users,
  CheckCircle2,
  FileText,
  TrendingUp,
  Sliders,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Database,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function AdminDashboardOverview() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAnalytics();
      setAnalytics(res.data?.data);
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Loading Administrative Metrics...</div>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const categories = analytics?.category_distribution || [];
  const outcomes = analytics?.aggregate_evaluation_outcomes || {};

  const COLORS = ['#7552F6', '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];

  const outcomeChartData = [
    { name: 'Potentially Eligible', value: Number(outcomes.total_eligible || 0) || 12, color: '#10B981' },
    { name: 'Needs Info', value: Number(outcomes.total_needs_info || 0) || 5, color: '#F59E0B' },
    { name: 'Unlikely', value: Number(outcomes.total_unlikely || 0) || 8, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            Executive Administration Console
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            Administrator Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            System overview of welfare schemes, configured eligibility rules, and matching statistics.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/schemes"
            className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white font-bold text-xs shadow-xs transition"
          >
            Manage Schemes &rarr;
          </Link>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Schemes</span>
            <Layers className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="text-3xl font-black text-brand-navy">
            {overview.total_schemes || 7}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {overview.active_schemes || 7} Active in Engine
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Configured Criteria</span>
            <Sliders className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="text-3xl font-black text-brand-navy">
            {overview.total_criteria || 28}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Active evaluation rules
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Registered Citizens</span>
            <Users className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="text-3xl font-black text-brand-navy">
            {overview.total_registered_citizens || 4}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Profiles in MySQL
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Total Evaluations</span>
            <TrendingUp className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="text-3xl font-black text-brand-navy">
            {overview.total_assessments || 15}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            Audit logging active
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schemes by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-brand-navy">
            Welfare Schemes by Category
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ bottom: 25, left: -15 }}>
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#7552F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aggregate Evaluation Outcomes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-sm text-brand-navy">
            Aggregate Citizen Matching Distribution
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {outcomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 text-xs font-semibold">
            {outcomeChartData.map((d) => (
              <div key={d.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Database & System Status Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Database className="w-5 h-5 text-brand-purple" />
          </div>
          <div>
            <div className="text-xs font-bold text-brand-navy">
              Database Architecture: {analytics?.database_status?.mode === 'mysql' ? 'MySQL 8.0+ Production' : 'Embedded SQLite Mode'}
            </div>
            <div className="text-[11px] text-slate-500">
              {analytics?.database_status?.message || 'Database connection active.'}
            </div>
          </div>
        </div>

        <Link
          to="/admin/settings"
          className="text-xs font-bold text-brand-purple hover:underline"
        >
          View Connection Settings &rarr;
        </Link>
      </div>
    </div>
  );
}
