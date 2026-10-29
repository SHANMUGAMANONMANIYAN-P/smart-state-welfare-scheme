import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  X,
  Building,
} from 'lucide-react';

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [form, setForm] = useState({
    scheme_name: '',
    slug: '',
    description: '',
    category: 'Agriculture & Farmers',
    department: '',
    state_coverage: 'All-India',
    min_age: '',
    max_age: '',
    min_income: '',
    max_income: '',
    eligible_occupations: '["All"]',
    official_url: '',
    is_active: true,
    source_ref: 'Official Government Portal',
    last_verified_date: new Date().toISOString().split('T')[0],
  });

  const categories = [
    'Agriculture & Farmers',
    'Health & Healthcare',
    'Housing & Shelter',
    'Education & Youth',
    'Social Security & Pension',
    'Disability Welfare',
    'Handloom & Handicrafts',
    'Women & Child Development',
  ];

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllSchemes();
      setSchemes(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const handleToggleStatus = async (scheme) => {
    try {
      await adminAPI.toggleStatus(scheme.id, !scheme.is_active);
      setSchemes((prev) =>
        prev.map((s) => (s.id === scheme.id ? { ...s, is_active: !s.is_active } : s))
      );
      setToastMessage(`Scheme ${scheme.is_active ? 'deactivated' : 'activated'} successfully.`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (schemeId) => {
    try {
      await adminAPI.deleteScheme(schemeId);
      setSchemes((prev) => prev.filter((s) => s.id !== schemeId));
      setDeleteConfirmId(null);
      setToastMessage('Scheme deleted successfully.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete scheme:', err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingScheme) {
        await adminAPI.updateScheme(editingScheme.id, form);
        setToastMessage('Scheme updated successfully.');
      } else {
        await adminAPI.createScheme(form);
        setToastMessage('New scheme created successfully.');
      }
      setShowAddModal(false);
      setEditingScheme(null);
      loadSchemes();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save scheme.');
    }
  };

  const openEdit = (scheme) => {
    setEditingScheme(scheme);
    setForm({
      scheme_name: scheme.scheme_name,
      slug: scheme.slug || '',
      description: scheme.description,
      category: scheme.category,
      department: scheme.department,
      state_coverage: scheme.state_coverage || 'All-India',
      min_age: scheme.min_age || '',
      max_age: scheme.max_age || '',
      min_income: scheme.min_income || '',
      max_income: scheme.max_income || '',
      eligible_occupations: scheme.eligible_occupations || '["All"]',
      official_url: scheme.official_url || '',
      is_active: Boolean(scheme.is_active),
      source_ref: scheme.source_ref || 'Official Government Portal',
      last_verified_date: scheme.last_verified_date
        ? String(scheme.last_verified_date).slice(0, 10)
        : new Date().toISOString().split('T')[0],
    });
    setShowAddModal(true);
  };

  const filtered = schemes.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.scheme_name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Loading Schemes Management...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Program Catalog & Configuration
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            Manage Welfare Schemes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, modify, activate/deactivate, and configure government welfare schemes.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingScheme(null);
            setForm({
              scheme_name: '',
              slug: '',
              description: '',
              category: 'Agriculture & Farmers',
              department: '',
              state_coverage: 'All-India',
              min_age: '',
              max_age: '',
              min_income: '',
              max_income: '',
              eligible_occupations: '["All"]',
              official_url: '',
              is_active: true,
              source_ref: 'Official Government Portal',
              last_verified_date: new Date().toISOString().split('T')[0],
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white font-bold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Scheme
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center shadow-md animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes by name or department..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-brand-purple outline-hidden transition"
          />
        </div>
        <div className="text-xs text-slate-500 font-semibold shrink-0">
          {filtered.length} Programs Registered
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Scheme Name & Department</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Coverage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((scheme) => (
                <tr key={scheme.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-brand-navy text-sm">
                      {scheme.scheme_name}
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center mt-0.5">
                      <Building className="w-3 h-3 mr-1" />
                      {scheme.department}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-lavender text-brand-purple">
                      {scheme.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {scheme.state_coverage || 'All-India'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleStatus(scheme)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        scheme.is_active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      title="Click to toggle status"
                    >
                      <Power className="w-3 h-3 mr-1" />
                      {scheme.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center space-x-1">
                      <button
                        onClick={() => openEdit(scheme)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-purple hover:bg-brand-lavender/40 transition"
                        title="Edit scheme"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(scheme.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete scheme"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-base text-brand-navy">Confirm Scheme Deletion</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete this welfare scheme? All attached eligibility criteria and document checklists will also be removed.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-brand-navy">
                {editingScheme ? 'Edit Welfare Scheme' : 'Add New Welfare Scheme'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Scheme Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.scheme_name}
                    onChange={(e) => setForm({ ...form, scheme_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple outline-hidden bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Department / Ministry <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Description & Benefit Summary <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    State / Geographical Coverage
                  </label>
                  <input
                    type="text"
                    value={form.state_coverage}
                    onChange={(e) => setForm({ ...form, state_coverage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Official Government Portal URL
                  </label>
                  <input
                    type="url"
                    value={form.official_url}
                    onChange={(e) => setForm({ ...form, official_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white font-bold shadow-xs"
                >
                  {editingScheme ? 'Save Changes' : 'Create Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
