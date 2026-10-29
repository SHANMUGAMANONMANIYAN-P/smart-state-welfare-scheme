import React from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Building2,
  MapPin,
  Calendar,
  ShieldCheck,
  Bookmark,
  AlertCircle,
} from 'lucide-react';
import ScoreGauge from './ScoreGauge';

export function SchemeDetailModal({ scheme, isOpen, onClose, onSave, isSaved }) {
  if (!isOpen || !scheme) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-lavender text-brand-purple border border-brand-lavenderDark/80">
                {scheme.category}
              </span>
              <span className="inline-flex items-center text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                {scheme.state_coverage || 'All-India'}
              </span>
              {scheme.verification_status === 'verified' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                  Official Verified Scheme
                </span>
              )}
              {scheme.verification_status === 'pending_verification' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
                  Pending Verification
                </span>
              )}
              {scheme.verification_status === 'outdated' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertCircle className="w-3 h-3 mr-1 text-rose-600" />
                  Outdated / Review Needed
                </span>
              )}
              {scheme.is_demonstration && !scheme.verification_status ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Demonstration Record
                </span>
              ) : null}
            </div>
            <h2 className="text-xl font-black text-brand-navy">{scheme.scheme_name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
              <span className="flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {scheme.department}
              </span>
              {(scheme.last_verified_at || scheme.last_verified_date) && (
                <span className="flex items-center text-slate-500">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Last Verified: {new Date(scheme.last_verified_at || scheme.last_verified_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {scheme.matching_score !== undefined && (
              <ScoreGauge
                score={scheme.matching_score}
                category={scheme.result_category}
                mandatorySatisfied={scheme.mandatory_satisfied}
              />
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Description & Benefits */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Program Description & Summary
            </h3>
            <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {scheme.description}
            </p>
          </div>

          {/* Key Benefits Summary if available */}
          {scheme.benefits_summary && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-emerald-950">
              <span className="font-bold flex items-center mb-1 text-emerald-800 text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                Verified Benefits & Financial Assistance:
              </span>
              <p className="text-slate-800 leading-relaxed font-medium text-xs">
                {scheme.benefits_summary}
              </p>
            </div>
          )}

          {/* Explanation if evaluated */}
          {scheme.explanation && (
            <div className="bg-brand-lavender/30 border border-brand-purple/20 rounded-2xl p-4 text-brand-navy leading-relaxed">
              <span className="font-bold flex items-center mb-1 text-brand-purple">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Explainable Recommendation Rationale:
              </span>
              <p className="text-slate-700">{scheme.explanation}</p>
            </div>
          )}

          {/* Satisfied Criteria */}
          {scheme.criteria_satisfied && scheme.criteria_satisfied.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                Satisfied Eligibility Conditions ({scheme.criteria_satisfied.length})
              </h3>
              <ul className="space-y-1.5 text-xs">
                {scheme.criteria_satisfied.map((c, i) => (
                  <li key={i} className="flex items-start space-x-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">{c.description || c}</span>
                      {c.is_mandatory && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                          Mandatory Gate Met
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unmet Criteria */}
          {scheme.criteria_unmet && scheme.criteria_unmet.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center">
                <XCircle className="w-4 h-4 mr-1.5 text-rose-600" />
                Unmet Criteria Conditions ({scheme.criteria_unmet.length})
              </h3>
              <ul className="space-y-1.5 text-xs">
                {scheme.criteria_unmet.map((c, i) => (
                  <li key={i} className="flex items-start space-x-2 p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">{c.description}</span>
                      {c.is_mandatory && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">
                          Mandatory Condition Failed
                        </span>
                      )}
                      <p className="text-[11px] text-rose-700 font-medium mt-0.5">
                        Failure Reason: {c.failure_reason}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing Profile Information */}
          {scheme.missing_profile_information && scheme.missing_profile_information.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
              <span className="font-bold flex items-center mb-1 text-amber-950">
                <HelpCircle className="w-4 h-4 mr-1.5 text-amber-600" />
                Information Required for Definitive Evaluation:
              </span>
              <p className="mb-2 text-slate-600">
                The following parameter is required to conclude qualification:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {scheme.missing_profile_information.map((field, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-200 text-amber-950 rounded-lg font-semibold text-[11px]">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Required Documents Checklist */}
          {scheme.required_documents && scheme.required_documents.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-brand-purple" />
                Required Verification Documents Checklist ({scheme.required_documents.length})
              </h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Document Title</th>
                      <th className="py-2.5 px-3 font-semibold">Requirement</th>
                      <th className="py-2.5 px-3 font-semibold">Issuing Authority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {scheme.required_documents.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {doc.document_name}
                          {doc.description && (
                            <p className="text-[11px] text-slate-500 font-normal mt-0.5">{doc.description}</p>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {doc.is_mandatory ? (
                            <span className="px-2 py-0.5 bg-brand-navy text-white rounded text-[10px] font-bold">
                              Mandatory
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                              Optional
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {doc.issuing_authority || 'Competent Authority'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mandatory Official Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <strong>Official Guidance Notice:</strong> These results are preliminary guidance based on the information provided and the configured scheme criteria. Final eligibility and benefit approval depend on verification by the relevant government department.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center">
            <span>Official Source:</span>
            {scheme.source_url ? (
              <a
                href={scheme.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-brand-purple hover:underline font-semibold inline-flex items-center"
              >
                {scheme.source_ref || 'Official Dataset / Portal'}
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            ) : (
              <span className="ml-1 font-medium text-slate-600">
                {scheme.source_ref || 'National Welfare Portal'}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {onSave && (
              <button
                onClick={() => onSave(scheme.id || scheme.scheme_id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center transition border ${
                  isSaved
                    ? 'bg-brand-lavender text-brand-purple border-brand-purple/40'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                {isSaved ? 'Bookmarked' : 'Save Scheme'}
              </button>
            )}

            {scheme.official_url && (
              <a
                href={scheme.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-purple hover:bg-brand-purpleDark text-white flex items-center transition shadow-xs"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchemeDetailModal;
