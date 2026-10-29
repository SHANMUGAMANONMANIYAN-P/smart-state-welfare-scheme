import React from 'react';
import { ShieldCheck, Lock, Code, Database, Server, Cpu, CheckCircle } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Project Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            About the Smart Welfare Scheme Engine
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            A reliable, full-stack open public service engineering platform built to bridge the discovery gap in citizen welfare programs.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-700">
          {/* Mission */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              Mission & Objective
            </h2>
            <p className="leading-relaxed mb-3">
              Citizens often miss out on entitled public welfare assistance simply because information is fragmented across disparate ministry websites with opaque qualifying criteria.
            </p>
            <p className="leading-relaxed">
              The Smart Welfare Scheme Eligibility Prediction Engine provides an accessible, unified discovery service that compares a citizen's socio-economic circumstances against official program parameters in a single evaluation run.
            </p>
          </div>

          {/* Technology Architecture */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Technology Stack & Implementation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <Code className="w-4 h-4 text-teal-600" />
                  <span>Frontend (Client)</span>
                </div>
                <p className="text-slate-600 text-xs">
                  React 18 with Vite, Tailwind CSS, React Router, Axios, and Lucide React icons. Accessible, responsive, mobile-first design.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <Server className="w-4 h-4 text-teal-600" />
                  <span>Backend (Server)</span>
                </div>
                <p className="text-slate-600 text-xs">
                  Node.js and Express.js REST APIs with JWT authentication, bcrypt password hashing, input validation, and security rate limiting.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <Database className="w-4 h-4 text-teal-600" />
                  <span>Relational Database</span>
                </div>
                <p className="text-slate-600 text-xs">
                  MySQL 8.0+ with mysql2 package, featuring normalized tables with foreign keys, indexes, and automated migration scripts.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <Cpu className="w-4 h-4 text-teal-600" />
                  <span>Eligibility Engine</span>
                </div>
                <p className="text-slate-600 text-xs">
                  Rule-based, explainable matching algorithm utilizing weighted scoring, mandatory precondition gating, and partial match buffers.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base mb-3">
              <Lock className="w-5 h-5 text-teal-600" />
              <h2>Privacy-First Data Architecture</h2>
            </div>
            <p className="leading-relaxed mb-3">
              Our application adheres strictly to data minimization standards:
            </p>
            <ul className="space-y-1.5 pl-5 list-disc text-slate-600">
              <li><span className="font-semibold text-slate-800">No National Identity Numbers:</span> We never ask for or store Aadhaar numbers, PAN cards, or voter registry secrets.</li>
              <li><span className="font-semibold text-slate-800">No Financial Account Identifiers:</span> No bank account numbers, IFSC codes, or credit details are recorded.</li>
              <li><span className="font-semibold text-slate-800">Isolated Profile Security:</span> Profiles are strictly scoped to authenticated user accounts and never exposed to other citizens.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
