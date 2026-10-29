import React, { useEffect, useState } from 'react';
import { adminAPI, schemesAPI } from '../../services/api';
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Building,
} from 'lucide-react';

export default function AdminDocumentsPage() {
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [currentSchemeDetail, setCurrentSchemeDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [newDoc, setNewDoc] = useState({
    document_name: '',
    description: '',
    is_mandatory: true,
    issuing_authority: '',
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
      console.error('Failed to load scheme documents:', err);
    }
  };

  useEffect(() => {
    if (selectedSchemeId) {
      loadSchemeDetail(selectedSchemeId);
    }
  }, [selectedSchemeId]);

  const handleAddDocument = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addDocument(selectedSchemeId, newDoc);
      setShowAddModal(false);
      setNewDoc({
        document_name: '',
        description: '',
        is_mandatory: true,
        issuing_authority: '',
      });
      loadSchemeDetail(selectedSchemeId);
      setToastMessage('Document requirement added.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add document.');
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await adminAPI.deleteDocument(docId);
      loadSchemeDetail(selectedSchemeId);
      setToastMessage('Document requirement deleted.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand-purple animate-spin mb-3" />
        <div className="text-xs font-bold text-slate-700">Loading Document Requirements...</div>
      </div>
    );
  }

  const docList = currentSchemeDetail?.documents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Verification Checklists
          </div>
          <h2 className="text-2xl font-black text-brand-navy tracking-tight">
            Required Documents Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure certificate checklists and issuing authorities for each government program.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          disabled={!selectedSchemeId}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white font-bold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Document Requirement
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
          Select Welfare Scheme:
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

      {/* Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-brand-navy">
            Document Checklist for: <span className="text-brand-purple">{currentSchemeDetail?.scheme_name || 'Selected Scheme'}</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {docList.length} Documents Required
          </span>
        </div>

        {docList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No document requirements configured for this scheme yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {docList.map((doc) => (
              <div
                key={doc.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-brand-navy">
                      {doc.document_name}
                    </span>
                    {doc.is_mandatory ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Mandatory Proof
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Optional / Supplementary
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {doc.description || 'Verification of eligibility parameters.'}
                  </p>

                  <div className="text-[11px] text-slate-500 flex items-center">
                    <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Issuing Authority: <span className="font-semibold text-slate-700 ml-1">{doc.issuing_authority || 'Designated Government Agency'}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                  title="Delete document requirement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-brand-navy">Add Document Requirement</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newDoc.document_name}
                  onChange={(e) => setNewDoc({ ...newDoc, document_name: e.target.value })}
                  placeholder="e.g. Income Certificate or BPL Ration Card"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Purpose</label>
                <textarea
                  rows={2}
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                  placeholder="e.g. Revenue verification of household income under threshold"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Competent Issuing Authority</label>
                <input
                  type="text"
                  value={newDoc.issuing_authority}
                  onChange={(e) => setNewDoc({ ...newDoc, issuing_authority: e.target.value })}
                  placeholder="e.g. Tehsildar / Block Development Officer"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newDoc.is_mandatory}
                  onChange={(e) => setNewDoc({ ...newDoc, is_mandatory: e.target.checked })}
                  className="w-4 h-4 text-brand-purple rounded"
                />
                <span className="font-bold text-slate-800">Mandatory for Scheme Submission</span>
              </label>

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
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
