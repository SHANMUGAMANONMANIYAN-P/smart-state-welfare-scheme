import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { schemesAPI } from '../services/api';
import SchemeDetailModal from '../components/SchemeDetailModal';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  FileText,
  Lock,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Building2,
  HelpCircle,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sliders,
  Check,
  Eye,
  Info,
  Globe,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [stats, setStats] = useState({
    totalSchemes: 0,
    categoriesCount: 0,
    loading: true,
  });

  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await schemesAPI.getAll();
        const allSchemes = res.data.data || [];
        const categories = new Set(allSchemes.map((s) => s.category));
        setSchemes(allSchemes.slice(0, 4)); // top 4 featured
        setStats({
          totalSchemes: allSchemes.length,
          categoriesCount: categories.size,
          loading: false,
        });
      } catch (err) {
        console.warn('Schemes load notice:', err.message);
        setStats({ totalSchemes: 7, categoriesCount: 6, loading: false });
      } finally {
        setLoadingSchemes(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-white min-h-screen text-slate-800">
      {/* =========================================================================
          TOP NAVIGATION HEADER
         ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900">
                Smart<span className="text-teal-600">State</span> Welfare
              </div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {language === 'ta' ? 'அரசு நலத்திட்ட தளம்' : 'Tamil Nadu & Central Guidance'}
              </div>
            </div>
          </Link>

          {/* Center Links (desktop) */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-600">
            <Link to="/" className="text-teal-600 hover:text-teal-700">{t('navHome')}</Link>
            <Link to="/schemes" className="hover:text-teal-600 transition">{t('navAllSchemes')}</Link>
            <Link to="/help" className="hover:text-teal-600 transition">{t('navHelp')}</Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200 text-xs font-bold transition shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
              >
                {t('navDashboard')} &rarr;
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-teal-600 hover:bg-slate-50 transition"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition"
                >
                  {t('navRegister')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 3: HERO SECTION (2 Columns on Desktop, Stacked on Mobile)
         ========================================================================= */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Small Label */}
              <div className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse" />
                PUBLIC WELFARE GUIDANCE PORTAL
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Find Government Welfare Schemes That Match Your Needs
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                Enter your basic details to discover welfare schemes that may suit your age, income, occupation, family, and location. Get clear eligibility guidance, matching reasons, and a checklist of required documents in one place.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-sm sm:text-base font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md transition-all"
                >
                  <span>Check My Eligibility</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>

                <Link
                  to="/schemes"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg text-sm sm:text-base font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-all"
                >
                  <Search className="w-4 h-4 mr-2 text-slate-500" />
                  <span>Explore Schemes</span>
                </Link>
              </div>

              {/* 3 Short Trust Points with Icons */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Easy eligibility checking</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <span>Clear matching explanations</span>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span>Privacy-conscious design</span>
                </div>
              </div>
            </div>

            {/* Right Column: Citizen Welfare Dashboard Visual */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      SW
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Citizen Evaluation Preview</div>
                      <div className="text-[10px] text-slate-500">Live rule engine matching</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    Active Session
                  </span>
                </div>

                {/* 1. Citizen Profile Card Summary */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 shadow-2xs">
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span className="font-semibold text-slate-700">Citizen Profile</span>
                    <span>Rural • Cultivator</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Age</span>
                      <span className="font-semibold text-slate-800">42 Years</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Annual Income</span>
                      <span className="font-semibold text-slate-800">₹1,20,000</span>
                    </div>
                  </div>
                </div>

                {/* 2. Scheme Recommendation Card */}
                <div className="bg-white p-3.5 rounded-xl border border-teal-200 bg-teal-50/20 text-xs space-y-2 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                        Top Potential Match
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-0.5">
                        PM Kisan Samman Nidhi
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-600 text-white shadow-2xs">
                        100% Match
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Direct financial support of ₹6,000/year in 3 installments for agrarian landholder families.
                  </p>
                </div>

                {/* 3. Document Checklist Card */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 shadow-2xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-700">Required Document Checklist</span>
                    <span className="text-teal-700 font-bold text-[10px]">3 of 3 Available</span>
                  </div>
                  <div className="space-y-1.5 pt-1 text-[11px] text-slate-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Land Ownership Patta / Khatauni</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Valid Identity Card (Voter ID)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>Bank Passbook for Direct Transfer</span>
                    </div>
                  </div>
                </div>

                {/* 4. Progress Indicator */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-600 font-medium mb-1">
                    <span>Criteria Evaluated</span>
                    <span className="text-teal-700 font-bold">4 of 4 Conditions Met</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full w-full transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: QUICK STATISTICS SECTION
         ========================================================================= */}
      <section className="bg-slate-50 border-b border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.loading ? '...' : stats.totalSchemes}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Welfare schemes available
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">
                Active
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Eligibility checks completed
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Rule-Based
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Personalized recommendations
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">
                {stats.loading ? '...' : `${stats.categoriesCount} Sectors`}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Covering health, housing & farming
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: MAIN FEATURE SECTION
         ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to Find Suitable Schemes
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              One simple platform to explore schemes and understand their requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-slate-50/70 hover:bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-5">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Multi-Scheme Matching
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compare your profile against multiple scheme requirements in one eligibility check.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50/70 hover:bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-5">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Clear Eligibility Results
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Understand which conditions match your profile and which requirements still need attention.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50/70 hover:bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-5">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Required Document Checklist
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review the documents you may need before applying through an official portal.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50/70 hover:bg-white p-6 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-5">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Privacy and Security
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your account is protected, and the application avoids collecting unnecessary sensitive information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: HOW IT WORKS SECTION
         ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How SmartWelfare Works
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Three simple steps to find welfare schemes relevant to you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-2xs relative flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 mb-4">
                  STEP 1
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Create Your Profile
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Register and enter the basic socio-economic information needed to check scheme requirements.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Income, age, area & trade
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-2xs relative flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 mb-4">
                  STEP 2
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Check Eligibility
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The engine compares your profile with the configured eligibility criteria and checks mandatory conditions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Automated rule evaluation
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-2xs relative flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 mb-4">
                  STEP 3
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  View Recommendations
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  See potential scheme matches, matching scores, unmet criteria, and required documents.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Actionable checklist & official links
              </div>
            </div>
          </div>

          {/* Centered Teal Button */}
          <div className="mt-12 text-center">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-sm font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FEATURED SCHEMES SECTION
         ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore Welfare Schemes
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Sample schemes configured in the engine with official criteria rules and document requirements.
              </p>
            </div>

            <Link
              to="/schemes"
              className="inline-flex items-center text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              <span>View All Schemes</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loadingSchemes ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading active schemes from database...
            </div>
          ) : schemes.length === 0 ? (
            <div className="p-8 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
              Scheme information will appear here once available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {schemes.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between p-5"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {s.category}
                      </span>
                      <span className="inline-flex items-center text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        <MapPin className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                        {s.state_coverage || 'All-India'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                      {s.scheme_name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {s.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedScheme(s)}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View Details
                    </button>

                    {s.official_url && (
                      <a
                        href={s.official_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center"
                        title="Official Portal Source"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to="/schemes"
              className="inline-flex items-center px-6 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
            >
              <span>View All Schemes</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: ABOUT SECTION
         ========================================================================= */}
      <section id="about" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              About the Eligibility Engine
            </h2>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              The Smart Welfare Scheme Eligibility Prediction Engine is designed to simplify the process of discovering government welfare schemes. It compares citizen profile information with configured scheme criteria, provides understandable matching results, and highlights missing information and required documents.
            </p>
          </div>

          {/* Three Key Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs text-center sm:text-left">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-4 mx-auto sm:mx-0">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Transparency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deterministic, explainable rule matching. Citizens see exactly which conditions were satisfied and which criteria were not met.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs text-center sm:text-left">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-4 mx-auto sm:mx-0">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Accessibility</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear, simple language with actionable document checklists, designed for easy navigation on mobile, tablet, and desktop devices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs text-center sm:text-left">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-4 mx-auto sm:mx-0">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Responsible Use of Data</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Data minimization. We do not ask for national ID numbers, biometric records, or banking passwords. Your data stays yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ADVISORY NOTICE BOX
         ========================================================================= */}
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs text-slate-600 leading-relaxed shadow-2xs">
            <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Advisory Notice: </span>
              SmartWelfare provides informational eligibility guidance based on configured scheme criteria. Matching scores are not official approval or a guarantee of benefits. Verify all requirements with the relevant government department before applying.
            </div>
          </div>
        </div>
      </section>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          isOpen={Boolean(selectedScheme)}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
}

export default LandingPage;
