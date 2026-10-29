import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, eligibilityAPI } from '../services/api';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  MapPin,
  Briefcase,
  Home,
  Check,
  ChevronRight,
} from 'lucide-react';

const INDIAN_STATES = [
  'Tamil Nadu', 'Uttar Pradesh', 'Maharashtra', 'Gujarat', 'Karnataka', 'Kerala',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Madhya Pradesh',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Telangana', 'Tripura', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

export default function RegisterPage() {
  const { register, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Multi-step: Step 1 = Account Credentials, Step 2 = Personal Details
  const [step, setStep] = useState(1);

  // Step 1: Account Credentials
  const [accountData, setAccountData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Personal Details
  const [personalData, setPersonalData] = useState({
    age: 28,
    gender: 'male',
    state: 'Tamil Nadu',
    district: 'Chennai',
    area_type: 'urban',
    occupation: 'Farmer',
    employment_status: 'self_employed',
    annual_income: 120000,
    education_level: 'secondary',
    family_size: 4,
    housing_status: 'owned',
    social_category: 'obc',
    is_student: false,
    is_disabled: false,
    disability_percentage: 0,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleAccountChange = (e) => {
    setAccountData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePersonalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPersonalData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Step 1 Submission: Create Account via Backend
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!accountData.full_name.trim() || accountData.full_name.trim().length < 2) {
      setErrorMessage('Please enter your full legal name (at least 2 characters).');
      return;
    }

    if (!accountData.email.trim() || !accountData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (accountData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (accountData.password !== accountData.confirm_password) {
      setErrorMessage('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setLoading(true);
    try {
      // Backend creates user with role: 'citizen' and logs in
      await register({
        full_name: accountData.full_name.trim(),
        email: accountData.email.trim(),
        password: accountData.password,
      });

      // Move smoothly to Step 2 to ask for personal details
      setStep(2);
      setSuccessNotice(`Welcome ${accountData.full_name.trim()}! Your account is created. Please enter your personal details below.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          (err.response?.status === 409
            ? 'An account with this email already exists. Please sign in instead.'
            : 'Registration failed. Please check your inputs.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Submission: Save Personal Details & Run Eligibility Prediction
  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedAge = Number(personalData.age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge >= 100) {
      setErrorMessage('Age must be below 100 years (0 to 99).');
      return;
    }

    setLoading(true);

    try {
      // 1. Update full citizen profile
      await profileAPI.updateProfile({
        full_name: accountData.full_name.trim(),
        age: parsedAge,
        gender: personalData.gender,
        state: personalData.state.trim(),
        district: personalData.district.trim(),
        area_type: personalData.area_type,
        occupation: personalData.occupation.trim(),
        employment_status: personalData.employment_status,
        annual_income: Number(personalData.annual_income) || 0,
        education_level: personalData.education_level,
        family_size: Number(personalData.family_size) || 1,
        housing_status: personalData.housing_status,
        social_category: personalData.social_category,
        is_student: personalData.is_student ? 1 : 0,
        is_disabled: personalData.is_disabled ? 1 : 0,
        disability_percentage: personalData.is_disabled ? Number(personalData.disability_percentage) || 40 : 0,
      });

      // 2. Refresh profile in context
      if (refreshProfile) {
        await refreshProfile();
      }

      // 3. Immediately run eligibility prediction engine
      try {
        await eligibilityAPI.evaluate();
      } catch (evalErr) {
        console.warn('Initial evaluation notice:', evalErr.message);
      }

      // 4. Navigate directly to dashboard / recommended schemes with matched results
      navigate('/recommended');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to save personal details. Please review and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 selection:bg-brand-lavender selection:text-brand-purple">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-purpleDark flex items-center justify-center text-white shadow-md shadow-brand-purple/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight text-brand-navy">
              Smart<span className="text-brand-purple">Welfare</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {step === 1 ? 'Citizen Registration' : 'Personal Details Onboarding'}
            </div>
          </div>
        </Link>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          {step === 1 ? (
            <>
              <span className="text-slate-500 hidden sm:inline">Already registered?</span>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-brand-purple hover:bg-brand-lavender/40 transition shadow-2xs font-bold"
              >
                Sign In
              </Link>
            </>
          ) : (
            <button
              onClick={handleSkip}
              className="text-xs text-slate-500 hover:text-brand-purple font-semibold transition"
            >
              Skip to Dashboard &rarr;
            </button>
          )}
        </div>
      </header>

      {/* Stepper Progress Bar */}
      <div className="max-w-md sm:max-w-xl w-full mx-auto my-3">
        <div className="flex items-center justify-between relative">
          <div className="w-full absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-0" />
          
          {/* Step 1 Node */}
          <div className="relative z-10 flex items-center space-x-2 bg-brand-bg pr-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-purple text-white shadow-md shadow-brand-purple/30'
              }`}
            >
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-xs font-bold ${step === 1 ? 'text-brand-navy' : 'text-slate-500'}`}>
              Account Setup
            </span>
          </div>

          {/* Step 2 Node */}
          <div className="relative z-10 flex items-center space-x-2 bg-brand-bg pl-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === 2
                  ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/30'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </div>
            <span className={`text-xs font-bold ${step === 2 ? 'text-brand-purple' : 'text-slate-400'}`}>
              Personal Details
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full mx-auto my-auto py-2">
        {/* STEP 1: Account Credentials Form */}
        {step === 1 && (
          <div className="max-w-md w-full mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-9 shadow-xl shadow-slate-200/50">
              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-lavender text-brand-purple mx-auto flex items-center justify-center shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-brand-navy tracking-tight">
                  Create Citizen Account
                </h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Sign up with your credentials, then enter your personal details to find matched welfare schemes.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleAccountSubmit} className="space-y-4">
                {/* Full Legal Name */}
                <div>
                  <label htmlFor="full_name" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      required
                      value={accountData.full_name}
                      onChange={handleAccountChange}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 placeholder-slate-400 outline-hidden transition bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={accountData.email}
                      onChange={handleAccountChange}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 placeholder-slate-400 outline-hidden transition bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={accountData.password}
                      onChange={handleAccountChange}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 placeholder-slate-400 outline-hidden transition bg-slate-50/50 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirm_password" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={accountData.confirm_password}
                      onChange={handleAccountChange}
                      placeholder="Re-enter your password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 placeholder-slate-400 outline-hidden transition bg-slate-50/50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purpleDark hover:from-brand-purpleDark hover:to-primary-800 text-white font-bold text-xs shadow-md shadow-brand-purple/25 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Creating Account...' : 'Continue to Personal Details'}</span>
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-500">Already have an account? </span>
                <Link to="/login" className="text-xs font-bold text-brand-purple hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Personal Details & Socio-Economic Information Form */}
        {step === 2 && (
          <div className="max-w-2xl w-full mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6">
              {/* Header */}
              <div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
                <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider bg-brand-lavender px-3 py-1 rounded-full mb-1">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                  Step 2: Socio-Economic Profile
                </div>
                <h2 className="text-2xl font-black text-brand-navy tracking-tight">
                  Enter Your Personal Details
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  These details allow our explainable rule engine to match government welfare schemes, housing subsidies, and grants tailored to your household.
                </p>
              </div>

              {successNotice && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handlePersonalSubmit} className="space-y-5">
                {/* 1. Basic Personal Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                    1. Basic Demographics
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Age */}
                    <div>
                      <label htmlFor="age" className="block text-xs font-bold text-slate-700 mb-1">
                        Age (Years) *
                      </label>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        min="0"
                        max="99"
                        required
                        value={personalData.age}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label htmlFor="gender" className="block text-xs font-bold text-slate-700 mb-1">
                        Gender *
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        required
                        value={personalData.gender}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="transgender">Transgender</option>
                        <option value="other">Other / Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Residence & Location */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                    2. Location & Residence
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* State */}
                    <div>
                      <label htmlFor="state" className="block text-xs font-bold text-slate-700 mb-1">
                        State *
                      </label>
                      <select
                        id="state"
                        name="state"
                        required
                        value={personalData.state}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div>
                      <label htmlFor="district" className="block text-xs font-bold text-slate-700 mb-1">
                        District *
                      </label>
                      <input
                        id="district"
                        name="district"
                        type="text"
                        required
                        placeholder="e.g. Chennai / Varanasi"
                        value={personalData.district}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>

                    {/* Area Type */}
                    <div>
                      <label htmlFor="area_type" className="block text-xs font-bold text-slate-700 mb-1">
                        Area Type *
                      </label>
                      <select
                        id="area_type"
                        name="area_type"
                        required
                        value={personalData.area_type}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      >
                        <option value="rural">Rural Panchayat</option>
                        <option value="urban">Urban Municipality</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Occupation & Financial Profile */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                    3. Occupation & Financial Profile
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Occupation */}
                    <div>
                      <label htmlFor="occupation" className="block text-xs font-bold text-slate-700 mb-1">
                        Primary Occupation *
                      </label>
                      <select
                        id="occupation"
                        name="occupation"
                        required
                        value={personalData.occupation}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      >
                        <option value="Farmer">Farmer / Agricultural Worker</option>
                        <option value="Student">Student</option>
                        <option value="Artisan">Artisan / Handloom Weaver</option>
                        <option value="Daily Wage Worker">Daily Wage Worker</option>
                        <option value="Salaried Employee">Salaried Employee</option>
                        <option value="Small Business Owner">Small Business Owner</option>
                        <option value="Retired Worker">Retired / Senior Citizen</option>
                        <option value="Homemaker">Homemaker</option>
                        <option value="General Worker">General Worker / Other</option>
                      </select>
                    </div>

                    {/* Annual Family Income */}
                    <div>
                      <label htmlFor="annual_income" className="block text-xs font-bold text-slate-700 mb-1">
                        Annual Household Income (₹) *
                      </label>
                      <input
                        id="annual_income"
                        name="annual_income"
                        type="number"
                        min="0"
                        step="5000"
                        required
                        placeholder="e.g. 120000"
                        value={personalData.annual_income}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Employment Status */}
                    <div>
                      <label htmlFor="employment_status" className="block text-xs font-bold text-slate-700 mb-1">
                        Employment Status
                      </label>
                      <select
                        id="employment_status"
                        name="employment_status"
                        value={personalData.employment_status}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      >
                        <option value="self_employed">Self Employed</option>
                        <option value="employed">Employed (Private / Contract)</option>
                        <option value="student">Student</option>
                        <option value="retired">Retired</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Education Level */}
                    <div>
                      <label htmlFor="education_level" className="block text-xs font-bold text-slate-700 mb-1">
                        Highest Education Level
                      </label>
                      <select
                        id="education_level"
                        name="education_level"
                        value={personalData.education_level}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      >
                        <option value="primary">Primary School</option>
                        <option value="secondary">Secondary (10th)</option>
                        <option value="higher_secondary">Higher Secondary (12th)</option>
                        <option value="graduate">Graduate / Degree</option>
                        <option value="post_graduate">Post Graduate / Diploma</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Household & Category Details */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                    <Home className="w-3.5 h-3.5 mr-1 text-brand-purple" />
                    4. Household & Special Categories
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Family Size */}
                    <div>
                      <label htmlFor="family_size" className="block text-xs font-bold text-slate-700 mb-1">
                        Family Size
                      </label>
                      <input
                        id="family_size"
                        name="family_size"
                        type="number"
                        min="1"
                        max="20"
                        value={personalData.family_size}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      />
                    </div>

                    {/* Housing Status */}
                    <div>
                      <label htmlFor="housing_status" className="block text-xs font-bold text-slate-700 mb-1">
                        Housing Status
                      </label>
                      <select
                        id="housing_status"
                        name="housing_status"
                        value={personalData.housing_status}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      >
                        <option value="owned">Owned Pucca House</option>
                        <option value="kutcha_house">Kutcha / Semi-Pucca House</option>
                        <option value="rented">Rented Accommodation</option>
                        <option value="homeless">Homeless / Destitute</option>
                      </select>
                    </div>

                    {/* Social Category */}
                    <div>
                      <label htmlFor="social_category" className="block text-xs font-bold text-slate-700 mb-1">
                        Social Category
                      </label>
                      <select
                        id="social_category"
                        name="social_category"
                        value={personalData.social_category}
                        onChange={handlePersonalChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                      >
                        <option value="general">General</option>
                        <option value="obc">OBC (Other Backward Class)</option>
                        <option value="sc">SC (Scheduled Caste)</option>
                        <option value="st">ST (Scheduled Tribe)</option>
                      </select>
                    </div>
                  </div>

                  {/* Special Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition">
                      <input
                        type="checkbox"
                        name="is_student"
                        checked={personalData.is_student}
                        onChange={handlePersonalChange}
                        className="rounded border-slate-300 text-brand-purple focus:ring-brand-purple/30 h-4 w-4"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        Currently enrolled student
                      </span>
                    </label>

                    <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60 transition">
                      <input
                        type="checkbox"
                        name="is_disabled"
                        checked={personalData.is_disabled}
                        onChange={handlePersonalChange}
                        className="rounded border-slate-300 text-brand-purple focus:ring-brand-purple/30 h-4 w-4"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        Certified Person with Disability (PwD)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purpleDark hover:from-brand-purpleDark hover:to-primary-800 text-white font-bold text-xs shadow-md shadow-brand-purple/30 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Evaluating Schemes...' : 'Save Personal Details & Check Eligibility'}</span>
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={loading}
                    className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Skip for now
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-400 max-w-xl mx-auto py-2 leading-relaxed">
        SmartWelfare Citizen Portal • Secure Public Administration & Eligibility Prediction Engine
      </footer>
    </div>
  );
}
