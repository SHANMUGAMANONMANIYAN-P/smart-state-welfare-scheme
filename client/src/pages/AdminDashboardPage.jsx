import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Power,
  Search,
  Filter,
  BarChart3,
  FileCheck,
  ShieldCheck,
  Building,
  Calendar,
  ExternalLink,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
} from 'lucide-react';

export function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [managingCriteriaScheme, setManagingCriteriaScheme] = useState(null);
  const [managingDocsScheme, setManagingDocsScheme] = useState(null);

  // New criteria state
  const [newCriteria, setNewCriteria] = useState({
    criterion_type: 'income',
    profile_field: 'annual_income',
    operator: '<=',
    target_value: '250000',
    is_mandatory: true,
    weight: '2.0',
    description: 'Annual income must be within ceiling',
    failure_reason: 'Annual income exceeds prescribed ceiling',
  });

  // New document state
  const [newDoc, setNewDoc] = useState({
    document_name: '',
    description: '',
    is_mandatory: true,
    issuing_authority: '',
  });

  // Scheme Form state (for Add & Edit)
  const [schemeForm, setSchemeForm] = useState({
    scheme_name: '',
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
    source_ref: 'Official Portal',
    last_verified_date: new Date().toISOString().split('T')[0],
    is_demonstration: false,
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, schemesRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getAllSchemes(),
      ]);
      setAnalytics(analyticsRes.data.data);
      setSchemes(schemesRes.data.data || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (schemeId, currentStatus) => {
    try {
      await adminAPI.toggleStatus(schemeId, !currentStatus);
      setSchemes((prev) =>
        prev.map((s) => (s.id === schemeId ? { ...s, is_active: !currentStatus ? 1 : 0 } : s))
      );
      setToastMessage(`Scheme status updated to ${!currentStatus ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  const handleDeleteScheme = async (schemeId) => {
    if (!window.confirm('Are you sure you want to permanently delete this scheme?')) return;
    try {
      await adminAPI.deleteScheme(schemeId);
      setSchemes((prev) => prev.filter((s) => s.id !== schemeId));
      setToastMessage('Scheme deleted successfully.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Delete scheme error:', err);
    }
  };

  const handleSaveSchemeForm = async (e) => {
    e.preventDefault();
    try {
      if (editingScheme) {
        await adminAPI.updateScheme(editingScheme.id, schemeForm);
        setToastMessage('Scheme updated successfully.');
      } else {
        await adminAPI.createScheme(schemeForm);
        setToastMessage('New welfare scheme created successfully.');
      }
      setShowAddModal(false);
      setEditingScheme(null);
      loadData();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Save scheme error:', err);
      alert(err.response?.data?.message || 'Error saving scheme.');
    }
  };

  const handleAddCriteria = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addCriteria(managingCriteriaScheme.id, newCriteria);
      setToastMessage('Criteria rule added.');
      // Refresh current scheme criteria
      const res = await adminAPI.getAllSchemes();
      setSchemes(res.data.data || []);
      const updated = res.data.data.find((s) => s.id === managingCriteriaScheme.id);
      setManagingCriteriaScheme(updated);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add criteria.');
    }
  };

  const handleDeleteCriteria = async (criteriaId) => {
    try {
      await adminAPI.deleteCriteria(criteriaId);
      setToastMessage('Criteria rule removed.');
      loadData();
      setManagingCriteriaScheme(null);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Delete criteria error:', err);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addDocument(managingDocsScheme.id, newDoc);
      setToastMessage('Document requirement added.');
      setNewDoc({ document_name: '', description: '', is_mandatory: true, issuing_authority: '' });
      loadData();
      setManagingDocsScheme(null);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add document.');
    }
  };

  const openEditModal = (scheme) => {
    setEditingScheme(scheme);
    setSchemeForm({
      scheme_name: scheme.scheme_name,
      description: scheme.description,
      category: scheme.category,
      department: scheme.department,
      state_coverage: scheme.state_coverage || 'All-India',
      min_age: scheme.min_age !== null ? scheme.min_age : '',
      max_age: scheme.max_age !== null ? scheme.max_age : '',
      min_income: scheme.min_income !== null ? scheme.min_income : '',
      max_income: scheme.max_income !== null ? scheme.max_income : '',
      eligible_occupations: Array.isArray(scheme.eligible_occupations)
        ? JSON.stringify(scheme.eligible_occupations)
        : scheme.eligible_occupations || '["All"]',
      official_url: scheme.official_url || '',
      is_active: Boolean(scheme.is_active),
      source_ref: scheme.source_ref || 'Official Portal',
      last_verified_date: scheme.last_verified_date || new Date().toISOString().split('T')[0],
      is_demonstration: Boolean(scheme.is_demonstration),
    });
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setEditingScheme(null);
    setSchemeForm({
      scheme_name: '',
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
      source_ref: 'Official Portal',
      last_verified_date: new Date().toISOString().split('T')[0],
      is_demonstration: false,
    });
    setShowAddModal(true);
  };

  const filteredSchemes = schemes.filter((s) => {
    if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.scheme_name.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Administrative Console</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Scheme & Rule Management Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage welfare schemes, flexible criteria conditions, weights, and document checklists.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-slate-900 text-teal-300 hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center shadow-xs transition"
            >
              <Plus className="w-4 h-4 mr-1 text-teal-400" />
              Add New Scheme
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="mb-6 p-3 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center shadow-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-teal-400 mr-2" />
            {toastMessage}
          </div>
        )}

        {/* Aggregate Metrics Cards */}
        {analytics?.overview && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold uppercase text-slate-500 mb-1">Total Schemes</div>
              <div className="text-2xl font-extrabold text-slate-900">{analytics.overview.total_schemes}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold uppercase text-teal-700 mb-1">Active Schemes</div>
              <div className="text-2xl font-extrabold text-teal-700">{analytics.overview.active_schemes}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold uppercase text-slate-500 mb-1">Criteria Rules</div>
              <div className="text-2xl font-extrabold text-slate-900">{analytics.overview.total_criteria}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold uppercase text-slate-500 mb-1">Document Types</div>
              <div className="text-2xl font-extrabold text-slate-900">{analytics.overview.total_documents}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[11px] font-semibold uppercase text-slate-500 mb-1">Evaluations Run</div>
              <div className="text-2xl font-extrabold text-slate-900">{analytics.overview.total_assessments}</div>
            </div>
          </div>
        )}

        {/* Database mode notice */}
        {analytics?.database_status && (
          <div className="mb-6 p-3 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span className="font-semibold">Database Engine:</span>
              <span className="font-mono text-slate-900">
                {analytics.database_status.mode} ({analytics.database_status.database})
              </span>
            </div>
            <span className="text-slate-500 text-[11px]">{analytics.database_status.message}</span>
          </div>
        )}

        {/* Schemes Table Controls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs flex-1">
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search schemes by name or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-600">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Total Schemes: <span className="font-bold text-slate-800">{filteredSchemes.length}</span>
          </div>
        </div>

        {/* Schemes Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Scheme Name & Sector</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Coverage</th>
                  <th className="py-3 px-4">Rules / Docs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchemes.map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{scheme.scheme_name}</div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                          {scheme.category}
                        </span>
                        {scheme.is_demonstration ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Demo
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="line-clamp-1">{scheme.department}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {scheme.state_coverage || 'All-India'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setManagingCriteriaScheme(scheme)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                          title="Manage Criteria Rules"
                        >
                          {scheme.criteria_count || 0} Rules
                        </button>
                        <button
                          onClick={() => setManagingDocsScheme(scheme)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition"
                          title="Manage Required Documents"
                        >
                          {scheme.documents_count || 0} Docs
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(scheme.id, scheme.is_active)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          scheme.is_active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${scheme.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {scheme.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => openEditModal(scheme)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                          title="Edit Scheme Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteScheme(scheme.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Delete Scheme"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {editingScheme ? 'Edit Welfare Scheme' : 'Add New Welfare Scheme'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchemeForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheme Name *</label>
                <input
                  type="text"
                  required
                  value={schemeForm.scheme_name}
                  onChange={(e) => setSchemeForm({ ...schemeForm, scheme_name: e.target.value })}
                  placeholder="e.g. National Apprenticeship Promotion Scheme"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={schemeForm.description}
                  onChange={(e) => setSchemeForm({ ...schemeForm, description: e.target.value })}
                  placeholder="Comprehensive description of scheme scope, beneficiary group, and financial incentives."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category / Sector *</label>
                  <select
                    value={schemeForm.category}
                    onChange={(e) => setSchemeForm({ ...schemeForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department / Ministry *</label>
                  <input
                    type="text"
                    required
                    value={schemeForm.department}
                    onChange={(e) => setSchemeForm({ ...schemeForm, department: e.target.value })}
                    placeholder="e.g. Ministry of Skill Development"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State Coverage</label>
                  <input
                    type="text"
                    value={schemeForm.state_coverage}
                    onChange={(e) => setSchemeForm({ ...schemeForm, state_coverage: e.target.value })}
                    placeholder="All-India (or State Name)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Verification URL</label>
                  <input
                    type="url"
                    value={schemeForm.official_url}
                    onChange={(e) => setSchemeForm({ ...schemeForm, official_url: e.target.value })}
                    placeholder="https://official-dept-portal.gov.in"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Annual Income Ceiling (₹)</label>
                  <input
                    type="number"
                    value={schemeForm.max_income}
                    onChange={(e) => setSchemeForm({ ...schemeForm, max_income: e.target.value })}
                    placeholder="e.g. 250000 (Optional)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Verified Date</label>
                  <input
                    type="date"
                    value={schemeForm.last_verified_date}
                    onChange={(e) => setSchemeForm({ ...schemeForm, last_verified_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={schemeForm.is_active}
                    onChange={(e) => setSchemeForm({ ...schemeForm, is_active: e.target.checked })}
                    className="rounded border-slate-300 text-teal-600"
                  />
                  <span>Active Scheme</span>
                </label>

                <label className="flex items-center space-x-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={schemeForm.is_demonstration}
                    onChange={(e) => setSchemeForm({ ...schemeForm, is_demonstration: e.target.checked })}
                    className="rounded border-slate-300 text-teal-600"
                  />
                  <span>Mark as Demonstration Record</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700"
                >
                  {editingScheme ? 'Save Changes' : 'Create Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Criteria Rules Management Modal */}
      {managingCriteriaScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Manage Eligibility Criteria
                </h2>
                <p className="text-xs text-slate-500">
                  Scheme: {managingCriteriaScheme.scheme_name}
                </p>
              </div>
              <button
                onClick={() => setManagingCriteriaScheme(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Criterion Form */}
            <form onSubmit={handleAddCriteria} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3 text-xs">
              <h3 className="font-bold text-slate-800 uppercase text-[11px]">
                Add Criteria Condition Rule
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Profile Field</label>
                  <select
                    value={newCriteria.profile_field}
                    onChange={(e) => setNewCriteria({ ...newCriteria, profile_field: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="annual_income">annual_income</option>
                    <option value="age">age</option>
                    <option value="occupation">occupation</option>
                    <option value="state">state</option>
                    <option value="area_type">area_type</option>
                    <option value="housing_status">housing_status</option>
                    <option value="family_size">family_size</option>
                    <option value="is_disabled">is_disabled</option>
                    <option value="disability_percentage">disability_percentage</option>
                    <option value="is_student">is_student</option>
                    <option value="employment_status">employment_status</option>
                    <option value="education_level">education_level</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Operator</label>
                  <select
                    value={newCriteria.operator}
                    onChange={(e) => setNewCriteria({ ...newCriteria, operator: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  >
                    <option value="<=">&lt;= (Less than or equal)</option>
                    <option value=">=">&gt;= (Greater than or equal)</option>
                    <option value="==">== (Exact match)</option>
                    <option value="in">in (In Category List)</option>
                    <option value="between">between [min, max]</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-0.5">Target Value</label>
                  <input
                    type="text"
                    required
                    value={newCriteria.target_value}
                    onChange={(e) => setNewCriteria({ ...newCriteria, target_value: e.target.value })}
                    placeholder="e.g. 250000 or rural"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Rule Description</label>
                <input
                  type="text"
                  required
                  value={newCriteria.description}
                  onChange={(e) => setNewCriteria({ ...newCriteria, description: e.target.value })}
                  placeholder="e.g. Annual household income must not exceed ₹2,50,000"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-1.5 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newCriteria.is_mandatory}
                    onChange={(e) => setNewCriteria({ ...newCriteria, is_mandatory: e.target.checked })}
                    className="rounded border-slate-300 text-teal-600"
                  />
                  <span>Mandatory Condition (Must Pass)</span>
                </label>

                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-slate-700">Weight:</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={newCriteria.weight}
                    onChange={(e) => setNewCriteria({ ...newCriteria, weight: e.target.value })}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="ml-auto px-4 py-1.5 bg-slate-900 text-teal-300 rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Add Rule
                </button>
              </div>
            </form>

            <div className="text-right">
              <button
                onClick={() => setManagingCriteriaScheme(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Checklist Management Modal */}
      {managingDocsScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Manage Required Documents
                </h2>
                <p className="text-xs text-slate-500">
                  Scheme: {managingDocsScheme.scheme_name}
                </p>
              </div>
              <button
                onClick={() => setManagingDocsScheme(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Document Title *</label>
                <input
                  type="text"
                  required
                  value={newDoc.document_name}
                  onChange={(e) => setNewDoc({ ...newDoc, document_name: e.target.value })}
                  placeholder="e.g. Income Certificate or BPL Ration Card"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Issuing Authority</label>
                <input
                  type="text"
                  value={newDoc.issuing_authority}
                  onChange={(e) => setNewDoc({ ...newDoc, issuing_authority: e.target.value })}
                  placeholder="e.g. Revenue Department / Tehsildar"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Instructions</label>
                <input
                  type="text"
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                  placeholder="e.g. Certificate issued within preceding 12 months"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-1.5 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newDoc.is_mandatory}
                    onChange={(e) => setNewDoc({ ...newDoc, is_mandatory: e.target.checked })}
                    className="rounded border-slate-300 text-teal-600"
                  />
                  <span>Mandatory Document</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-teal-300 rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Add Document
                </button>
              </div>
            </form>

            <div className="text-right">
              <button
                onClick={() => setManagingDocsScheme(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
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

export default AdminDashboardPage;
