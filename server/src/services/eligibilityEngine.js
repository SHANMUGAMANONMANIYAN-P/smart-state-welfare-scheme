/**
 * ============================================================================
 * Smart Welfare Scheme Eligibility Prediction Engine
 * Core Rule-Based Matching Service
 * 
 * Transparent, explainable, weighted scoring with mandatory criteria gating.
 * ============================================================================
 */

export const RESULT_CATEGORIES = {
  POTENTIALLY_ELIGIBLE: 'Potentially Eligible',
  NEEDS_MORE_INFO: 'Needs More Information',
  UNLIKELY_TO_QUALIFY: 'Unlikely to Qualify',
  NOT_EVALUATED: 'Not Evaluated',
};

export const ELIGIBILITY_DISCLAIMER =
  'This evaluation is an automated guidance indicator only. Final eligibility and benefit disbursement depend solely on physical document verification and approval by the respective government department.';

/**
 * Normalizes input value for robust comparison
 */
function normalizeValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    if (!isNaN(trimmed) && trimmed !== '') return Number(trimmed);
    return trimmed;
  }
  return val;
}

/**
 * Parse target value safely (e.g. JSON array, number, boolean, string)
 */
function parseTargetValue(rawTarget) {
  if (typeof rawTarget !== 'string') return rawTarget;
  const trimmed = rawTarget.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
    }
  }
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;
  if (!isNaN(trimmed) && trimmed !== '') return Number(trimmed);
  return trimmed;
}

/**
 * Evaluates a single criterion against a citizen profile value
 * Returns { matchValue: 0.0 | 0.5 | 1.0 | null, isUnknown: boolean, note: string }
 */
export function evaluateCriterion(criterion, citizenValue) {
  const normalizedCitizen = normalizeValue(citizenValue);

  // If citizen profile field is missing/unknown
  if (normalizedCitizen === null || normalizedCitizen === undefined || normalizedCitizen === '') {
    return {
      matchValue: null,
      isUnknown: true,
      note: `Information not provided in profile (${criterion.profile_field})`,
    };
  }

  const operator = (criterion.operator || '==').trim();
  const target = parseTargetValue(criterion.target_value);

  // 1. Array inclusion operators ('in', 'not_in')
  if (operator === 'in' || operator === 'not_in') {
    const list = Array.isArray(target) ? target : [target];
    const normalizedList = list.map((item) =>
      typeof item === 'string' ? item.trim().toLowerCase() : item
    );
    const citizenString = typeof normalizedCitizen === 'string'
      ? normalizedCitizen.trim().toLowerCase()
      : normalizedCitizen;

    const contains = normalizedList.includes(citizenString);
    const matches = operator === 'in' ? contains : !contains;

    return {
      matchValue: matches ? 1.0 : 0.0,
      isUnknown: false,
      note: matches
        ? `Matched allowable category: ${citizenValue}`
        : criterion.failure_reason || `Value "${citizenValue}" is not in approved list`,
    };
  }

  // 2. Between operator: target is [min, max]
  if (operator === 'between') {
    if (Array.isArray(target) && target.length === 2) {
      const [min, max] = target.map(Number);
      const val = Number(normalizedCitizen);
      if (!isNaN(val)) {
        const matches = val >= min && val <= max;
        return {
          matchValue: matches ? 1.0 : 0.0,
          isUnknown: false,
          note: matches
            ? `Within eligible range (${min} - ${max})`
            : criterion.failure_reason || `Value ${val} outside required range (${min} - ${max})`,
        };
      }
    }
  }

  // 3. Numeric comparison operators
  if (['<=', '>=', '<', '>', '==', '!='].includes(operator)) {
    const numCitizen = Number(normalizedCitizen);
    const numTarget = Number(target);

    if (!isNaN(numCitizen) && !isNaN(numTarget)) {
      let matches = false;
      switch (operator) {
        case '<=': matches = numCitizen <= numTarget; break;
        case '>=': matches = numCitizen >= numTarget; break;
        case '<': matches = numCitizen < numTarget; break;
        case '>': matches = numCitizen > numTarget; break;
        case '==': matches = numCitizen === numTarget; break;
        case '!=': matches = numCitizen !== numTarget; break;
      }

      // Check partial match for non-mandatory criteria within 5% marginal threshold
      if (!matches && !criterion.is_mandatory) {
        if (operator === '<=' && numCitizen <= numTarget * 1.05) {
          return {
            matchValue: 0.5,
            isUnknown: false,
            note: `Within 5% marginal range of ${numTarget}`,
          };
        }
        if (operator === '>=' && numCitizen >= numTarget * 0.95) {
          return {
            matchValue: 0.5,
            isUnknown: false,
            note: `Within 5% marginal range of ${numTarget}`,
          };
        }
      }

      return {
        matchValue: matches ? 1.0 : 0.0,
        isUnknown: false,
        note: matches
          ? `Satisfies condition (${operator} ${numTarget})`
          : criterion.failure_reason || `Did not satisfy condition (${numCitizen} ${operator} ${numTarget})`,
      };
    }
  }

  // 4. String / Boolean equality
  const strCitizen = String(normalizedCitizen).trim().toLowerCase();
  const strTarget = String(target).trim().toLowerCase();

  const isEq = strCitizen === strTarget;
  const matches = operator === '!=' ? !isEq : isEq;

  return {
    matchValue: matches ? 1.0 : 0.0,
    isUnknown: false,
    note: matches
      ? `Matches requirement: ${target}`
      : criterion.failure_reason || `Profile value "${citizenValue}" differs from required "${target}"`,
  };
}

/**
 * Evaluates a citizen profile against a single scheme
 */
export function evaluateScheme(scheme, profile) {
  // If scheme is inactive
  if (!scheme.is_active) {
    return {
      scheme_id: scheme.id,
      scheme_name: scheme.scheme_name,
      slug: scheme.slug,
      category: scheme.category,
      department: scheme.department,
      state_coverage: scheme.state_coverage,
      official_url: scheme.official_url,
      last_verified_date: scheme.last_verified_date,
      is_demonstration: Boolean(scheme.is_demonstration),
      matching_score: 0.0,
      result_category: RESULT_CATEGORIES.NOT_EVALUATED,
      mandatory_satisfied: false,
      criteria_satisfied: [],
      criteria_unmet: [],
      missing_profile_information: [],
      required_documents: scheme.documents || [],
      explanation: 'Scheme is currently marked inactive by the department and was not evaluated.',
      disclaimer: ELIGIBILITY_DISCLAIMER,
    };
  }

  const criteria = scheme.criteria || [];
  const satisfiedCriteria = [];
  const unmetCriteria = [];
  const missingFields = new Set();

  let mandatoryFailed = false;
  let mandatoryMissing = false;
  let totalApplicableWeight = 0;
  let totalWeightedScore = 0;

  // Geographic check on scheme state_coverage
  const coverage = (scheme.state_coverage || 'All-India').trim();
  if (coverage !== 'All-India' && coverage !== 'National') {
    const citizenState = (profile.state || '').trim();
    if (!citizenState) {
      missingFields.add('state');
      mandatoryMissing = true;
    } else if (coverage.toLowerCase() !== citizenState.toLowerCase()) {
      mandatoryFailed = true;
      unmetCriteria.push({
        id: 'geo_coverage',
        criterion_type: 'state',
        description: `State coverage: Only residents of ${coverage} are eligible`,
        failure_reason: `Citizen resides in ${citizenState}, but scheme is restricted to ${coverage}`,
        is_mandatory: true,
        weight: 3.0,
        citizen_value: citizenState,
        required_value: coverage,
      });
      totalApplicableWeight += 3.0;
    } else {
      satisfiedCriteria.push({
        id: 'geo_coverage',
        criterion_type: 'state',
        description: `State coverage: Resides in eligible jurisdiction (${coverage})`,
        matched_value: citizenState,
        is_mandatory: true,
        weight: 3.0,
      });
      totalApplicableWeight += 3.0;
      totalWeightedScore += 3.0 * 1.0;
    }
  }

  // Iterate over scheme eligibility criteria
  for (const crit of criteria) {
    const citizenVal = profile[crit.profile_field];
    const weight = parseFloat(crit.weight) || 1.0;
    const isMandatory = Boolean(crit.is_mandatory);

    const evalResult = evaluateCriterion(crit, citizenVal);

    if (evalResult.isUnknown) {
      missingFields.add(crit.profile_field);
      if (isMandatory) {
        mandatoryMissing = true;
      }
      continue;
    }

    totalApplicableWeight += weight;
    totalWeightedScore += weight * (evalResult.matchValue || 0.0);

    if (evalResult.matchValue === 1.0 || evalResult.matchValue === 0.5) {
      satisfiedCriteria.push({
        id: crit.id,
        criterion_type: crit.criterion_type,
        profile_field: crit.profile_field,
        description: crit.description,
        matched_value: citizenVal,
        match_value: evalResult.matchValue,
        weight,
        is_mandatory: isMandatory,
        note: evalResult.note,
      });
    } else {
      if (isMandatory) {
        mandatoryFailed = true;
      }
      unmetCriteria.push({
        id: crit.id,
        criterion_type: crit.criterion_type,
        profile_field: crit.profile_field,
        description: crit.description,
        failure_reason: evalResult.note || crit.failure_reason,
        citizen_value: citizenVal,
        required_value: crit.target_value,
        weight,
        is_mandatory: isMandatory,
      });
    }
  }

  // Calculate Matching Score = (Sum of weight * match / Sum of weights) * 100
  let matchingScore = 0.0;
  if (totalApplicableWeight > 0) {
    matchingScore = Math.round((totalWeightedScore / totalApplicableWeight) * 1000) / 10;
  }

  // Mandatory status
  const mandatorySatisfied = !mandatoryFailed && !mandatoryMissing;

  // Classify Result Category
  let resultCategory = RESULT_CATEGORIES.UNLIKELY_TO_QUALIFY;

  if (mandatoryFailed) {
    resultCategory = RESULT_CATEGORIES.UNLIKELY_TO_QUALIFY;
  } else if (mandatoryMissing || missingFields.size > 0) {
    resultCategory = RESULT_CATEGORIES.NEEDS_MORE_INFO;
  } else if (mandatorySatisfied && matchingScore >= 70.0) {
    resultCategory = RESULT_CATEGORIES.POTENTIALLY_ELIGIBLE;
  } else if (matchingScore >= 50.0 && !mandatoryFailed) {
    resultCategory = RESULT_CATEGORIES.POTENTIALLY_ELIGIBLE;
  } else {
    resultCategory = RESULT_CATEGORIES.UNLIKELY_TO_QUALIFY;
  }

  // Generate transparent human-readable explanation
  let explanation = '';
  if (resultCategory === RESULT_CATEGORIES.POTENTIALLY_ELIGIBLE) {
    const keySatisfied = satisfiedCriteria
      .filter((c) => c.is_mandatory)
      .map((c) => c.description)
      .slice(0, 2)
      .join(' and ');
    explanation = `Your profile shows a strong potential match (score: ${matchingScore}%). You satisfy all mandatory eligibility criteria${keySatisfied ? `, including: ${keySatisfied}` : ''}. We recommend assembling the required documentation listed below.`;
  } else if (resultCategory === RESULT_CATEGORIES.NEEDS_MORE_INFO) {
    const fieldsList = Array.from(missingFields).join(', ');
    explanation = `Additional profile details are required to accurately evaluate this scheme. Missing information: [${fieldsList}]. Please update your profile to receive a definitive recommendation.`;
  } else {
    const keyFailed = unmetCriteria
      .filter((c) => c.is_mandatory)
      .map((c) => c.failure_reason)
      .slice(0, 2)
      .join('; ');
    explanation = `Based on your submitted details, you are unlikely to qualify for this scheme (matching score: ${matchingScore}%). Mandatory requirement unmet: ${keyFailed || 'Criteria threshold not satisfied'}.`;
  }

  return {
    scheme_id: scheme.id,
    scheme_name: scheme.scheme_name,
    slug: scheme.slug,
    category: scheme.category,
    department: scheme.department,
    state_coverage: scheme.state_coverage,
    official_url: scheme.official_url,
    last_verified_date: scheme.last_verified_date,
    is_demonstration: Boolean(scheme.is_demonstration),
    matching_score: matchingScore,
    result_category: resultCategory,
    mandatory_satisfied: mandatorySatisfied,
    criteria_satisfied: satisfiedCriteria,
    criteria_unmet: unmetCriteria,
    missing_profile_information: Array.from(missingFields),
    required_documents: scheme.documents || [],
    explanation,
    disclaimer: ELIGIBILITY_DISCLAIMER,
  };
}

/**
 * Evaluates multiple welfare schemes for a citizen profile and returns ranked results
 */
export function evaluateAllSchemes(schemes, profile) {
  if (!schemes || !Array.isArray(schemes)) {
    return {
      total_evaluated: 0,
      potential_matches: 0,
      needs_more_info: 0,
      unlikely_to_qualify: 0,
      recommendations: [],
    };
  }

  const results = schemes.map((scheme) => evaluateScheme(scheme, profile));

  // Rank recommendations:
  // 1. Result Category order: Potentially Eligible > Needs More Info > Unlikely to Qualify > Not Evaluated
  // 2. Matching score descending
  // 3. Alphabetical by scheme name
  const categoryOrder = {
    [RESULT_CATEGORIES.POTENTIALLY_ELIGIBLE]: 1,
    [RESULT_CATEGORIES.NEEDS_MORE_INFO]: 2,
    [RESULT_CATEGORIES.UNLIKELY_TO_QUALIFY]: 3,
    [RESULT_CATEGORIES.NOT_EVALUATED]: 4,
  };

  results.sort((a, b) => {
    const catDiff = categoryOrder[a.result_category] - categoryOrder[b.result_category];
    if (catDiff !== 0) return catDiff;
    const scoreDiff = b.matching_score - a.matching_score;
    if (scoreDiff !== 0) return scoreDiff;
    return a.scheme_name.localeCompare(b.scheme_name);
  });

  const potentialMatches = results.filter(
    (r) => r.result_category === RESULT_CATEGORIES.POTENTIALLY_ELIGIBLE
  ).length;
  const needsMoreInfo = results.filter(
    (r) => r.result_category === RESULT_CATEGORIES.NEEDS_MORE_INFO
  ).length;
  const unlikely = results.filter(
    (r) => r.result_category === RESULT_CATEGORIES.UNLIKELY_TO_QUALIFY
  ).length;

  return {
    total_evaluated: results.length,
    potential_matches: potentialMatches,
    needs_more_info: needsMoreInfo,
    unlikely_to_qualify: unlikely,
    recommendations: results,
  };
}

export default {
  RESULT_CATEGORIES,
  ELIGIBILITY_DISCLAIMER,
  evaluateCriterion,
  evaluateScheme,
  evaluateAllSchemes,
};
