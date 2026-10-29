import {
  getAllSchemes,
  getSchemeById,
  createScheme,
  updateScheme,
  toggleSchemeStatus,
  deleteScheme,
  addCriteria,
  deleteCriteria,
  addDocument,
  deleteDocument,
} from '../services/schemeService.js';
import { getAdminAnalytics } from '../services/analyticsService.js';

export async function getDashboardOverview(req, res, next) {
  try {
    const analytics = await getAdminAnalytics();
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    next(err);
  }
}

export async function listAllAdminSchemes(req, res, next) {
  try {
    const { category, state, search } = req.query;
    const schemes = await getAllSchemes({
      category,
      state,
      search,
      activeOnly: false, // Admin views both active and inactive
    });

    res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (err) {
    next(err);
  }
}

export async function createNewScheme(req, res, next) {
  try {
    if (!req.body.scheme_name || !req.body.description || !req.body.category || !req.body.department) {
      return res.status(400).json({
        success: false,
        message: 'Scheme name, description, category, and department are mandatory.',
      });
    }

    const created = await createScheme(req.body);
    res.status(201).json({
      success: true,
      message: 'Scheme created successfully.',
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateExistingScheme(req, res, next) {
  try {
    const updated = await updateScheme(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Scheme updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleStatus(req, res, next) {
  try {
    const { is_active } = req.body;
    const updated = await toggleSchemeStatus(req.params.id, is_active);
    res.status(200).json({
      success: true,
      message: `Scheme ${is_active ? 'activated' : 'deactivated'} successfully.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function removeScheme(req, res, next) {
  try {
    await deleteScheme(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Scheme deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function addSchemeCriteria(req, res, next) {
  try {
    const schemeId = req.params.id;
    const { profile_field, operator, target_value, description, is_mandatory, weight, criterion_type } = req.body;

    if (!profile_field || !operator || target_value === undefined || !description) {
      return res.status(400).json({
        success: false,
        message: 'profile_field, operator, target_value, and description are required.',
      });
    }

    const created = await addCriteria(schemeId, req.body);
    res.status(201).json({
      success: true,
      message: 'Criteria rule added to scheme.',
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

export async function removeSchemeCriteria(req, res, next) {
  try {
    await deleteCriteria(req.params.criteriaId);
    res.status(200).json({
      success: true,
      message: 'Criteria rule deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function addSchemeDocument(req, res, next) {
  try {
    const schemeId = req.params.id;
    if (!req.body.document_name) {
      return res.status(400).json({
        success: false,
        message: 'Document name is required.',
      });
    }

    const created = await addDocument(schemeId, req.body);
    res.status(201).json({
      success: true,
      message: 'Document requirement added to scheme.',
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

export async function removeSchemeDocument(req, res, next) {
  try {
    await deleteDocument(req.params.docId);
    res.status(200).json({
      success: true,
      message: 'Document requirement deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function getCitizenRecords(req, res, next) {
  try {
    const { query: dbQuery } = await import('../config/db.js');
    const citizens = await dbQuery(`
      SELECT 
        u.id, 
        u.email, 
        COALESCE(cp.full_name, 'Citizen User') as full_name, 
        COALESCE(cp.state, 'National') as state, 
        COALESCE(cp.district, 'General') as district, 
        COALESCE(cp.occupation, 'General') as occupation, 
        COALESCE(cp.area_type, 'urban') as area_type, 
        u.created_at,
        (SELECT COUNT(*) FROM eligibility_assessments ea WHERE ea.user_id = u.id) as evaluation_count,
        (SELECT MAX(evaluated_at) FROM eligibility_assessments ea WHERE ea.user_id = u.id) as last_evaluated_at
      FROM users u
      LEFT JOIN citizen_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'citizen'
      ORDER BY u.created_at DESC
    `);
    res.status(200).json({
      success: true,
      data: citizens || [],
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminReports(req, res, next) {
  try {
    const { query: dbQuery } = await import('../config/db.js');
    const reports = await dbQuery(`
      SELECT 
        s.id,
        s.scheme_name,
        s.category,
        s.department,
        s.is_active,
        (SELECT COUNT(*) FROM eligibility_criteria c WHERE c.scheme_id = s.id) as criteria_count,
        (SELECT COUNT(*) FROM scheme_documents d WHERE d.scheme_id = s.id) as documents_count,
        (SELECT COUNT(*) FROM saved_schemes ss WHERE ss.scheme_id = s.id) as bookmark_count,
        (SELECT COUNT(*) FROM assessment_details ad WHERE ad.scheme_id = s.id AND ad.result_category = 'Potentially Eligible') as matched_citizens_count
      FROM welfare_schemes s
      ORDER BY matched_citizens_count DESC
    `);
    res.status(200).json({
      success: true,
      data: reports || [],
    });
  } catch (err) {
    next(err);
  }
}

export default {
  getDashboardOverview,
  listAllAdminSchemes,
  createNewScheme,
  updateExistingScheme,
  toggleStatus,
  removeScheme,
  addSchemeCriteria,
  removeSchemeCriteria,
  addSchemeDocument,
  removeSchemeDocument,
  getCitizenRecords,
  getAdminReports,
};

