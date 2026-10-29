/**
 * ============================================================================
 * Unit Tests: Core Eligibility Prediction Engine
 * Tests for income thresholds, age boundaries, mandatory criteria gating,
 * missing information, geographic restrictions, inactive schemes, and ranking.
 * ============================================================================
 */

import {
  evaluateCriterion,
  evaluateScheme,
  evaluateAllSchemes,
  RESULT_CATEGORIES,
} from '../src/services/eligibilityEngine.js';

let passedTests = 0;
let totalTests = 0;

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

console.log('--- STARTING ELIGIBILITY ENGINE UNIT TESTS ---');

// Test 1: Income Threshold Boundary Tests
{
  const crit = {
    profile_field: 'annual_income',
    operator: '<=',
    target_value: '250000',
    is_mandatory: true,
    weight: 2.0,
    failure_reason: 'Income exceeds 2.5L limit',
  };

  const resBelow = evaluateCriterion(crit, 200000);
  assert(resBelow.matchValue === 1.0, 'Income below limit is satisfied (1.0)');

  const resEqual = evaluateCriterion(crit, 250000);
  assert(resEqual.matchValue === 1.0, 'Income equal to limit is satisfied (1.0)');

  const resAbove = evaluateCriterion(crit, 260000);
  assert(resAbove.matchValue === 0.0, 'Income above limit is unsatisfied (0.0)');

  // Optional criterion partial match (within 5%)
  const optCrit = { ...crit, is_mandatory: false };
  const resBorderline = evaluateCriterion(optCrit, 255000);
  assert(resBorderline.matchValue === 0.5, 'Optional income within 5% buffer receives partial match (0.5)');
}

// Test 2: Age Boundaries & Between Operator
{
  const betweenCrit = {
    profile_field: 'age',
    operator: 'between',
    target_value: '[18, 60]',
    is_mandatory: true,
    weight: 1.5,
  };

  assert(evaluateCriterion(betweenCrit, 18).matchValue === 1.0, 'Age at lower boundary (18) matches');
  assert(evaluateCriterion(betweenCrit, 60).matchValue === 1.0, 'Age at upper boundary (60) matches');
  assert(evaluateCriterion(betweenCrit, 35).matchValue === 1.0, 'Age inside range (35) matches');
  assert(evaluateCriterion(betweenCrit, 17).matchValue === 0.0, 'Age below minimum (17) fails');
  assert(evaluateCriterion(betweenCrit, 61).matchValue === 0.0, 'Age above maximum (61) fails');
}

// Test 3: Array Inclusion ('in' and 'not_in')
{
  const inCrit = {
    profile_field: 'occupation',
    operator: 'in',
    target_value: '["Farmer", "Agricultural Worker"]',
    is_mandatory: true,
  };

  assert(evaluateCriterion(inCrit, 'Farmer').matchValue === 1.0, 'Exact occupation in array matches');
  assert(evaluateCriterion(inCrit, 'farmer').matchValue === 1.0, 'Case-insensitive occupation in array matches');
  assert(evaluateCriterion(inCrit, 'Software Engineer').matchValue === 0.0, 'Occupation not in array fails');
}

// Test 4: Missing Profile Values (Unknown)
{
  const crit = {
    profile_field: 'disability_percentage',
    operator: '>=',
    target_value: '40',
    is_mandatory: true,
  };

  const resNull = evaluateCriterion(crit, null);
  assert(resNull.isUnknown === true && resNull.matchValue === null, 'Null value identified as Unknown');

  const resUndefined = evaluateCriterion(crit, undefined);
  assert(resUndefined.isUnknown === true && resUndefined.matchValue === null, 'Undefined value identified as Unknown');
}

// Test 5: Mandatory Condition Gating (High score must NOT override failed mandatory)
{
  const mockScheme = {
    id: 101,
    scheme_name: 'Strict Farmer Grant',
    slug: 'strict-farmer-grant',
    is_active: true,
    state_coverage: 'All-India',
    criteria: [
      {
        id: 1,
        profile_field: 'occupation',
        operator: 'in',
        target_value: '["Farmer"]',
        is_mandatory: true, // MANDATORY
        weight: 1.0,
        failure_reason: 'Must be a farmer',
      },
      {
        id: 2,
        profile_field: 'annual_income',
        operator: '<=',
        target_value: '500000',
        is_mandatory: false,
        weight: 10.0, // VERY HIGH WEIGHT!
      },
    ],
    documents: [],
  };

  // Profile is NOT a farmer, but has low income (would get 10/11 = 90.9% score)
  const profile = {
    occupation: 'Teacher',
    annual_income: 150000,
  };

  const evalRes = evaluateScheme(mockScheme, profile);
  assert(
    evalRes.result_category === RESULT_CATEGORIES.UNLIKELY_TO_QUALIFY,
    'Failing mandatory criterion forces category to "Unlikely to Qualify" even if score is high'
  );
  assert(evalRes.mandatory_satisfied === false, 'mandatory_satisfied flag is false');
}

// Test 6: Geographic Restriction Tests
{
  const stateScheme = {
    id: 102,
    scheme_name: 'Tamil Nadu Rural Subsidy',
    slug: 'tn-subsidy',
    is_active: true,
    state_coverage: 'Tamil Nadu',
    criteria: [],
    documents: [],
  };

  const tnCitizen = { state: 'Tamil Nadu' };
  const upCitizen = { state: 'Uttar Pradesh' };
  const unknownStateCitizen = { state: '' };

  assert(
    evaluateScheme(stateScheme, tnCitizen).result_category === RESULT_CATEGORIES.POTENTIALLY_ELIGIBLE,
    'Matching state resident qualifies for state-specific scheme'
  );
  assert(
    evaluateScheme(stateScheme, upCitizen).result_category === RESULT_CATEGORIES.UNLIKELY_TO_QUALIFY,
    'Out-of-state resident fails state-specific scheme'
  );
  assert(
    evaluateScheme(stateScheme, unknownStateCitizen).result_category === RESULT_CATEGORIES.NEEDS_MORE_INFO,
    'Missing state leads to "Needs More Information"'
  );
}

// Test 7: Inactive Scheme Exclusion
{
  const inactiveScheme = {
    id: 103,
    scheme_name: 'Archived Welfare Scheme',
    slug: 'archived-scheme',
    is_active: false,
    criteria: [],
    documents: [],
  };

  const evalRes = evaluateScheme(inactiveScheme, { age: 30 });
  assert(
    evalRes.result_category === RESULT_CATEGORIES.NOT_EVALUATED,
    'Inactive scheme is categorized as "Not Evaluated"'
  );
}

// Test 8: Multiple Scheme Evaluation & Ranking
{
  const schemes = [
    {
      id: 1,
      scheme_name: 'Scheme A (Unlikely)',
      slug: 'scheme-a',
      is_active: true,
      state_coverage: 'All-India',
      criteria: [
        { profile_field: 'age', operator: '>=', target_value: '60', is_mandatory: true, weight: 1.0 },
      ],
    },
    {
      id: 2,
      scheme_name: 'Scheme B (High Potential Match)',
      slug: 'scheme-b',
      is_active: true,
      state_coverage: 'All-India',
      criteria: [
        { profile_field: 'annual_income', operator: '<=', target_value: '200000', is_mandatory: true, weight: 2.0 },
        { profile_field: 'area_type', operator: '==', target_value: 'rural', is_mandatory: false, weight: 1.0 },
      ],
    },
    {
      id: 3,
      scheme_name: 'Scheme C (Needs Info)',
      slug: 'scheme-c',
      is_active: true,
      state_coverage: 'All-India',
      criteria: [
        { profile_field: 'disability_percentage', operator: '>=', target_value: '40', is_mandatory: true, weight: 1.0 },
      ],
    },
  ];

  const profile = {
    age: 28, // fails Scheme A
    annual_income: 120000, // passes Scheme B
    area_type: 'rural', // passes Scheme B
    // disability_percentage missing -> Scheme C needs info
  };

  const results = evaluateAllSchemes(schemes, profile);
  assert(results.total_evaluated === 3, 'Evaluated all 3 schemes');
  assert(results.potential_matches === 1, '1 potential match identified');
  assert(results.needs_more_info === 1, '1 scheme needing info identified');
  assert(results.unlikely_to_qualify === 1, '1 unlikely scheme identified');
  assert(
    results.recommendations[0].scheme_name === 'Scheme B (High Potential Match)',
    'Top ranked scheme is the Potentially Eligible match'
  );
}

console.log(`\n========================================`);
console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions`);
console.log(`========================================\n`);
