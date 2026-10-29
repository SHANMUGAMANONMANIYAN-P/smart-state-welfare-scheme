import { query, getDbStatus } from '../config/db.js';

/**
 * Privacy-preserving aggregate application usage and scheme analytics
 */
export async function getAdminAnalytics() {
  const totalSchemesRes = await query('SELECT COUNT(*) as count FROM welfare_schemes');
  const activeSchemesRes = await query('SELECT COUNT(*) as count FROM welfare_schemes WHERE is_active = 1');
  const totalCriteriaRes = await query('SELECT COUNT(*) as count FROM eligibility_criteria');
  const totalDocsRes = await query('SELECT COUNT(*) as count FROM scheme_documents');
  const totalAssessmentsRes = await query('SELECT COUNT(*) as count FROM eligibility_assessments');
  const totalUsersRes = await query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['citizen']);

  const categoriesRes = await query(`
    SELECT category, COUNT(*) as count 
    FROM welfare_schemes 
    GROUP BY category 
    ORDER BY count DESC
  `);

  const assessmentsRecentRes = await query(`
    SELECT 
      SUM(eligible_count) as total_eligible,
      SUM(needs_info_count) as total_needs_info,
      SUM(unlikely_count) as total_unlikely
    FROM eligibility_assessments
  `);

  return {
    overview: {
      total_schemes: totalSchemesRes[0]?.count || 0,
      active_schemes: activeSchemesRes[0]?.count || 0,
      total_criteria: totalCriteriaRes[0]?.count || 0,
      total_documents: totalDocsRes[0]?.count || 0,
      total_assessments: totalAssessmentsRes[0]?.count || 0,
      total_registered_citizens: totalUsersRes[0]?.count || 0,
    },
    category_distribution: categoriesRes || [],
    aggregate_evaluation_outcomes: {
      total_eligible: assessmentsRecentRes[0]?.total_eligible || 0,
      total_needs_info: assessmentsRecentRes[0]?.total_needs_info || 0,
      total_unlikely: assessmentsRecentRes[0]?.total_unlikely || 0,
    },
    database_status: getDbStatus(),
  };
}

export default {
  getAdminAnalytics,
};
