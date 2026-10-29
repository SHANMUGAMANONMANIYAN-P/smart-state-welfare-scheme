import React, { useState } from 'react';
import {
  ExternalLink,
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Building2,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import SchemeDetailModal from './SchemeDetailModal';

export function SchemeCard({ scheme, onSave, isSaved = false }) {
  const [modalOpen, setModalOpen] = useState(false);

  const schemeId = scheme.id || scheme.scheme_id;
  const isEvaluated = scheme.matching_score !== undefined && scheme.matching_score !== null;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-brand-purple/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
        {/* Card Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Category & State Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-lavender text-brand-purple border border-brand-lavenderDark/60">
                  {scheme.category}
                </span>
                <span className="inline-flex items-center text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                  {scheme.state_coverage || 'All-India'}
                </span>
                {scheme.is_demonstration ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Demonstration Data
                  </span>
                ) : scheme.verification_status === 'pending_verification' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-50 text-yellow-800 border border-yellow-200">
                    Pending Verification
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
                    Verified Gov Scheme
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-base font-extrabold text-brand-navy group-hover:text-brand-purple transition line-clamp-1">
                {scheme.scheme_name}
              </h3>

              {/* Department */}
              <p className="text-xs text-slate-500 mt-0.5 flex items-center line-clamp-1">
                <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                {scheme.department}
              </p>
            </div>

            {/* Score & Category Indicator (if evaluated) */}
            {isEvaluated && (
              <ScoreGauge
                score={scheme.matching_score}
                category={scheme.result_category}
                mandatorySatisfied={scheme.mandatory_satisfied}
              />
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex-1 space-y-4 text-xs text-slate-600">
          {/* Description */}
          <p className="line-clamp-2 leading-relaxed text-slate-600">
            {scheme.description}
          </p>

          {/* Key Satisfied Reasons preview */}
          {scheme.criteria_satisfied && scheme.criteria_satisfied.length > 0 && (
            <div className="space-y-1">
              <span className="font-bold text-slate-700 flex items-center text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Satisfied Conditions:
              </span>
              <ul className="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
                {scheme.criteria_satisfied.slice(0, 2).map((c, i) => (
                  <li key={i} className="line-clamp-1">
                    {c.description || c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unmet Criteria Warning preview */}
          {scheme.criteria_unmet && scheme.criteria_unmet.length > 0 && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-[11px]">
              <span className="font-bold flex items-center mb-0.5">
                <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600 shrink-0" />
                Unmet Mandatory Criterion:
              </span>
              <p className="line-clamp-1 text-rose-700">
                {scheme.criteria_unmet[0].failure_reason || scheme.criteria_unmet[0].description || 'Criteria not met'}
              </p>
            </div>
          )}

          {/* Missing info tag */}
          {scheme.missing_profile_information && scheme.missing_profile_information.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
              <span className="font-bold flex items-center mb-0.5">
                <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-600 shrink-0" />
                Needs Information:
              </span>
              <p className="line-clamp-1 text-amber-800">
                Specify: {scheme.missing_profile_information.join(', ')}
              </p>
            </div>
          )}

          {/* Required Documents Tag & Verification Date */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-brand-purple" />
              {scheme.required_documents?.length || scheme.documents_count || 3} Required Documents
            </span>
            <span className="text-slate-500 font-semibold flex items-center">
              <Calendar className="w-3 h-3 mr-1 text-slate-400" />
              Verified: {scheme.last_verified_date ? String(scheme.last_verified_date).slice(0, 10) : '2026-03'}
            </span>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-brand-navy hover:text-brand-purple hover:border-brand-purple/40 flex items-center transition shadow-2xs"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-400" />
            </button>

            {onSave && (
              <button
                onClick={() => onSave(schemeId)}
                className={`p-1.5 rounded-xl text-xs border transition ${
                  isSaved
                    ? 'bg-brand-lavender text-brand-purple border-brand-purple/40'
                    : 'bg-white text-slate-400 border-slate-200 hover:text-brand-purple hover:border-brand-purple/40'
                }`}
                title={isSaved ? 'Saved in bookmarks' : 'Save Scheme'}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            {scheme.source_url && (
              <a
                href={scheme.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-slate-500 hover:text-brand-purple flex items-center transition"
                title={`Source: ${scheme.source_ref || 'Official Portal'}`}
              >
                <span>Source</span>
                <ExternalLink className="w-3 h-3 ml-0.5 text-slate-400" />
              </a>
            )}

            {scheme.official_url && (
              <a
                href={scheme.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand-purple hover:text-brand-purpleDark flex items-center transition"
                title="Official Application Portal"
              >
                <span>Apply</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Details & Checklist Modal */}
      <SchemeDetailModal
        scheme={scheme}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={onSave}
        isSaved={isSaved}
      />
    </>
  );
}

export default SchemeCard;
