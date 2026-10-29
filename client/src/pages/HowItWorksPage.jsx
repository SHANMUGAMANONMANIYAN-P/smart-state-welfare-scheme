import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sliders,
  Scale,
  FileCheck,
} from 'lucide-react';

export function HowItWorksPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Algorithm Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How the Eligibility Prediction Engine Operates
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            A 100% explainable, transparent rule-based matching engine designed for public service guidance.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-700">
          {/* Section 1: The Weighted Score Formula */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-3">
              <Scale className="w-5 h-5 text-teal-600" />
              <h2>1. The Weighted Matching Formula</h2>
            </div>
            <p className="leading-relaxed mb-4">
              Rather than using an opaque black-box machine learning model that makes unexplainable claims, our engine calculates an exact, auditable matching score across every configured criterion:
            </p>

            <div className="bg-slate-900 text-teal-300 p-4 rounded-xl font-mono text-center text-xs sm:text-sm font-bold shadow-inner my-4">
              Matching Score = ( ∑ [criterion_weight × criterion_match_value] / ∑ applicable_weights ) × 100
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <span className="font-bold text-teal-900 block mb-1">1.0 = Satisfied</span>
                <span className="text-[11px] text-teal-800">The profile condition completely fulfills the criterion rule (e.g. age ≥ 18).</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="font-bold text-amber-900 block mb-1">0.5 = Marginal Match</span>
                <span className="text-[11px] text-amber-800">Assigned only on optional non-mandatory criteria when within a 5% marginal threshold.</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <span className="font-bold text-rose-900 block mb-1">0.0 = Not Satisfied</span>
                <span className="text-[11px] text-rose-800">The profile parameter does not fulfill the requirement rule.</span>
              </div>
            </div>
          </div>

          {/* Section 2: Mandatory Gating */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-3">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h2>2. Mandatory Precondition Gating</h2>
            </div>
            <p className="leading-relaxed mb-3">
              Many welfare schemes require non-negotiable preconditions (e.g. an agricultural grant strictly mandates that the applicant must be a registered farmer or farm worker, regardless of income).
            </p>
            <div className="p-4 bg-slate-50 border-l-4 border-slate-900 rounded-r-lg text-xs leading-relaxed text-slate-800">
              <span className="font-bold block text-slate-900 mb-1">Guaranteed Safety Principle:</span>
              A high matching score will <span className="font-bold underline">never</span> override a failed mandatory condition. If an applicant satisfies all optional criteria but fails a single mandatory rule, the scheme is immediately classified as <span className="font-bold text-rose-700">"Unlikely to Qualify"</span>.
            </div>
          </div>

          {/* Section 3: Handling Missing Data */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-3">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <h2>3. Handling Unknown or Missing Profile Attributes</h2>
            </div>
            <p className="leading-relaxed">
              If a citizen profile has not provided a specific parameter needed by a scheme rule (e.g. disability certificate percentage), the engine marks the criterion as <span className="font-semibold text-slate-900">"Unknown"</span> rather than silently assuming it is satisfied. The scheme is classified as <span className="font-semibold text-amber-700">"Needs More Information"</span> with an itemized prompt indicating exactly which field to update.
            </p>
          </div>

          {/* Section 4: Result Classification */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-3">
              <FileCheck className="w-5 h-5 text-teal-600" />
              <h2>4. Outcome Categories & Next Steps</h2>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg border border-teal-200 bg-teal-50/60">
                <span className="font-bold text-teal-900 text-xs block mb-0.5">Potentially Eligible</span>
                <p className="text-xs text-teal-800">
                  All mandatory conditions met and score ≥ 70%. We recommend gathering the documents shown in the checklist and applying through the official department portal.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60">
                <span className="font-bold text-amber-900 text-xs block mb-0.5">Needs More Information</span>
                <p className="text-xs text-amber-800">
                  Key profile fields needed to confirm eligibility are missing. Update your profile to reveal a definitive evaluation.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/60">
                <span className="font-bold text-rose-900 text-xs block mb-0.5">Unlikely to Qualify</span>
                <p className="text-xs text-rose-800">
                  One or more mandatory preconditions failed or the overall match score is below 50%.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 shadow-xs transition"
            >
              <span>Test the Engine with Your Profile</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorksPage;
