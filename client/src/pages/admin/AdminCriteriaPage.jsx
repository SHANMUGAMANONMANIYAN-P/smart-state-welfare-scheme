import React, { useEffect, useState } from 'react';
import { adminAPI, schemesAPI } from '../../services/api';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function AdminCriteriaPage() {
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [currentSchemeDetail, setCurrentSchemeDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [newCriteria, setNewCriteria] = useState({
    criterion_type: 'income',
    profile_field: 'annual_income',
    operator: '<=',
    target_value: '250000',
    is_mandatory: true,
    weight: '2.0',
    description: 'Annual family income must be within ceiling',
    failure_reason: 'Annual family income exceeds maximum allowed ceiling',
  });

  const loadSchemes = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllSchemes();
      const list = res.data?.data || [];
      setSchemes(list);
      if (list.length > 0) {
        setSelectedSchemeId(String(list[0].id));
      }
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemeDetail = async (id) => {
    if (!id) return;
    try {
      const res = await schemesAPI.getById(id);
      setCurrentSchemeDetail(res.data?.data);
    } catch (err) {
      console.error('Failed to load scheme criteria:', err);
    }
  };

  useEffect(() => {
    if (selectedSchemeId) {
      loadSchemeDetail(selectedSchemeId);
    }
  }, [selectedSchemeId]);

  const handleAddCriteria = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addCriteria(selectedSchemeId, {
        ...newCriteria,
        weight: parseFloat(newCriteria.weight) || 1.0,
      });
      setShowAddModal(false);
      loadSchemeDetail(selectedSchemeId);
      setToastMessage('Criteria rule added successfully.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add criteria.');
    }
  };

  const handleDeleteCriteria = async (criteriaId) => {
    try {
      await adminAPI.deleteCriteria(criteriaId);
      loadSchemeDetail(selectedSchemeId);
      setToastMessage('Criteria rule deleted.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete criteria:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Loading Criteria Rules...</div>
      </div>
    );
  }

  const criteriaList = currentSchemeDetail?.criteria || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5 mr-1.5" />
            Decision Engine Rule Sets
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            Eligibility Criteria Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure weighted conditions and mandatory filters for scheme matching.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          disabled={!selectedSchemeId}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white font-bold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Criteria Rule
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center shadow-md animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Scheme Selector */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-700">
          Select Scheme to View & Edit Rules:
        </label>
        <select
          value={selectedSchemeId}
          onChange={(e) => setSelectedSchemeId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-brand-navy focus:border-brand-purple outline-hidden bg-white max-w-md w-full"
        >
          {schemes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.scheme_name}
            </option>
          ))}
        </select>
      </div>

      {/* Criteria Rules List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-brand-navy">
            Active Rules for: <span className="text-brand-purple">{currentSchemeDetail?.scheme_name || 'Selected Scheme'}</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {criteriaList.length} Rules Configured
          </span>
        </div>

        {criteriaList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No specific criteria rules configured for this scheme yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {criteriaList.map((crit) => (
              <div
                key={crit.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {crit.profile_field} {crit.operator} {crit.target_value}
                    </span>

                    {crit.is_mandatory ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Mandatory Gate
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        Weight: {crit.weight || '1.0'}x
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-xs text-slate-800">
                    {crit.description}
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Failure reason: <span className="text-rose-600 font-medium">{crit.failure_reason}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteCriteria(crit.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                  title="Delete criteria rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Criteria Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-brand-navy">Add Criteria Rule</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCriteria} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Profile Field</label>
                  <select
                    value={newCriteria.profile_field}
                    onChange={(e) => setNewCriteria({ ...newCriteria, profile_field: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden bg-white"
                  >
                    <option value="annual_income">annual_income</option>
                    <option value="age">age</option>
                    <option value="occupation">occupation</option>
                    <option value="state">state</option>
                    <option value="is_student">is_student</option>
                    <option value="is_disabled">is_disabled</option>
                    <option value="housing_status">housing_status</option>
                    <option value="area_type">area_type</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Comparison Operator</label>
                  <select
                    value={newCriteria.operator}
                    onChange={(e) => setNewCriteria({ ...newCriteria, operator: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden bg-white"
                  >
                    <option value="<=">&le; Less than or equal</option>
                    <option value=">=">&ge; Greater than or equal</option>
                    <option value="==">== Equals exact value</option>
                    <option value="in">in Array of allowed values</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Threshold / Value</label>
                <input
                  type="text"
                  required
                  value={newCriteria.target_value}
                  onChange={(e) => setNewCriteria({ ...newCriteria, target_value: e.target.value })}
                  placeholder="e.g. 250000 or [&quot;Farmer&quot;]"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Criterion Weight (Multiplier)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={newCriteria.weight}
                    onChange={(e) => setNewCriteria({ ...newCriteria, weight: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-hidden"
                  />
                </div>

                <label className="flex items-center space-x-2 pt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCriteria.is_mandatory}
                    onChange={(e) => setNewCriteria({ ...newCriteria, is_mandatory: e.target.checked })}
                    className="w-4 h-4 text-brand-purple rounded"
                  />
                  <span className="font-bold text-slate-800">Mandatory Gate</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Human-Readable Rule Description</label>
                <input
                  type="text"
                  required
                  value={newCriteria.description}
                  onChange={(e) => setNewCriteria({ ...newCriteria, description: e.target.value })}
                  placeholder="e.g. Household annual income must not exceed Rs 2,50,000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation Upon Failure</label>
                <input
                  type="text"
                  required
                  value={newCriteria.failure_reason}
                  onChange={(e) => setNewCriteria({ ...newCriteria, failure_reason: e.target.value })}
                  placeholder="e.g. Income exceeds specified cutoff"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
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
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
