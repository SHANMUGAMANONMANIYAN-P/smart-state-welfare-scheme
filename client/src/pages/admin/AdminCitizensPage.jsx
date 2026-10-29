import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import {
  Users,
  Search,
  ShieldCheck,
  RefreshCw,
  Calendar,
  MapPin,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

export default function AdminCitizensPage() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCitizens = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCitizens();
      setCitizens(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load citizen records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCitizens();
  }, []);

  const filtered = citizens.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.state?.toLowerCase().includes(q) ||
      c.district?.toLowerCase().includes(q) ||
      c.occupation?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Loading Administrative Citizen Records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Legitimate Administrative Records
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            Citizen Accounts & Activity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Privacy-preserving registry of registered citizens and their scheme evaluation metrics.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          Total Citizens: <span className="text-brand-purple font-black">{citizens.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search citizens by name, state, district, trade..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-brand-purple outline-hidden transition"
          />
        </div>
      </div>

      {/* Citizens Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Citizen Name & ID</th>
                <th className="py-3 px-4">State & District</th>
                <th className="py-3 px-4">Trade / Sector</th>
                <th className="py-3 px-4">Area Type</th>
                <th className="py-3 px-4 text-center">Evaluations Run</th>
                <th className="py-3 px-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-brand-navy text-sm">
                      {c.full_name || 'Citizen User'}
                    </div>
                    <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                      Citizen ID: #{c.id} • {c.email ? `${c.email.slice(0, 3)}***@${c.email.split('@')[1] || 'domain'}` : 'Private'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-700 flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                      {c.district}, {c.state}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {c.occupation || 'General Worker'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-600 font-medium">
                    {c.area_type || 'urban'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-brand-lavender text-brand-purple">
                      {c.evaluation_count || 0} Assessments
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active'}
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
