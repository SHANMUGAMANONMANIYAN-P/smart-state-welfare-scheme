import React, { useState, useEffect, useRef } from 'react';
import { importAPI, schemesAPI } from '../../services/api';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  ExternalLink,
  ShieldCheck,
  Eye,
  ArrowRight,
  Database,
  History,
  AlertCircle,
  FileCheck,
  Layers,
  MapPin,
  Clock,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function AdminImportPage() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'preview' | 'logs' | 'verification'
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Upload & Preview state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Settings for execution
  const [updateDuplicates, setUpdateDuplicates] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('pending_verification');

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Verification Queue state
  const [pendingSchemes, setPendingSchemes] = useState([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);

  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };

  // Load import logs
  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await importAPI.getLogs();
      setLogs(res.data?.logs || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch import logs', 'error');
    } finally {
      setLogsLoading(false);
    }
  };

  // Load verification queue (schemes pending verification or outdated)
  const fetchPendingSchemes = async () => {
    try {
      setQueueLoading(true);
      const res = await schemesAPI.getAll({ limit: 100 });
      const all = res.data?.schemes || [];
      const filtered = all.filter(
        (s) => s.verification_status === 'pending_verification' || s.verification_status === 'outdated'
      );
      setPendingSchemes(filtered);
    } catch (err) {
      showToast('Failed to fetch verification queue', 'error');
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    } else if (activeTab === 'verification') {
      fetchPendingSchemes();
    }
  }, [activeTab]);

  // Handle predefined dataset load
  const handleLoadPredefined = async (datasetKey) => {
    try {
      setDatasetLoading(true);
      const res = await importAPI.loadPredefined(datasetKey);
      setPreviewData(res.data);
      setImportResult(null);
      setActiveTab('preview');
      showToast(`Loaded ${res.data.summary?.total_parsed || 0} schemes from ${datasetKey === 'central' ? 'Central' : 'Tamil Nadu'} dataset!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load predefined dataset', 'error');
    } finally {
      setDatasetLoading(false);
    }
  };

  // Handle custom file upload
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadPreview = async () => {
    if (!selectedFile) {
      showToast('Please select a CSV or JSON file to upload', 'error');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await importAPI.previewUpload(formData);
      setPreviewData(res.data);
      setImportResult(null);
      setActiveTab('preview');
      showToast(`Parsed ${res.data.summary?.total_parsed || 0} schemes from file!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to parse uploaded file', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Confirm and execute the import
  const handleConfirmImport = async () => {
    if (!previewData || !previewData.valid_records || previewData.valid_records.length === 0) {
      showToast('No valid records to import', 'error');
      return;
    }

    try {
      setConfirmLoading(true);
      const payload = {
        records: previewData.valid_records,
        source_type: previewData.datasetKey || (selectedFile ? selectedFile.name.endsWith('.csv') ? 'csv' : 'json' : 'manual'),
        update_duplicates: updateDuplicates,
        default_status: verificationStatus,
      };

      const res = await importAPI.confirmImport(payload);
      setImportResult(res.data.result);
      showToast('Import executed successfully with complete transactional safety!');
      // Reload logs and queue
      fetchLogs();
      fetchPendingSchemes();
    } catch (err) {
      showToast(err.response?.data?.message || 'Import transaction failed and rolled back', 'error');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Action on verification queue
  const handleVerifyScheme = async (schemeId, status) => {
    try {
      setActionInProgress(schemeId);
      await importAPI.verifyScheme(schemeId, status);
      showToast(`Scheme status updated to ${status}`);
      fetchPendingSchemes();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update scheme status', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-in slide-in-from-top-4 ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <XCircle className="w-5 h-5 mr-2 shrink-0 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 mr-2 shrink-0 text-emerald-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-purple uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            <span>Government Data Pipeline</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-brand-navy tracking-tight">
            Welfare Scheme Data Import & Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl font-medium">
            Ingest, audit, detect duplicates, and maintain verified welfare scheme records from permitted official government sources (Central & State Governments) with transactional rollback guarantees.
          </p>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'upload'
                ? 'bg-white text-brand-purple shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Source & Upload
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            disabled={!previewData}
            className={`px-3.5 py-2 rounded-xl transition flex items-center ${
              activeTab === 'preview'
                ? 'bg-white text-brand-purple shadow-xs font-bold'
                : previewData
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <span>2. Validation & Diffs</span>
            {previewData && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-brand-lavender text-brand-purple">
                {previewData.summary?.valid_count || 0}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center ${
              activeTab === 'verification'
                ? 'bg-white text-brand-purple shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>3. Verification Queue</span>
            {pendingSchemes.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                {pendingSchemes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl transition ${
              activeTab === 'logs'
                ? 'bg-white text-brand-purple shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Import Audit History
          </button>
        </div>
      </div>

      {/* TAB 1: SOURCE & UPLOAD */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Official Datasets 1-Click Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-brand-navy flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />
                Verified Official Government Scheme Repositories (Permitted Sources)
              </h2>
              <span className="text-xs text-slate-400">Strictly no unauthorized web scraping</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Central Government Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-brand-purple/40 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-lavender text-brand-purple border border-brand-lavenderDark">
                      Union Government of India
                    </span>
                    <h3 className="text-lg font-bold text-brand-navy mt-2.5">
                      Central Welfare Schemes (data.gov.in)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      Verified open dataset covering PM-KISAN, Ayushman Bharat PM-JAY, PMAY-G, PM Ujjwala Yojana, and IGNOAPS Old Age Pension with structured criteria & document rules.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-lavender flex items-center justify-center text-brand-purple shrink-0">
                    <Database className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    Source: <strong className="text-slate-600">data.gov.in & Ministry Portals</strong>
                  </div>
                  <button
                    onClick={() => handleLoadPredefined('central')}
                    disabled={datasetLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-purple hover:bg-brand-purpleDark text-white flex items-center transition shadow-xs disabled:opacity-50"
                  >
                    {datasetLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Load Central Schemes (5 Verified)
                  </button>
                </div>
              </div>

              {/* Tamil Nadu State Government Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-brand-purple/40 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Government of Tamil Nadu
                    </span>
                    <h3 className="text-lg font-bold text-brand-navy mt-2.5">
                      Tamil Nadu State Welfare Schemes (tn.gov.in)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      Verified state dataset covering Kalaignar Magalir Urimai Thittam (KMUT), Pudhumai Penn, CMCHIS Health Insurance, Dr. Muthulakshmi Reddy Maternity, and Uzhavar Pathukappu.
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    Source: <strong className="text-slate-600">tn.gov.in & kmut.tn.gov.in</strong>
                  </div>
                  <button
                    onClick={() => handleLoadPredefined('tamilnadu')}
                    disabled={datasetLoading}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center transition shadow-xs disabled:opacity-50"
                  >
                    {datasetLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Load Tamil Nadu Schemes (5 Verified)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Custom File Upload Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-brand-navy flex items-center">
                  <UploadCloud className="w-5 h-5 mr-2 text-brand-purple" />
                  Custom File Import (CSV or JSON)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload an officially compiled CSV or JSON file structured according to the SmartWelfare specification.
                </p>
              </div>

              {/* Template Download Links */}
              <div className="flex items-center space-x-2">
                <a
                  href={importAPI.getTemplateDownloadUrl('csv')}
                  download="scheme_import_template.csv"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center transition"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  CSV Template
                </a>
                <a
                  href={importAPI.getTemplateDownloadUrl('json')}
                  download="scheme_import_template.json"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center transition"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  JSON Template
                </a>
              </div>
            </div>

            {/* Drag & Drop Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-brand-purple bg-brand-lavender/20'
                  : 'border-slate-300 hover:border-brand-purple/60 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-lavender flex items-center justify-center text-brand-purple mb-3 shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-brand-navy">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop your file here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: Standard UTF-8 CSV or JSON (up to 10MB)
              </p>
              {selectedFile && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-purple text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  File Selected ({Math.round(selectedFile.size / 1024)} KB)
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUploadPreview}
                disabled={!selectedFile || loading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-brand-purple hover:bg-brand-purpleDark text-white flex items-center transition shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                Parse & Preview File Records
              </button>
            </div>
          </div>

          {/* Legal and Ethical Compliance Notice */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 text-amber-950">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-900">
                  Government Dataset Licensing & Ethical Data Pipeline Guidelines
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  • <strong>No Automated Scraping:</strong> In strict compliance with official terms, SmartWelfare does not scrape government web pages automatically. All imports utilize officially published datasets, ministry open data portals, or administrator-curated records with verified citations.<br />
                  • <strong>Audit Trail:</strong> Every imported scheme is stamped with its source identifier, source reference URL, import timestamp, and initial <em>Pending Verification</em> state.<br />
                  • <strong>Transactional Rollback:</strong> If any single scheme row violates database integrity or schema constraints, the entire batch transaction is safely rolled back.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VALIDATION & DIFF PREVIEW */}
      {activeTab === 'preview' && previewData && (
        <div className="space-y-6">
          {/* Summary Chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Rows</p>
              <p className="text-2xl font-black text-brand-navy mt-1">
                {previewData.summary?.total_parsed || 0}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Parsed from source</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Valid Schemes</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                {previewData.summary?.valid_count || 0}
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Ready for import</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-brand-purple/30 shadow-xs">
              <p className="text-xs font-semibold text-brand-purple uppercase tracking-wider">Duplicates Detected</p>
              <p className="text-2xl font-black text-brand-purple mt-1">
                {previewData.summary?.duplicate_count || 0}
              </p>
              <p className="text-[11px] text-brand-purple mt-0.5">Matched existing schemes</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs">
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Rejected Rows</p>
              <p className="text-2xl font-black text-rose-700 mt-1">
                {previewData.summary?.rejected_count || 0}
              </p>
              <p className="text-[11px] text-rose-500 mt-0.5">Failed validation checks</p>
            </div>
          </div>

          {/* Success Banner if Import was just Executed */}
          {importResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-emerald-950 animate-in fade-in">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-emerald-900">
                    Import Batch Committed Successfully! (Batch ID: #{importResult.batch_id})
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Processed: <strong>{importResult.records_processed}</strong> | Newly Inserted: <strong>{importResult.records_imported}</strong> | Updated: <strong>{importResult.records_updated}</strong> | Skipped: <strong>{importResult.records_skipped}</strong> | Status: <span className="uppercase font-bold text-emerald-900">{importResult.status}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Duplicates and Diffs Viewer */}
          {previewData.duplicates && previewData.duplicates.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-brand-purple/30 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-brand-navy flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-brand-purple" />
                    Duplicate Schemes & Detected Field Diffs ({previewData.duplicates.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    These schemes match existing records in the database. Review the changes below to prevent silent overwrites.
                  </p>
                </div>

                {/* Update Duplicates Switch */}
                <label className="flex items-center space-x-2.5 text-xs font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateDuplicates}
                    onChange={(e) => setUpdateDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-purple focus:ring-brand-purple"
                  />
                  <span>Update existing records with incoming differences</span>
                </label>
              </div>

              <div className="space-y-3">
                {previewData.duplicates.map((dup, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-brand-navy">{dup.scheme_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-lavender text-brand-purple">
                          Matched via {dup.match_type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Existing Scheme ID: #{dup.existing_id}
                      </span>
                    </div>

                    {/* Diffs List */}
                    {dup.diffs && dup.diffs.length > 0 ? (
                      <div className="space-y-1.5 mt-2">
                        {dup.diffs.map((d, dIdx) => (
                          <div key={dIdx} className="text-xs flex flex-wrap items-center gap-2 p-2 rounded-lg bg-white border border-slate-200">
                            <span className="font-bold text-slate-700 w-36 uppercase text-[10px]">
                              {d.field}:
                            </span>
                            <div className="flex items-center space-x-2 flex-1">
                              <span className="px-2 py-0.5 rounded text-[11px] bg-rose-50 text-rose-700 border border-rose-100 font-mono">
                                Old: {String(d.oldVal || 'None')}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono">
                                New: {String(d.newVal || 'None')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic mt-1">
                        Exact duplicate detected with zero field differences.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Rows (if any) */}
          {previewData.rejected && previewData.rejected.length > 0 && (
            <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-6 text-rose-950 space-y-3">
              <h3 className="text-sm font-bold text-rose-900 flex items-center">
                <XCircle className="w-4 h-4 mr-2 text-rose-600" />
                Validation Errors & Rejected Rows ({previewData.rejected.length})
              </h3>
              <div className="space-y-2">
                {previewData.rejected.map((rej, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-rose-200 text-xs flex items-start justify-between">
                    <div>
                      <span className="font-bold text-rose-900">
                        Row #{rej.row_number || i + 1}: {rej.record?.scheme_name || 'Unnamed Scheme'}
                      </span>
                      <ul className="list-disc list-inside mt-1 text-[11px] text-rose-700 space-y-0.5">
                        {rej.errors?.map((err, errIdx) => (
                          <li key={errIdx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Schemes Preview Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-brand-navy flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
                  Validated Scheme Records ({previewData.valid_records?.length || 0})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parsed rules, structured eligibility gates, and required documents ready for transactional write.
                </p>
              </div>

              {/* Status Selector & Execution Trigger */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
                  <span>Initial Status:</span>
                  <select
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value)}
                    className="p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  >
                    <option value="pending_verification">Pending Verification (Recommended)</option>
                    <option value="verified">Verified Government Scheme</option>
                  </select>
                </div>

                <button
                  onClick={handleConfirmImport}
                  disabled={confirmLoading || !previewData.valid_records?.length}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-purple hover:bg-brand-purpleDark text-white flex items-center transition shadow-xs disabled:opacity-50"
                >
                  {confirmLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Execute Import ({previewData.valid_records?.length || 0} Schemes)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Scheme & Department</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Coverage</th>
                    <th className="py-3.5 px-4">Criteria Rules</th>
                    <th className="py-3.5 px-4">Required Documents</th>
                    <th className="py-3.5 px-4">Official Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {previewData.valid_records?.map((record, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-navy">{record.scheme_name}</div>
                        <div className="text-[11px] text-slate-400">{record.department}</div>
                        {record.benefits_summary && (
                          <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                            Benefits: {record.benefits_summary}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-lavender text-brand-purple">
                          {record.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-600 font-medium">
                          {record.state_coverage || 'All-India'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-800">
                          {record.criteria?.length || 0} Rules
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-800">
                          {record.documents?.length || 0} Docs
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {record.source_url ? (
                          <a
                            href={record.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-purple hover:underline inline-flex items-center text-[11px] font-semibold"
                          >
                            <span>{record.source_ref || 'Source'}</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-1" />
                          </a>
                        ) : (
                          <span className="text-slate-400">{record.source_ref || 'N/A'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFICATION QUEUE */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" />
                <span>Auditing Workflow</span>
              </div>
              <h2 className="text-lg font-bold text-brand-navy">
                Scheme Verification & Status Governance Queue ({pendingSchemes.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Schemes flagged as <em>Pending Verification</em> or <em>Outdated</em> are isolated here. Verify official citations, confirm criteria accuracy, and publish to citizens.
              </p>
            </div>

            <button
              onClick={fetchPendingSchemes}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {queueLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-purple" />
              Loading pending verification queue...
            </div>
          ) : pendingSchemes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="font-bold text-slate-700 text-sm">All Schemes Fully Verified!</p>
              <p className="mt-1">There are no schemes in the pending or outdated queue right now.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Scheme</th>
                    <th className="py-3 px-4">Department & Coverage</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4">Source Reference</th>
                    <th className="py-3 px-4 text-right">Verification Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pendingSchemes.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-brand-navy">{s.scheme_name}</div>
                        <div className="text-[11px] text-slate-400">{s.category}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{s.department}</div>
                        <div className="text-[11px] text-slate-500">{s.state_coverage || 'All-India'}</div>
                      </td>
                      <td className="py-3 px-4">
                        {s.verification_status === 'pending_verification' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Pending Audit
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            Outdated / Review
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {s.source_url ? (
                          <a
                            href={s.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-purple hover:underline inline-flex items-center text-[11px] font-semibold"
                          >
                            <span>Open Source</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-1" />
                          </a>
                        ) : (
                          <span className="text-slate-400">{s.source_ref || 'Official Portal'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleVerifyScheme(s.id, 'verified')}
                            disabled={actionInProgress === s.id}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center transition shadow-xs disabled:opacity-50"
                          >
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Approve & Verify
                          </button>
                          <button
                            onClick={() => handleVerifyScheme(s.id, 'outdated')}
                            disabled={actionInProgress === s.id}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            Flag Outdated
                          </button>
                          <button
                            onClick={() => handleVerifyScheme(s.id, 'rejected')}
                            disabled={actionInProgress === s.id}
                            className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: IMPORT AUDIT HISTORY */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-purple uppercase tracking-wider mb-1">
                <History className="w-4 h-4" />
                <span>Audit Trail</span>
              </div>
              <h2 className="text-lg font-bold text-brand-navy">Government Scheme Import Audit Logs</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete record of batch imports, execution timestamps, records processed, and transactional statuses.
              </p>
            </div>

            <button
              onClick={fetchLogs}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              title="Refresh Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {logsLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-purple" />
              Loading import history logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Database className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">No Import Logs Recorded Yet</p>
              <p className="mt-1">Import batches will appear here with complete audit metrics.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Batch ID</th>
                    <th className="py-3 px-4">Source Type</th>
                    <th className="py-3 px-4">Processed</th>
                    <th className="py-3 px-4">Imported</th>
                    <th className="py-3 px-4">Updated</th>
                    <th className="py-3 px-4">Skipped</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Execution Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-brand-navy">#{log.id}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">
                          {log.source_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{log.records_processed}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{log.records_imported}</td>
                      <td className="py-3 px-4 font-bold text-brand-purple">{log.records_updated}</td>
                      <td className="py-3 px-4 text-slate-400">{log.records_skipped}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            log.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(log.created_at).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
