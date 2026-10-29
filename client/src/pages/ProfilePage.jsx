import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import {
  User,
  ShieldCheck,
  Building,
  HelpCircle,
  Save,
  CheckCircle2,
  AlertCircle,
  Play,
  Briefcase,
  Home,
  Heart,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry', 'National'
];

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    // Section 1: Basic Information
    full_name: '',
    email: user?.email || '',
    phone: '',
    date_of_birth: '',
    age: 28,
    gender: 'male',

    // Section 2: Socio-Economic Information
    annual_income: 120000,
    occupation: 'Farmer',
    employment_status: 'self_employed',
    education_level: 'secondary',
    family_size: 4,
    dependants: 2,

    // Section 3: Residential Information
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    area_type: 'rural',
    housing_status: 'kutcha_house',

    // Section 4: Additional Eligibility Information
    is_student: false,
    is_farmer: true,
    is_disabled: false,
    disability_percentage: 0,
    social_category: 'obc',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Fetch full profile from backend (My Profile is the only authorized view for complete socio-economic profile)
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await profileAPI.getProfile();
        if (res.data?.data) {
          const p = res.data.data;
          setFormData((prev) => ({
            ...prev,
            full_name: p.full_name || user?.full_name || '',
            email: user?.email || '',
            date_of_birth: p.date_of_birth ? p.date_of_birth.slice(0, 10) : '',
            age: p.age || 28,
            gender: p.gender || 'male',
            annual_income: p.annual_income || 120000,
            occupation: p.occupation || 'Farmer',
            employment_status: p.employment_status || 'self_employed',
            education_level: p.education_level || 'secondary',
            family_size: p.family_size || 4,
            state: p.state || 'Uttar Pradesh',
            district: p.district || 'Varanasi',
            area_type: p.area_type || 'rural',
            housing_status: p.housing_status || 'kutcha_house',
            is_student: Boolean(p.is_student),
            is_farmer: p.occupation?.toLowerCase().includes('farmer') || false,
            is_disabled: Boolean(p.is_disabled),
            disability_percentage: p.disability_percentage || 0,
            social_category: p.social_category || 'general',
          }));
        } else if (user?.full_name) {
          setFormData((prev) => ({ ...prev, full_name: user.full_name }));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const required = [
      formData.full_name,
      formData.age,
      formData.annual_income,
      formData.occupation,
      formData.state,
      formData.district,
      formData.employment_status,
      formData.education_level,
      formData.family_size,
      formData.housing_status,
      formData.area_type,
    ];
    const filled = required.filter((v) => v !== '' && v !== null && v !== undefined).length;
    return Math.round((filled / required.length) * 100);
  };

  const completionPercent = calculateCompletion();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDobChange = (e) => {
    const dob = e.target.value;
    let computedAge = formData.age;
    if (dob) {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      if (birthYear && birthYear <= currentYear) {
        computedAge = currentYear - birthYear;
      }
    }
    setFormData((prev) => ({
      ...prev,
      date_of_birth: dob,
      age: computedAge,
    }));
  };

  const handleSubmit = async (e, proceedToEvaluation = false) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');
    setFieldErrors({});

    // Client-side validations
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required.';
    if (formData.age < 0 || formData.age >= 100) errors.age = 'Age must be below 100 years (0 to 99).';
    if (formData.annual_income < 0) errors.annual_income = 'Income cannot be negative.';
    if (!formData.state.trim()) errors.state = 'State is required.';
    if (!formData.district.trim()) errors.district = 'District is required.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSaving(false);
      setErrorMessage('Please correct the validation errors in the form.');
      return;
    }

    try {
      await profileAPI.updateProfile({
        full_name: formData.full_name.trim(),
        date_of_birth: formData.date_of_birth || null,
        age: Number(formData.age),
        state: formData.state.trim(),
        district: formData.district.trim(),
        annual_income: Number(formData.annual_income),
        occupation: formData.occupation.trim(),
        employment_status: formData.employment_status,
        education_level: formData.education_level,
        family_size: Number(formData.family_size) || 1,
        housing_status: formData.housing_status,
        area_type: formData.area_type,
        is_disabled: formData.is_disabled ? 1 : 0,
        disability_percentage: Number(formData.disability_percentage) || 0,
        is_student: formData.is_student ? 1 : 0,
        gender: formData.gender,
        social_category: formData.social_category,
      });

      setSaveSuccess(true);

      if (proceedToEvaluation) {
        navigate('/check-eligibility');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to save profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-sm font-bold text-brand-navy">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center text-[11px] font-bold text-brand-purple uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
              Authorized Socio-Economic Profile
            </div>
            <h2 className="text-2xl font-black text-brand-navy tracking-tight">
              My Profile
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              This is the sole authorized interface for managing your complete personal and household socio-economic records. These values drive the prediction engine.
            </p>
          </div>

          {/* Section 5: Profile Completion Pill */}
          <div className="bg-brand-lavender/50 border border-brand-lavenderDark/80 p-3.5 rounded-xl shrink-0 text-center sm:text-right">
            <div className="text-[11px] font-bold text-brand-purple uppercase">
              Profile Completeness
            </div>
            <div className="text-2xl font-black text-brand-navy">
              {completionPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Welcome Notice if new account */}
      {(location.search.includes('onboarding') || location.search.includes('new')) && (
        <div className="p-4 rounded-2xl bg-brand-lavender/60 border border-brand-purple/30 text-brand-navy text-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-brand-purple text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-brand-navy">Welcome to SmartWelfare!</span>
              <span className="text-slate-600">Please review and complete your personal details below so our prediction engine can match eligible government schemes for you.</span>
            </div>
          </div>
        </div>
      )}

      {/* Success / Error Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              Profile updated successfully! Your updated data is saved in MySQL and will persist across sessions.
            </span>
          </div>
          <button
            onClick={() => navigate('/check-eligibility')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition"
          >
            Check Eligibility Now &rarr;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* SECTION 1: Basic Information */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-brand-purple" />
            <h3 className="font-extrabold text-base text-brand-navy">
              Section 1: Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition"
              />
              {fieldErrors.full_name && (
                <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.full_name}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-slate-400 font-normal">(Account identity)</span>
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 outline-hidden cursor-not-allowed"
              />
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-slate-400 font-normal">(Optional, for SMS alerts)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition"
              />
            </div>

            {/* Date of Birth & Age */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleDobChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  min={0}
                  max={99}
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition"
                />
                {fieldErrors.age && (
                  <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.age}</p>
                )}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gender <span className="text-slate-400 font-normal">(When relevant to women/maternal schemes)</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="transgender">Transgender</option>
                <option value="other">Prefer not to say</option>
              </select>
            </div>

            {/* Social Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Social Category / Reservation Group
              </label>
              <select
                name="social_category"
                value={formData.social_category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition bg-white"
              >
                <option value="general">General</option>
                <option value="obc">OBC (Other Backward Classes)</option>
                <option value="sc">SC (Scheduled Caste)</option>
                <option value="st">ST (Scheduled Tribe)</option>
                <option value="minority">Minority Community</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Socio-Economic Information */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-5 h-5 text-brand-purple" />
            <h3 className="font-extrabold text-base text-brand-navy">
              Section 2: Socio-Economic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Annual Family Income */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Annual Household Income (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="annual_income"
                required
                min={0}
                step={5000}
                value={formData.annual_income}
                onChange={handleChange}
                placeholder="e.g. 120000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Combined gross annual income of all resident family members.
              </p>
              {fieldErrors.annual_income && (
                <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.annual_income}</p>
              )}
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Trade or Occupation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="occupation"
                required
                value={formData.occupation}
                onChange={handleChange}
                placeholder="e.g. Farmer, Artisan, Student, Teacher"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used to match occupation-specific programs (e.g. PM Kisan, Weaver grants).
              </p>
            </div>

            {/* Employment Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Employment Status <span className="text-rose-500">*</span>
              </label>
              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition bg-white"
              >
                <option value="employed">Salaried / Employed</option>
                <option value="self_employed">Self Employed / Own Account Worker</option>
                <option value="unemployed">Unemployed Seeking Work</option>
                <option value="student">Student / In Training</option>
                <option value="retired">Retired / Senior</option>
                <option value="homemaker">Homemaker</option>
                <option value="other">Other / Daily Wage</option>
              </select>
            </div>

            {/* Education Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Highest Education Level
              </label>
              <select
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition bg-white"
              >
                <option value="no_formal_education">No Formal Schooling</option>
                <option value="primary">Primary School (Up to 5th)</option>
                <option value="secondary">Secondary School (10th)</option>
                <option value="higher_secondary">Higher Secondary (12th / Intermediate)</option>
                <option value="graduate">Graduate (Bachelors Degree)</option>
                <option value="post_graduate">Post Graduate (Masters)</option>
                <option value="doctorate">Doctorate / Professional</option>
              </select>
            </div>

            {/* Family Size */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Family Size <span className="text-slate-400 font-normal">(Resident members)</span>
              </label>
              <input
                type="number"
                name="family_size"
                min={1}
                max={50}
                value={formData.family_size}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition"
              />
            </div>

            {/* Dependants */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Number of Dependants <span className="text-slate-400 font-normal">(Children/Elders)</span>
              </label>
              <input
                type="number"
                name="dependants"
                min={0}
                max={30}
                value={formData.dependants}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Residential Information */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Home className="w-5 h-5 text-brand-purple" />
            <h3 className="font-extrabold text-base text-brand-navy">
              Section 3: Residential Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State / Union Territory <span className="text-rose-500">*</span>
              </label>
              <select
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition bg-white"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {fieldErrors.state && (
                <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.state}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="district"
                required
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g. Varanasi, Pune, Ahmedabad"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition"
              />
              {fieldErrors.district && (
                <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.district}</p>
              )}
            </div>

            {/* Rural / Urban */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Residential Region Type
              </label>
              <select
                name="area_type"
                value={formData.area_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition bg-white"
              >
                <option value="rural">Rural (Village / Gram Panchayat)</option>
                <option value="urban">Urban (Municipality / City)</option>
                <option value="semi_urban">Semi-Urban / Town</option>
              </select>
            </div>

            {/* Housing Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Housing Status <span className="text-slate-400 font-normal">(Relevant to housing grants)</span>
              </label>
              <select
                name="housing_status"
                value={formData.housing_status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden transition bg-white"
              >
                <option value="owned">Pucca House (Owned)</option>
                <option value="rented">Rented Accommodation</option>
                <option value="kutcha_house">Kutcha House / Temporary Roof</option>
                <option value="homeless">Houseless / Homeless</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: Additional Eligibility Information */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Heart className="w-5 h-5 text-brand-purple" />
            <h3 className="font-extrabold text-base text-brand-navy">
              Section 4: Additional Eligibility Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Checkbox */}
            <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-brand-purple/40 cursor-pointer transition">
              <input
                type="checkbox"
                name="is_student"
                checked={formData.is_student}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 text-brand-purple rounded border-slate-300 focus:ring-brand-purple"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Active Student Status</span>
                <span className="text-slate-500">Currently enrolled in recognized school, college, or university course.</span>
              </div>
            </label>

            {/* Farmer Checkbox */}
            <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-brand-purple/40 cursor-pointer transition">
              <input
                type="checkbox"
                name="is_farmer"
                checked={formData.is_farmer}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 text-brand-purple rounded border-slate-300 focus:ring-brand-purple"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Farmer / Landholder</span>
                <span className="text-slate-500">Owns or cultivates agricultural land or engaged in agricultural operations.</span>
              </div>
            </label>

            {/* Disability (Voluntary) */}
            <label className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 hover:border-brand-purple/40 cursor-pointer transition sm:col-span-2">
              <input
                type="checkbox"
                name="is_disabled"
                checked={formData.is_disabled}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 text-brand-purple rounded border-slate-300 focus:ring-brand-purple"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block">Person with Disability (Divyangjan)</span>
                <span className="text-slate-500">Voluntarily declare disability only if applying for specialized assistive programs.</span>
              </div>
            </label>

            {formData.is_disabled && (
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Certified Disability Percentage (%) <span className="text-slate-400 font-normal">(As on UDID card)</span>
                </label>
                <input
                  type="number"
                  name="disability_percentage"
                  min={0}
                  max={100}
                  value={formData.disability_percentage}
                  onChange={handleChange}
                  className="w-full sm:w-48 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 outline-hidden bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: Profile Completion & Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span className="font-bold text-brand-navy">All changes are securely saved in MySQL.</span>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Re-evaluating eligibility will use these latest saved values.
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-white border border-brand-purple text-brand-purple hover:bg-brand-lavender/40 text-xs font-bold shadow-2xs transition flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, true)}
              className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-bold shadow-md shadow-brand-purple/20 transition flex items-center space-x-1.5"
            >
              <span>Save & Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
