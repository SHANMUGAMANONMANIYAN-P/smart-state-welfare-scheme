import { query } from '../config/db.js';
import { evaluateAllSchemes } from './eligibilityEngine.js';
import { getProfileByUserId } from './profileService.js';
import { getAllSchemes, getSchemeById } from './schemeService.js';

/**
 * Executes full eligibility prediction evaluation for a citizen profile
 * and persists the assessment history in the database.
 */
export async function evaluateCitizenProfile(userId) {
  // 1. Retrieve citizen profile
  const profile = await getProfileByUserId(userId);
  if (!profile) {
    const error = new Error('Please complete your citizen profile before running eligibility evaluation.');
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  // 2. Retrieve all active welfare schemes with full criteria and documents
  const activeSchemesBasic = await getAllSchemes({ activeOnly: true });
  const fullSchemes = [];
  for (const s of activeSchemesBasic) {
    const full = await getSchemeById(s.id);
    if (full) {
      fullSchemes.push(full);
    }
  }

  // 3. Run eligibility prediction engine
  const evaluationResult = evaluateAllSchemes(fullSchemes, profile);

  // 4. Persist assessment record in eligibility_assessments table
  const insertAssessment = await query(
    `INSERT INTO eligibility_assessments 
     (user_id, total_schemes_evaluated, eligible_count, needs_info_count, unlikely_count)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      evaluationResult.total_evaluated,
      evaluationResult.potential_matches,
      evaluationResult.needs_more_info,
      evaluationResult.unlikely_to_qualify,
    ]
  );

  const assessmentId = insertAssessment.insertId;

  // 5. Persist per-scheme granular assessment details
  for (const rec of evaluationResult.recommendations) {
    await query(
      `INSERT INTO assessment_details 
       (assessment_id, scheme_id, matching_score, result_category, mandatory_satisfied, satisfied_criteria, unmet_criteria, missing_fields, explanation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assessmentId,
        rec.scheme_id,
        rec.matching_score,
        rec.result_category,
        rec.mandatory_satisfied ? 1 : 0,
        JSON.stringify(rec.criteria_satisfied || []),
        JSON.stringify(rec.criteria_unmet || []),
        JSON.stringify(rec.missing_profile_information || []),
        rec.explanation,
      ]
    );
  }

  return {
    assessment_id: assessmentId,
    evaluated_at: new Date().toISOString(),
    profile_summary: {
      full_name: profile.full_name,
      state: profile.state,
      occupation: profile.occupation,
      annual_income: profile.annual_income,
      age: profile.age,
    },
    ...evaluationResult,
  };
}

/**
 * Get assessment history for the authenticated user
 */
export async function getAssessmentHistory(userId) {
  const sql = `
    SELECT * FROM eligibility_assessments 
    WHERE user_id = ? 
    ORDER BY evaluated_at DESC 
    LIMIT 20
  `;
  return await query(sql, [userId]);
}

/**
 * Get detailed breakdown of a specific historical assessment
 */
export async function getAssessmentDetail(assessmentId, userId) {
  const assessmentRows = await query(
    'SELECT * FROM eligibility_assessments WHERE id = ? AND user_id = ?',
    [assessmentId, userId]
  );

  if (!assessmentRows || assessmentRows.length === 0) {
    const error = new Error('Assessment record not found.');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  const assessment = assessmentRows[0];

  const detailRows = await query(
    `SELECT ad.*, ws.scheme_name, ws.category, ws.department, ws.official_url
     FROM assessment_details ad
     JOIN welfare_schemes ws ON ad.scheme_id = ws.id
     WHERE ad.assessment_id = ?
     ORDER BY ad.matching_score DESC`,
    [assessmentId]
  );

  const parsedDetails = detailRows.map((d) => ({
    ...d,
    satisfied_criteria: typeof d.satisfied_criteria === 'string' ? JSON.parse(d.satisfied_criteria) : d.satisfied_criteria,
    unmet_criteria: typeof d.unmet_criteria === 'string' ? JSON.parse(d.unmet_criteria) : d.unmet_criteria,
    missing_fields: typeof d.missing_fields === 'string' ? JSON.parse(d.missing_fields) : d.missing_fields,
  }));

  return {
    assessment,
    details: parsedDetails,
  };
}

export default {
  evaluateCitizenProfile,
  getAssessmentHistory,
  getAssessmentDetail,
};
