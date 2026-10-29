/**
 * ============================================================================
 * Integration Tests: REST APIs, Auth, Profile, Eligibility & Admin Security
 * ============================================================================
 */

import http from 'http';
import app from '../src/app.js';
import { initializeDatabase } from '../src/config/db.js';

let server;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runApiTests() {
  console.log('\n--- STARTING FULL-STACK API INTEGRATION TESTS ---');
  await initializeDatabase();

  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
  console.log(`Test server running on ${baseUrl}`);

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      throw new Error(message);
    } else {
      passed++;
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    // 1. Health check
    const healthRes = await request('GET', '/api/v1/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'healthy', 'GET /api/v1/health returns 200 healthy');

    // 2. Public Scheme Listing
    const schemesRes = await request('GET', '/api/v1/schemes');
    assert(schemesRes.status === 200 && Array.isArray(schemesRes.body.data), 'GET /api/v1/schemes returns list of active schemes');
    assert(schemesRes.body.data.length > 0, 'Database contains active demonstration schemes');

    // 3. Scheme Details
    const firstSchemeId = schemesRes.body.data[0].id;
    const schemeDetailRes = await request('GET', `/api/v1/schemes/${firstSchemeId}`);
    assert(schemeDetailRes.status === 200, 'GET /api/v1/schemes/:id returns 200');
    assert(Array.isArray(schemeDetailRes.body.data.criteria), 'Scheme detail contains criteria rules');
    assert(Array.isArray(schemeDetailRes.body.data.documents), 'Scheme detail contains document requirements');

    // 4. Citizen Registration
    const testCitizenEmail = `test.citizen.${Date.now()}@example.com`;
    const regRes = await request('POST', '/api/v1/auth/register', {
      email: testCitizenEmail,
      password: 'CitizenPassword@123',
      full_name: 'Test Citizen User',
      age: 32,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      occupation: 'Farmer',
      annual_income: 140000,
    });

    assert(regRes.status === 201 && regRes.body.success, 'POST /api/v1/auth/register creates new citizen account');
    assert(regRes.body.data.token, 'Registration returns JWT token');
    const citizenToken = regRes.body.data.token;

    // 5. Duplicate Email Rejection
    const dupRes = await request('POST', '/api/v1/auth/register', {
      email: testCitizenEmail,
      password: 'AnotherPassword@123',
      full_name: 'Duplicate Citizen',
    });
    assert(dupRes.status === 409, 'Duplicate email registration rejected with 409 Conflict');

    // 6. Security: Public Registration Admin Role Injection blocked
    const hackRes = await request('POST', '/api/v1/auth/register', {
      email: `hacker.${Date.now()}@evil.com`,
      password: 'Password@123',
      full_name: 'Fake Admin',
      role: 'admin', // Malicious attempt to escalate role
    });
    assert(hackRes.status === 400, 'Public registration attempting to claim admin role is rejected (400)');

    // 7. Google OAuth Status & Verification Endpoints
    const googleStatusRes = await request('GET', '/api/v1/auth/google/status');
    assert(googleStatusRes.status === 200, 'GET /api/v1/auth/google/status returns 200');
    assert(typeof googleStatusRes.body.data.configured === 'boolean', 'Google status returns configured boolean flag');

    const googleVerifyRes = await request('POST', '/api/v1/auth/google/verify', {});
    assert(googleVerifyRes.status === 400, 'POST /api/v1/auth/google/verify rejects empty credential with 400');

    // 8. Login Authentication
    const loginRes = await request('POST', '/api/v1/auth/login', {
      email: testCitizenEmail,
      password: 'CitizenPassword@123',
    });
    assert(loginRes.status === 200 && loginRes.body.data.token, 'POST /api/v1/auth/login succeeds with valid credentials');

    // 8. Auth /me endpoint
    const meRes = await request('GET', '/api/v1/auth/me', null, citizenToken);
    assert(meRes.status === 200 && meRes.body.data.email === testCitizenEmail, 'GET /api/v1/auth/me returns citizen profile info');

    // 9. Profile Retrieval and Updates
    const profileRes = await request('GET', '/api/v1/profile', null, citizenToken);
    assert(profileRes.status === 200 && profileRes.body.data.occupation === 'Farmer', 'GET /api/v1/profile returns citizen data');

    const updateProfileRes = await request('PUT', '/api/v1/profile', {
      full_name: 'Test Citizen Updated',
      age: 33,
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      annual_income: 150000,
      occupation: 'Farmer',
      housing_status: 'kutcha_house',
      area_type: 'rural',
      family_size: 4,
    }, citizenToken);
    assert(updateProfileRes.status === 200 && updateProfileRes.body.data.age === 33, 'PUT /api/v1/profile updates citizen profile');

    // 10. Run Eligibility Prediction Engine via API
    const evalRes = await request('POST', '/api/v1/eligibility/evaluate', null, citizenToken);
    assert(evalRes.status === 200 && evalRes.body.success, 'POST /api/v1/eligibility/evaluate executes prediction engine');
    assert(evalRes.body.data.total_evaluated > 0, 'Evaluation evaluated all available schemes');
    assert(Array.isArray(evalRes.body.data.recommendations), 'Returns ranked recommendations');
    assert(evalRes.body.data.assessment_id, 'Generates persistent assessment ID');

    // 11. Check Assessment History
    const historyRes = await request('GET', '/api/v1/eligibility/history', null, citizenToken);
    assert(historyRes.status === 200 && historyRes.body.data.length > 0, 'GET /api/v1/eligibility/history retrieves logged assessments');

    // 12. Bookmarking / Saved Schemes
    const saveRes = await request('POST', '/api/v1/saved-schemes', {
      scheme_id: firstSchemeId,
      notes: 'Check revenue documents with panchayat officer',
    }, citizenToken);
    assert(saveRes.status === 201 && saveRes.body.success, 'POST /api/v1/saved-schemes bookmarks scheme');

    const listSavedRes = await request('GET', '/api/v1/saved-schemes', null, citizenToken);
    assert(listSavedRes.status === 200 && listSavedRes.body.data.length === 1, 'GET /api/v1/saved-schemes returns bookmarked scheme');

    const deleteSavedRes = await request('DELETE', `/api/v1/saved-schemes/${firstSchemeId}`, null, citizenToken);
    assert(deleteSavedRes.status === 200, 'DELETE /api/v1/saved-schemes/:id removes bookmarked scheme');

    // 13. Admin Authorization Security Checks
    const citizenAdminAttempt = await request('GET', '/api/v1/admin/analytics', null, citizenToken);
    assert(citizenAdminAttempt.status === 403, 'Citizen token accessing /api/v1/admin/* is blocked (403 Forbidden)');

    // 14. Admin Login & Administrative Management
    const adminLoginRes = await request('POST', '/api/v1/auth/login', {
      email: 'shanmugamanonmaniyan@gmail.com',
      password: 'manon',
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.body.data.user.role === 'admin', 'Admin login succeeds with role="admin"');
    const adminToken = adminLoginRes.body.data.token;

    // Admin Analytics
    const analyticsRes = await request('GET', '/api/v1/admin/analytics', null, adminToken);
    assert(analyticsRes.status === 200 && analyticsRes.body.data.overview.total_schemes > 0, 'Admin can access system analytics');

    // Admin Scheme Creation
    const newSchemeRes = await request('POST', '/api/v1/admin/schemes', {
      scheme_name: 'Test Innovation Welfare Grant',
      description: 'Support grant for technical innovators in underprivileged regions',
      category: 'Education & Skill',
      department: 'Department of Science and Technology',
      state_coverage: 'All-India',
      min_age: 18,
      max_age: 35,
      min_income: 0,
      max_income: 300000,
      eligible_occupations: ['Student', 'Researcher'],
      official_url: 'https://dst.gov.in',
      is_active: true,
      source_ref: 'https://dst.gov.in',
      last_verified_date: '2026-03-01',
      is_demonstration: true,
    }, adminToken);
    assert(newSchemeRes.status === 201 && newSchemeRes.body.data.id, 'Admin can create new welfare scheme');
    const createdSchemeId = newSchemeRes.body.data.id;

    // Admin Criteria Addition
    const addCritRes = await request('POST', `/api/v1/admin/schemes/${createdSchemeId}/criteria`, {
      criterion_type: 'age',
      profile_field: 'age',
      operator: '<=',
      target_value: '35',
      is_mandatory: true,
      weight: 2.0,
      description: 'Applicant must be 35 years or younger',
      failure_reason: 'Age exceeds 35 years limit',
    }, adminToken);
    assert(addCritRes.status === 201, 'Admin can add criteria rule to scheme');

    // Admin Document Addition
    const addDocRes = await request('POST', `/api/v1/admin/schemes/${createdSchemeId}/documents`, {
      document_name: 'Innovation Project Proposal Draft',
      description: 'Detailed proposal outline',
      is_mandatory: true,
      issuing_authority: 'Applicant / College',
    }, adminToken);
    assert(addDocRes.status === 201, 'Admin can add document requirement');

    // Admin Scheme Status Toggle
    const toggleRes = await request('PATCH', `/api/v1/admin/schemes/${createdSchemeId}/status`, {
      is_active: false,
    }, adminToken);
    assert(toggleRes.status === 200 && toggleRes.body.data.is_active === 0, 'Admin can toggle scheme status');

    console.log(`\n========================================`);
    console.log(`ALL API INTEGRATION TESTS PASSED: ${passed} / ${total}`);
    console.log(`========================================\n`);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runApiTests().catch((err) => {
  console.error('API Test Suite Error:', err);
  if (server) server.close();
  process.exit(1);
});
