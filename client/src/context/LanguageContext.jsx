import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Brand & Top bar
    appName: 'Smart Welfare',
    portalName: 'Smart State Welfare Scheme',
    tagline: 'Government Pre-Qualification Engine',
    subTagline: 'Empowering Citizens with Verified Central & State Scheme Eligibility',
    adminConsole: 'Admin Console',
    citizenServices: 'Citizen Services',
    switchLanguage: 'தமிழ்',
    currentLanguageName: 'English',

    // Navigation
    navHome: 'Home',
    navDashboard: 'Dashboard',
    navProfile: 'My Profile',
    navCheckEligibility: 'Check Eligibility',
    navRecommended: 'Recommended Schemes',
    navAllSchemes: 'All Welfare Schemes',
    navSavedSchemes: 'Saved Schemes',
    navHistory: 'Evaluation History',
    navHelp: 'Help & Methodology',
    navLogin: 'Sign In',
    navRegister: 'Register',
    navLogout: 'Sign Out',
    adminDashboard: 'Admin Dashboard',
    manageSchemes: 'Manage Schemes',
    importSchemes: 'Import Schemes',
    eligibilityCriteria: 'Eligibility Criteria',
    requiredDocuments: 'Required Documents',
    citizenRecords: 'Citizen Records',
    reportsAnalytics: 'Reports & Analytics',
    settings: 'Settings',

    // Status & Outcomes
    eligible: 'Potentially Eligible',
    needsInfo: 'Needs More Information',
    unlikely: 'Unlikely to Qualify',
    matchScore: 'Match Score',
    viewDetails: 'View Details',
    applyOfficial: 'Apply on Official Portal',
    officialWebsite: 'Official Portal',
    lastVerified: 'Last Verified',
    source: 'Verified Source',
    department: 'Department',
    category: 'Category',
    coverage: 'Coverage',
    benefits: 'Key Benefits',
    documentsRequired: 'Required Documents',
    criteriaRules: 'Eligibility Criteria Rules',
    howToApply: 'Application Procedure',

    // Actions & Form
    searchPlaceholder: 'Search schemes by name, keyword, department, or benefit...',
    filterByState: 'Filter by Coverage',
    filterByCategory: 'Filter by Category',
    filterByBeneficiary: 'Beneficiary Type',
    sortBy: 'Sort Schemes',
    allRegions: 'All Schemes (National & State)',
    centralOnly: 'Central Government',
    tamilNaduOnly: 'Tamil Nadu Only',
    allCategories: 'All Categories',
    allBeneficiaries: 'All Beneficiaries',
    farmers: 'Farmers & Cultivators',
    women: 'Women & Mothers',
    students: 'Students & Youth',
    seniors: 'Senior Citizens',
    artisans: 'Artisans & Weavers',
    disabled: 'Persons with Disabilities',

    // Chatbot
    chatTitle: 'Scheme Assistant',
    chatSubtitle: 'Verified Government Scheme Advisor',
    chatWelcome: 'Hello! I am your Smart Welfare Scheme Assistant. You can ask me anything about Tamil Nadu state schemes, Central government schemes, eligibility rules, required documents, or application procedures.',
    chatPlaceholder: 'Ask a question (e.g. "Am I eligible for PM-KISAN?" or "Kalaignar Magalir Urimai Thittam documents")...',
    chatDisclaimer: 'Verified Official Guidance: Information is retrieved from verified government gazettes and official portal datasets.',
    quickQuestions: 'Suggested Questions',
    askQuestion: 'Ask',

    // Disclaimers & Footer
    disclaimerNotice: 'Independent Informational Tool: Smart State Welfare Scheme is an independent eligibility assessment tool designed to assist citizens in discovering public welfare benefits. We do not collect Aadhaar or bank details, nor do we issue official benefits. Always submit applications directly on designated government portals.',
    privacyNotice: 'Privacy Guarantee: No sensitive identity documents or financial credentials are ever requested or stored.',
  },
  ta: {
    // Brand & Top bar
    appName: 'ஸ்மார்ட் நலத்திட்டம்',
    portalName: 'ஸ்மார்ட் அரசு நலத்திட்டங்கள்',
    tagline: 'அரசு நலத்திட்ட தகுதி அறிதல் தளம்',
    subTagline: 'மத்திய மற்றும் தமிழ்நாடு அரசு நலத்திட்டங்களுக்கான எளிய தகுதி சரிபார்ப்பு தளம்',
    adminConsole: 'நிர்வாகப் பிரிவு',
    citizenServices: 'குடிமக்கள் சேவைகள்',
    switchLanguage: 'English',
    currentLanguageName: 'தமிழ்',

    // Navigation
    navHome: 'முகப்பு',
    navDashboard: 'டாஷ்போர்டு',
    navProfile: 'எனது சுயவிவரம்',
    navCheckEligibility: 'தகுதி சரிபார்த்தல்',
    navRecommended: 'பரிந்துரைக்கப்பட்ட திட்டங்கள்',
    navAllSchemes: 'அனைத்து நலத்திட்டங்கள்',
    navSavedSchemes: 'சேமித்த திட்டங்கள்',
    navHistory: 'மதிப்பீட்டு வரலாறு',
    navHelp: 'உதவி மற்றும் வழிகாட்டி',
    navLogin: 'உள்நுழைக',
    navRegister: 'பதிவு செய்க',
    navLogout: 'வெளியேறுக',
    adminDashboard: 'நிர்வாக டாஷ்போர்டு',
    manageSchemes: 'திட்டங்கள் மேலாண்மை',
    importSchemes: 'திட்டங்கள் பதிவேற்றம்',
    eligibilityCriteria: 'தகுதி விதிகள்',
    requiredDocuments: 'தேவையான ஆவணங்கள்',
    citizenRecords: 'குடிமக்கள் விவரங்கள்',
    reportsAnalytics: 'அறிக்கைகள் & பகுப்பாய்வு',
    settings: 'அமைப்புகள்',

    // Status & Outcomes
    eligible: 'தகுதியுடையவர்',
    needsInfo: 'கூடுதல் தகவல் தேவை',
    unlikely: 'தகுதியற்றவர்',
    matchScore: 'பொருத்த வீதம்',
    viewDetails: 'முழு விவரங்கள்',
    applyOfficial: 'அதிகாரப்பூர்வ தளத்தில் விண்ணப்பிக்க',
    officialWebsite: 'அரசு இணையதளம்',
    lastVerified: 'சரிபார்க்கப்பட்ட நாள்',
    source: 'அரசு ஆதாரம்',
    department: 'அரசுத் துறை',
    category: 'பிரிவு',
    coverage: 'பயன்பாட்டு எல்லை',
    benefits: 'திட்ட நன்மைகள்',
    documentsRequired: 'தேவையான ஆவணங்கள்',
    criteriaRules: 'தகுதி வரம்புகள் & நிபந்தனைகள்',
    howToApply: 'விண்ணப்பிக்கும் முறை',

    // Actions & Form
    searchPlaceholder: 'திட்டத்தின் பெயர், துறை, பயன் அல்லது தகுதி கொண்டு தேடுக...',
    filterByState: 'மாநிலம் / எல்லை வடிப்பான்',
    filterByCategory: 'துறை வடிப்பான்',
    filterByBeneficiary: 'பயனாளிகள் பிரிவு',
    sortBy: 'வரிசைப்படுத்துக',
    allRegions: 'அனைத்து திட்டங்கள் (மத்திய & தமிழ்நாடு)',
    centralOnly: 'மத்திய அரசு திட்டங்கள்',
    tamilNaduOnly: 'தமிழ்நாடு அரசு திட்டங்கள்',
    allCategories: 'அனைத்து பிரிவுகள்',
    allBeneficiaries: 'அனைத்து பயனாளிகள்',
    farmers: 'விவசாயிகள் & உழவர்கள்',
    women: 'மகளிர் மற்றும் தாய்மார்கள்',
    students: 'மாணவர்கள் & இளைஞர்கள்',
    seniors: 'மூத்த குடிமக்கள் (ஓய்வூதியம்)',
    artisans: 'கைத்தறி & கைவினைஞர்கள்',
    disabled: 'மாற்றுத்திறனாளிகள்',

    // Chatbot
    chatTitle: 'நலத்திட்ட உதவி பாட்',
    chatSubtitle: 'சரிபார்க்கப்பட்ட அரசு நலத்திட்ட வழிகாட்டி',
    chatWelcome: 'வணக்கம்! நான் உங்களின் அரசு நலத்திட்ட உதவி பாட். தமிழ்நாடு மற்றும் மத்திய அரசு நலத்திட்டங்கள், தகுதி வரம்புகள், தேவையான ஆவணங்கள் மற்றும் விண்ணப்பிக்கும் நடைமுறைகள் குறித்து நீங்கள் என்னிடம் கேட்கலாம்.',
    chatPlaceholder: 'உங்கள் சந்தேகத்தைக் கேளுங்கள் (எ.கா. "PM-KISAN தகுதி என்ன?" அல்லது "மகளிர் உரிமைத் திட்ட ஆவணங்கள்")...',
    chatDisclaimer: 'அதிகாரப்பூர்வ வழிகாட்டுதல்: அனைத்து பதில்களும் சரிபார்க்கப்பட்ட அரசு தரவுகளின் அடிப்படையில் வழங்கப்படுகின்றன.',
    quickQuestions: 'பரிந்துரைக்கப்பட்ட கேள்விகள்',
    askQuestion: 'கேள்',

    // Disclaimers & Footer
    disclaimerNotice: 'சுயாதீன தகவல் வழிகாட்டி: ஸ்மார்ட் அரசு நலத்திட்டங்கள் என்பது குடிமக்களுக்கு அரசு நலத்திட்டங்களை கண்டறிய உதவும் ஒரு சுயாதீன வழிகாட்டு தளம் மட்டுமே. நாங்கள் ஆதார் அல்லது வங்கி விவரங்களைக் கோருவதில்லை. எப்போதும் அதிகாரப்பூர்வ அரசு இணையதளங்களில் மட்டுமே விண்ணப்பிக்கவும்.',
    privacyNotice: 'தனியுரிமை உறுதி: எந்தவொரு ரகசிய அடையாள ஆவணமோ வங்கி கணக்கு விவரங்களோ கோரப்படாது.',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('smart_welfare_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('smart_welfare_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ta' : 'en'));
  };

  const t = (key, fallback = '') => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
