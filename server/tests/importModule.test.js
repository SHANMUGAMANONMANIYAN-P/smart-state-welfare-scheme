/**
 * ============================================================================
 * Unit & Integration Tests: Government Welfare Scheme Data Import Module
 * Tests for:
 * 1. Duplicate detection (by source_id & composite name+coverage) with field diffs
 * 2. Invalid fields and rejection of records missing required source URLs
 * 3. Structured criteria validation and eligibility engine compatibility
 * 4. Transactional safety and ACID rollback on failure
 * 5. Batch import execution and audit log persistence
 * ============================================================================
 */

import {
  validateSchemeRecord,
  detectDuplicates,
  executeImport,
  getImportLogs,
  verifyScheme,
  getPredefinedDataset,
} from '../src/services/importService.js';
import { query, withTransaction } from '../src/config/db.js';
import { evaluateScheme, RESULT_CATEGORIES } from '../src/services/eligibilityEngine.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  } else {
    passedTests++;
    console.log(`✅ PASS: ${message}`);
  }
}

async function runImportTests() {
  console.log('--- STARTING GOVERNMENT SCHEME DATA IMPORT MODULE TESTS ---');

  // Test 1: Record Validation - Valid Scheme
  {
    console.log('\n>>> Test 1: Validation of Valid Scheme Record');
    const validRecord = {
      source_id: 'TEST-GOI-001',
      scheme_name: 'National Test Krishi Assistance',
      department: 'Ministry of Agriculture',
      category: 'Agriculture & Farmers',
      state_coverage: 'All-India',
      source_url: 'https://data.gov.in/resource/test-krishi',
      source_ref: 'data.gov.in',
      benefits_summary: 'Rs 6,000 per year direct income support',
      min_income: 0,
      max_income: 200000,
      criteria: [
        {
          profile_field: 'occupation',
          operator: '=',
          target_value: 'Farmer',
          is_mandatory: true,
          weight: 2.0,
          description: 'Must be an active farmer',
        },
      ],
      documents: [
        {
          document_name: 'Land Ownership Patta',
          is_mandatory: true,
          issuing_authority: 'Revenue Department',
        },
      ],
    };

    const valResult = validateSchemeRecord(validRecord, 1);
    assert(valResult.valid === true, 'Valid scheme passes validation check');
    assert(valResult.errors.length === 0, 'No errors for valid scheme record');
    assert(valResult.record.slug === 'national-test-krishi-assistance', 'Slug generated properly');
  }

  // Test 2: Rejection of Missing Mandatory Fields & Missing Source URL
  {
    console.log('\n>>> Test 2: Rejection of Missing Fields and Missing Source URL');
    // Missing scheme_name
    const missingName = {
      department: 'Ministry of Health',
      source_url: 'https://data.gov.in/test',
    };
    const res1 = validateSchemeRecord(missingName, 2);
    assert(res1.valid === false, 'Rejects record with missing scheme_name');
    assert(res1.errors.some((e) => e.includes('scheme_name')), 'Reports scheme_name error');

    // Missing source_url (Strict requirement)
    const missingSourceUrl = {
      scheme_name: 'Unverified Scheme Without Source',
      department: 'Ministry of Finance',
    };
    const res2 = validateSchemeRecord(missingSourceUrl, 3);
    assert(res2.valid === false, 'Rejects record with missing source_url');
    assert(res2.errors.some((e) => e.includes('source_url')), 'Reports missing source_url error');

    // Invalid negative income
    const negativeIncome = {
      scheme_name: 'Invalid Negative Income Scheme',
      department: 'Ministry of Labour',
      source_url: 'https://data.gov.in/test',
      max_income: -5000,
    };
    const res3 = validateSchemeRecord(negativeIncome, 4);
    assert(res3.valid === false, 'Rejects record with negative max_income');

    // Invalid criteria operator
    const invalidOp = {
      scheme_name: 'Invalid Operator Scheme',
      department: 'Department of Welfare',
      source_url: 'https://data.gov.in/test',
      criteria: [
        {
          profile_field: 'annual_income',
          operator: 'INVALID_OP',
          target_value: '100000',
        },
      ],
    };
    const res4 = validateSchemeRecord(invalidOp, 5);
    assert(res4.valid === false, 'Rejects record with invalid criteria operator');
  }

  // Test 3: Duplicate Detection & Field Diff Generation
  {
    console.log('\n>>> Test 3: Duplicate Detection and Field Diffs');
    // 1. Fetch an existing scheme to test against
    const existingRows = await query('SELECT * FROM welfare_schemes LIMIT 1');
    assert(existingRows.length > 0, 'Database contains existing schemes for duplicate testing');
    const existing = existingRows[0];

    // Duplicate test by composite name + state_coverage
    const dupRecords = [
      {
        scheme_name: existing.scheme_name,
        state_coverage: existing.state_coverage,
        department: existing.department + ' (Updated Directorate)',
        benefits_summary: 'Updated benefit structure of Rs 10,000 annually',
        max_income: 350000,
        source_url: 'https://data.gov.in/updated-scheme',
      },
    ];

    const dupResults = await detectDuplicates(dupRecords);
    assert(dupResults.length === 1, 'Correctly matched duplicate scheme');
    assert(dupResults[0].existing_id === existing.id, 'Matched correct existing scheme ID');
    assert(dupResults[0].diffs.length > 0, 'Generated field-level differences');

    const deptDiff = dupResults[0].diffs.find((d) => d.field === 'department');
    assert(deptDiff !== undefined, 'Detected department difference');
    assert(deptDiff.oldVal === existing.department, 'Old department value preserved in diff');

    const incomeDiff = dupResults[0].diffs.find((d) => d.field === 'max_income');
    assert(incomeDiff !== undefined, 'Detected max_income threshold difference');
  }

  // Test 4: Predefined Official Datasets Verification
  {
    console.log('\n>>> Test 4: Predefined Official Datasets Integrity');
    const centralData = getPredefinedDataset('central');
    assert(centralData.length >= 5, 'Central government dataset contains at least 5 verified schemes');
    const pmKisan = centralData.find((s) => s.source_id === 'GOI-AGRI-PMKISAN-2026');
    assert(pmKisan !== undefined, 'PM-KISAN is present in central dataset');
    assert(pmKisan.source_url.includes('pmkisan.gov.in'), 'PM-KISAN has verified official URL');
    assert(pmKisan.criteria.length > 0, 'PM-KISAN has structured eligibility criteria rules');

    const tnData = getPredefinedDataset('tamilnadu');
    assert(tnData.length >= 5, 'Tamil Nadu dataset contains at least 5 verified schemes');
    const kmut = tnData.find((s) => s.source_id && s.source_id.includes('KMUT'));
    assert(kmut !== undefined, 'KMUT is present in Tamil Nadu dataset');
    assert(kmut.state_coverage === 'Tamil Nadu', 'KMUT is properly scoped to Tamil Nadu');
  }

  // Test 5: Transactional ACID Rollback on Failure
  {
    console.log('\n>>> Test 5: Transactional ACID Rollback Guarantee');
    const beforeCountRows = await query('SELECT COUNT(*) as count FROM welfare_schemes');
    const countBefore = beforeCountRows[0].count;

    try {
      await withTransaction(async (conn) => {
        // 1. Insert a temporary scheme inside transaction
        await query(
          `INSERT INTO welfare_schemes (scheme_name, slug, description, category, department, state_coverage, source_url, last_verified_date)
           VALUES ('Temporary Rollback Test Scheme', 'temp-rollback-scheme', 'Test', 'Health & Healthcare', 'Dept of Health', 'All-India', 'https://test.gov.in', CURRENT_TIMESTAMP)`,
          [],
          conn
        );

        // 2. Deliberately throw an error mid-transaction to force ROLLBACK
        throw new Error('Forced transactional abort test');
      });
      assert(false, 'Should have thrown error and rolled back');
    } catch (err) {
      assert(err.message === 'Forced transactional abort test', 'Caught expected transaction abort error');
    }

    const afterCountRows = await query('SELECT COUNT(*) as count FROM welfare_schemes');
    const countAfter = afterCountRows[0].count;
    assert(countBefore === countAfter, 'ACID Rollback confirmed: No partial or dirty writes in database');
  }

  // Test 6: Batch Import Execution & Audit Logging
  {
    console.log('\n>>> Test 6: Batch Import Execution & Audit Logging');
    const importPayload = [
      {
        source_id: 'TEST-BATCH-IMPORT-001',
        scheme_name: 'Automated Test Dairy Promotion Scheme',
        slug: 'automated-test-dairy-promotion',
        description: 'Assistance for small-scale dairy farmers and cattle owners.',
        category: 'Agriculture & Farmers',
        department: 'Department of Animal Husbandry',
        state_coverage: 'Tamil Nadu',
        min_income: 0,
        max_income: 180000,
        min_age: 18,
        max_age: 65,
        eligible_occupations: ['Farmer', 'Daily Wage Worker', 'Self-Employed'],
        official_url: 'https://dahd.nic.in/test-dairy',
        source_url: 'https://data.gov.in/test-dairy-dataset',
        source_ref: 'Ministry of Fisheries, Animal Husbandry & Dairying',
        benefits_summary: '50% subsidy up to Rs 40,000 for purchasing milk cows',
        criteria: [
          {
            profile_field: 'annual_income',
            operator: '<=',
            target_value: '180000',
            is_mandatory: true,
            weight: 2.0,
            description: 'Annual family income under 1.8 Lakhs',
          },
          {
            profile_field: 'state',
            operator: '=',
            target_value: 'Tamil Nadu',
            is_mandatory: true,
            weight: 2.0,
            description: 'Resident of Tamil Nadu',
          },
        ],
        documents: [
          {
            document_name: 'Ration Card',
            is_mandatory: true,
            issuing_authority: 'Civil Supplies Dept',
          },
        ],
      },
    ];

    const result = await executeImport({
      records: importPayload,
      adminId: 1,
      sourceType: 'automated-test',
      updateDuplicates: true,
      defaultStatus: 'pending_verification',
    });

    assert(result.status === 'completed', 'Import batch completed successfully');
    assert(result.records_imported === 1 || result.records_updated === 1, 'Record successfully imported or updated');
    assert(result.batch_id !== undefined, 'Generated audit batch ID in scheme_import_logs');

    // Verify record in database
    const saved = await query(
      "SELECT * FROM welfare_schemes WHERE source_id = 'TEST-BATCH-IMPORT-001'"
    );
    assert(saved.length === 1, 'Imported scheme persisted with source_id');
    assert(saved[0].verification_status === 'pending_verification', 'Default status is pending_verification as mandated');
    assert(saved[0].benefits_summary.includes('50% subsidy'), 'Benefits summary persisted');

    // Verify audit log
    const logs = await getImportLogs();
    assert(logs.length > 0, 'Audit logs fetched successfully');
    const latestLog = logs[0];
    assert(latestLog.source_type === 'automated-test', 'Audit log records exact source_type');
  }

  // Test 7: Scheme Status Governance & Verification Workflow
  {
    console.log('\n>>> Test 7: Scheme Status Verification Workflow');
    const saved = await query(
      "SELECT id, verification_status FROM welfare_schemes WHERE source_id = 'TEST-BATCH-IMPORT-001'"
    );
    const schemeId = saved[0].id;

    // Admin verifies scheme
    const verified = await verifyScheme(schemeId, 'verified');
    assert(verified.verification_status === 'verified', 'Scheme updated to verified');
    assert(verified.last_verified_at !== null, 'Timestamp stamped on verification');

    // Admin flags outdated
    const outdated = await verifyScheme(schemeId, 'outdated');
    assert(outdated.verification_status === 'outdated', 'Scheme updated to outdated for review');
  }

  // Test 8: Compatibility with Core Eligibility Prediction Engine
  {
    console.log('\n>>> Test 8: Compatibility with Core Eligibility Prediction Engine');
    // Fetch newly imported scheme with its criteria
    const schemeRows = await query(
      "SELECT * FROM welfare_schemes WHERE source_id = 'TEST-BATCH-IMPORT-001'"
    );
    const critRows = await query(
      'SELECT * FROM eligibility_criteria WHERE scheme_id = ?',
      [schemeRows[0].id]
    );

    const testScheme = {
      ...schemeRows[0],
      is_active: 1,
      criteria: critRows,
    };

    // Citizen 1: Qualifying Tamil Nadu Farmer with 1.2 Lakh income
    const qualifyingCitizen = {
      annual_income: 120000,
      state: 'Tamil Nadu',
      age: 32,
      occupation: 'Farmer',
    };

    const evalResult1 = evaluateScheme(testScheme, qualifyingCitizen);
    assert(evalResult1.mandatory_satisfied === true, 'Qualifying citizen meets mandatory gates');
    assert(evalResult1.matching_score >= 80, 'Qualifying citizen gets high matching score');
    assert(evalResult1.result_category === RESULT_CATEGORIES.POTENTIALLY_ELIGIBLE, 'Qualifying citizen categorized as Potentially Eligible');

    // Citizen 2: Disqualified citizen from Kerala (wrong state)
    const nonQualifyingCitizen = {
      annual_income: 120000,
      state: 'Kerala',
      age: 32,
      occupation: 'Farmer',
    };

    const evalResult2 = evaluateScheme(testScheme, nonQualifyingCitizen);
    assert(evalResult2.mandatory_satisfied === false, 'Non-qualifying state fails mandatory gate');
    assert(evalResult2.result_category === RESULT_CATEGORIES.UNLIKELY_TO_QUALIFY, 'Non-qualifying citizen categorized as Unlikely to Qualify');
    assert(evalResult2.criteria_unmet.length > 0, 'Unmet state criteria recorded in failure explanation');
  }

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} GOVERNMENT IMPORT MODULE TESTS PASSED!`);
  console.log('====================================================\n');
}

runImportTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  });
