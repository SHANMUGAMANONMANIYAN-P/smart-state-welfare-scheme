import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Calculator,
  Lock,
  FileCheck,
  ExternalLink,
  Info,
  Award,
} from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      q: 'Does SmartWelfare officially approve my government welfare application?',
      a: 'No. SmartWelfare is an academic decision-support prototype that performs preliminary eligibility matching. Final approval, biometric verification, and fund disbursement rest exclusively with the respective central or state government ministries.',
    },
    {
      q: 'Why does the dashboard not display my income, age, or full profile?',
      a: 'SmartWelfare enforces strict data minimization. Complete socio-economic details are stored securely and displayed solely on the dedicated "My Profile" page to prevent accidental visual data leakage on public or shared computers.',
    },
    {
      q: 'How does the weighted scoring formula work?',
      a: 'The engine calculates: Eligibility Score = [Sum of (Weight × Match) / Sum of Applicable Weights] × 100. If any mandatory criterion fails, the program is strictly gated as "Unlikely to Qualify" regardless of the numerical score.',
    },
    {
      q: 'What does "Needs More Information" mean?',
      a: 'If a scheme requires a specific condition (e.g., student status, disability certificate, or housing type) that is not specified on your profile, the system transparently requests additional information instead of falsely declaring you ineligible.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
          <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
          Documentation & Methodology
        </div>
        <h2 className="text-2xl font-black text-brand-navy tracking-tight">
          Help and About SmartWelfare
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Academic prototype designed to simplify government welfare discovery through explainable AI rule matching.
        </p>
      </div>

      {/* Project Background Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-brand-purple" />
          <h3 className="text-base font-extrabold text-brand-navy">
            Project Overview & Mission
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>SmartWelfare</strong> is built as a Computer Science college mini-project and hackathon prototype. Millions of eligible citizens across India miss out on government welfare benefits simply because eligibility criteria are buried across hundreds of separate departmental portals. SmartWelfare solves this through a unified, rule-based recommendation engine that evaluates citizen profiles against national and state schemes transparently.
        </p>
      </div>

      {/* Key Architectural Principles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-brand-lavender text-brand-purple flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <h4 className="font-extrabold text-xs text-brand-navy">
            Explainable Matching
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Every recommendation explains why it was selected, which mandatory conditions passed, and what documents are required.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-brand-mint text-emerald-800 flex items-center justify-center font-bold">
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="font-extrabold text-xs text-brand-navy">
            Strict Data Minimization
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Personal and socio-economic information is strictly restricted to My Profile. Dashboard views never leak sensitive income or family data.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-brand-blue text-blue-800 flex items-center justify-center font-bold">
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <h4 className="font-extrabold text-xs text-brand-navy">
            Document Checklist
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Pre-flight checklist of required certificates (Khatauni, Ration Card, Income Affidavit) with designated issuing authorities.
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-base text-brand-navy">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <h5 className="font-bold text-xs text-brand-navy">
                {faq.q}
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Links & Disclaimer */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed space-y-2">
        <div className="font-bold flex items-center space-x-1.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Important Academic & Administrative Notice</span>
        </div>
        <p className="text-[11px] text-amber-800/90">
          All scheme data used in SmartWelfare is compiled from public official government portals including pmkisan.gov.in, pmjay.gov.in, pmayg.nic.in, and scholarships.gov.in. This application is a hackathon project prototype and does not represent an official agency of the Government of India.
        </p>
      </div>
    </div>
  );
}
