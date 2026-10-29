# 🏛️ Smart State Welfare Scheme 

> **Modern, Transparent, Rule-Based Welfare Scheme Discovery & Pre-Qualification Platform for Citizens**  
> *Empowering citizens across Tamil Nadu and All-India to discover welfare schemes, understand eligibility criteria, and find official government application links using verified open datasets.*

[![CI Tests](https://img.shields.io/badge/tests-99%20passed-brightgreen.svg)](https://github.com/SHANMUGAMANONMANIYAN-P/smart-state-welfare-scheme)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-purple.svg)](client/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-navy.svg)](server/)
[![Languages](https://img.shields.io/badge/Languages-English%20%7C%20%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D-teal.svg)](client/src/context/LanguageContext.jsx)

---

## 📌 Single Application URL
### **http://localhost:5000**
The entire full-stack application (React SPA, Vite build, Express REST APIs, Rule-Based Eligibility Engine, Scheme Assistant Chatbot, Admin Portal, and Database Connector) is unified and accessible from this single port.

---

## 🎯 Project Objective
Navigating government welfare schemes is challenging for citizens due to fragmented departmental websites, complex eligibility conditions, and unclear document requirements. **Smart State Welfare Scheme** solves this by:
1. **Discovering Relevant Schemes:** Matching citizen profiles against Central and Tamil Nadu State government schemes.
2. **Transparent Mathematical Scoring:** Giving clear matching percentages, gating mandatory conditions, and explaining unmet rules.
3. **Official Portals & Checklists:** Citing official government application URLs and listing required documents with issuing authorities.
4. **Bilingual Accessibility:** Full support in both **English** and **Tamil (தமிழ்)** for inclusive access.
5. **Interactive Scheme Assistant Chatbot:** Grounded scheme Q&A with verified citations and safe zero-hallucination fallback.
6. **Privacy-First Design:** Strictly zero requests for Aadhaar numbers, biometric details, or banking passwords.

---

## ⚡ Quick Start (One Command)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL 8.0+** (Optional: embedded resilient storage is included out of the box)

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/SHANMUGAMANONMANIYAN-P/smart-state-welfare-scheme.git
cd smart-state-welfare-scheme

# 2. Install all dependencies across root, server, and client
npm run install:all

# 3. Build the client & start the unified full-stack server
npm run build
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 🔑 Default Administrator Credentials
- **Email:** `shanmugamanonmaniyan@gmail.com`
- **Password:** `manon`
- **Role:** Administrator (Access to Scheme Management, Rule Editor, Document Checklists, Batch Importer, and System Analytics).

*Note: All newly registered accounts default strictly to the `citizen` role. Admin privilege escalation from public registration is blocked.*

---

## 🌟 Key Features

### 1. Bilingual Citizen Portal (English & தமிழ்)
- Seamless one-click language toggle across all navigation bars, cards, and modal dialogs.
- Culturally sensitive translations for government welfare terms, scheme categories, and eligibility outcomes.

### 2. Interactive Scheme Assistant Chatbot
- Floating chatbot widget accessible across all pages.
- Grounded Q&A answering questions regarding Tamil Nadu schemes (KMUT, Pudhumai Penn, CMCHIS, Free Electricity) and Central schemes (PM-KISAN, Ayushman Bharat, PMAY-G, Ujjwala, IGNOAPS).
- Cites official government portal URLs, mandatory documents, and eligibility rules.
- Deterministic rule-based knowledge fallback ensures zero hallucination even when an AI API key is unavailable.

### 3. Rule-Based Eligibility Prediction Engine
- Evaluates citizen profiles against weighted numerical (`<=`, `>=`, `between`) and categorical (`in`, `==`) criteria.
- **Mandatory Gating:** Failing a mandatory rule (e.g. residency or landholder status) strictly prevents false positives.
- **Explainable Feedback:** Clearly categorizes results into:
  - 🟢 **Potentially Eligible (தகுதியுடையவர்)** (Match Score $\ge 70\%$)
  - 🟡 **Needs More Information (கூடுதல் தகவல் தேவை)** (Missing optional profile attributes)
  - 🔴 **Unlikely to Qualify (தகுதியற்றவர்)** (Unmet mandatory conditions or score $< 70\%$)

### 4. Verified Government Datasets
- Official Central Government schemes (PM-KISAN, Ayushman Bharat, PMAY-G, PM Ujjwala Yojana, IGNOAPS Old Age Pension).
- Official Tamil Nadu State Government schemes (Kalaignar Magalir Urimai Thittam, Pudhumai Penn Scheme, CMCHIS Health Insurance, Marriage Assistance, Handloom Artisan Grants).
- Each scheme includes official department, verified source URL, application procedure, required documents, and last-verified date.

### 5. Multi-Criteria Search & Filtering
- Search schemes by name, keyword, or administering ministry.
- Filter by **Coverage** (All-India vs. Tamil Nadu).
- Filter by **Category** (Agriculture, Healthcare, Housing, Education, Social Welfare, Handloom).
- Filter by **Beneficiary Type** (Farmers, Women, Students, Senior Citizens, Artisans).

### 6. Privacy & Security
- **Data Minimization:** Collects only age, state, district, income, occupation, and family size.
- **No Sensitive Identifiers:** Never asks for Aadhaar number, PAN, voter ID, or bank account credentials.
- **Independent Advisory Disclaimer:** Clearly reminds citizens that the tool provides pre-qualification guidance and directs them to official portals for submission.

---

## 📂 Project Structure

```
smart-state-welfare-scheme/
├── client/                               # React 18 SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                   # TopNavbar & Sidebar with i18n
│   │   │   ├── SchemeCard.jsx            # Interactive scheme card with gauges
│   │   │   ├── SchemeChatbot.jsx         # Bilingual floating Scheme Assistant
│   │   │   ├── SchemeDetailModal.jsx     # Deep scheme view with documents & official URL
│   │   │   ├── ScoreGauge.jsx            # Visual radial match percentage gauge
│   │   │   └── ProtectedRoute.jsx        # RBAC route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Authentication, JWT, and session state
│   │   │   └── LanguageContext.jsx       # English & Tamil translations and switcher
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx           # Public portal introduction & feature cards
│   │   │   ├── LoginPage.jsx             # Citizen & Administrator sign-in
│   │   │   ├── RegisterPage.jsx          # 2-Step Registration & Onboarding
│   │   │   ├── ExploreSchemesPage.jsx    # Search & multi-filter directory
│   │   │   ├── CitizenDashboardPage.jsx  # Citizen overview & recommended programs
│   │   │   ├── CheckEligibilityPage.jsx  # Rule-based matching runner
│   │   │   ├── RecommendedSchemesPage.jsx# Ranked matched programs
│   │   │   ├── ProfilePage.jsx           # Socio-economic profile editor (< 100 age condition)
│   │   │   └── admin/                    # Administrator portal (Schemes, Criteria, Import)
│   │   ├── services/
│   │   │   └── api.js                    # Axios API client with interceptors
│   │   ├── App.jsx                       # Application router & provider mounting
│   │   └── main.jsx                      # Vite entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                               # Unified Express.js API & Knowledge Engine
│   ├── src/
│   │   ├── config/                       # Database connector (MySQL + SQLite fallback)
│   │   ├── controllers/                  # Route handlers (auth, schemes, eligibility, admin)
│   │   ├── data/                         # Predefined official government scheme datasets
│   │   │   ├── official_central_schemes.json
│   │   │   └── official_tamilnadu_schemes.json
│   │   ├── middleware/                   # JWT auth, role validation, error handling
│   │   ├── routes/                       # Express routes (auth, schemes, chatbot, import)
│   │   ├── services/                     # Core Business Logic
│   │   │   ├── eligibilityEngine.js      # Rule-based weighted scoring engine
│   │   │   ├── chatbotService.js         # Grounded scheme Q&A + Gemini integration
│   │   │   ├── importService.js          # CSV/JSON import with duplicate detection
│   │   │   └── schemeService.js          # Scheme persistence & query service
│   │   ├── validators/                   # Input validation (Age < 100, income, schemas)
│   │   ├── app.js                        # Express application instance
│   │   └── server.js                     # Server launcher
│   ├── tests/                            # Automated Test Suites
│   │   ├── eligibilityEngine.test.js     # 25 assertions on mathematical rules
│   │   ├── api.test.js                   # 32 assertions on REST endpoints & RBAC
│   │   ├── importModule.test.js          # 42 assertions on import & duplicate diffs
│   │   └── runAllTests.js                # Consolidated test runner
│   └── package.json
│
├── .gitignore                            # Clean ignores (node_modules, dist, *.sqlite)
├── package.json                          # Root orchestration scripts
└── README.md                             # Comprehensive project documentation
```

---

## 🧪 Automated Testing

Run the complete test suite verifying 99 / 99 assertions across all three test engines:

```bash
npm test
```

### Test Breakdown:
- **Eligibility Engine Tests (25 Assertions):**
  - Numerical operator evaluation (`<=`, `>=`, `between`).
  - 5% partial match credit buffer on optional numerical criteria.
  - Age lower boundary, upper boundary, inside range, and rejection of age $\ge 100$.
  - Multi-value category matching (case-insensitive occupation matching).
  - Null/undefined value handling (flagged as `Unknown`, never granted).
  - Mandatory criteria gating (failing a mandatory condition strictly forces `"Unlikely to Qualify"`).
  - Geographic state boundary matching & residency verification.
- **Full-Stack API Integration Tests (32 Assertions):**
  - Health check & scheme catalog queries.
  - Public registration with automatic `"citizen"` role assignment.
  - Role escalation prevention (public registration claiming `"admin"` is rejected with HTTP 400).
  - Duplicate email collision rejection (HTTP 409 Conflict).
  - Citizen login with bcrypt password verification & JWT token generation.
  - Profile queries and profile updates with range validation.
  - Eligibility engine execution (`POST /api/v1/eligibility/evaluate`).
  - Historical assessment audit log retrieval (`GET /api/v1/eligibility/history`).
  - Role-based authorization enforcement (citizen accessing `/api/v1/admin/*` receives HTTP 403 Forbidden).
  - Admin login, aggregate metrics query, scheme creation, criterion rule attachment, and status toggles.
- **Government Scheme Data Import Module Tests (42 Assertions):**
  - Valid scheme record structure validation (schema and field types).
  - Rejection of records missing mandatory fields or missing official source URLs.
  - Duplicate detection by stable `source_id` and composite `[scheme_name + state_coverage]`.
  - Field-level diff calculation between existing and incoming records to prevent silent overwrites.
  - Predefined Central Government & Tamil Nadu State Government dataset integrity.
  - ACID transactional rollback guarantee: forced failure mid-batch results in zero dirty database writes.
  - Batch import execution and audit log persistence in `scheme_import_logs`.
  - Verification governance workflow (`pending_verification` -> `verified` -> `outdated`).

---

## ⚙️ Environment Variables

Create `.env` in the repository root or in `server/.env`:

```env
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:5000
JWT_SECRET=smart_welfare_jwt_secret_secure_key_2026

# Optional: MySQL 8.0+ Configuration (If omitted, automatic embedded storage is used)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_welfare_db

# Optional: Google Gemini API Key for enhanced natural language scheme responses
# If omitted, the high-precision rule-based knowledge engine answers all scheme questions safely
GEMINI_API_KEY=
```

---

## 🚀 Deployment Instructions

### Option 1: Docker Deployment (Recommended)
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm run install:all
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```
Build and run:
```bash
docker build -t smart-state-welfare-scheme .
docker run -p 5000:5000 smart-state-welfare-scheme
```

### Option 2: Render / Railway / Ubuntu VPS
1. Connect repository `https://github.com/SHANMUGAMANONMANIYAN-P/smart-state-welfare-scheme`
2. **Build Command:** `npm run install:all && npm run build`
3. **Start Command:** `npm start`
4. **Environment Variables:** Set `NODE_ENV=production` and `PORT=5000`.

---

## 📜 Disclaimer
**Smart State Welfare Scheme** is an independent informational and eligibility pre-qualification guidance tool. It is **not** an official government portal. It does not issue government grants or process official applications. Citizens should always verify final eligibility and submit applications on designated government portals (such as [tn.gov.in](https://www.tn.gov.in) or [india.gov.in](https://www.india.gov.in)).

---

## 👤 Author & Maintainer
- **GitHub:** [@SHANMUGAMANONMANIYAN-P](https://github.com/SHANMUGAMANONMANIYAN-P)
- **Repository:** [https://github.com/SHANMUGAMANONMANIYAN-P/smart-state-welfare-scheme](https://github.com/SHANMUGAMANONMANIYAN-P/smart-state-welfare-scheme)
