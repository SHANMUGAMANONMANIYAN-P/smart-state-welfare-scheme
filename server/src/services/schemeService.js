import { query } from '../config/db.js';

/**
 * Get all welfare schemes with optional search, category, and state filters
 */
export async function getAllSchemes({ category, state, activeOnly = true, search } = {}) {
  let sql = 'SELECT * FROM welfare_schemes WHERE 1=1';
  const params = [];

  if (activeOnly) {
    sql += ' AND is_active = 1';
  }

  if (category && category !== 'All') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (state && state !== 'All') {
    sql += ' AND (state_coverage = ? OR state_coverage = "All-India")';
    params.push(state);
  }

  if (search && search.trim()) {
    sql += ' AND (scheme_name LIKE ? OR description LIKE ? OR department LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY id DESC';

  const schemes = await query(sql, params);

  // Attach criteria count and documents count
  for (const s of schemes) {
    const critRows = await query('SELECT COUNT(*) as count FROM eligibility_criteria WHERE scheme_id = ?', [s.id]);
    const docRows = await query('SELECT COUNT(*) as count FROM scheme_documents WHERE scheme_id = ?', [s.id]);
    s.criteria_count = critRows[0]?.count || 0;
    s.documents_count = docRows[0]?.count || 0;

    // Parse JSON occupations if stored as string
    if (typeof s.eligible_occupations === 'string') {
      try {
        s.eligible_occupations = JSON.parse(s.eligible_occupations);
      } catch {
        s.eligible_occupations = [s.eligible_occupations];
      }
    }
  }

  return schemes;
}

/**
 * Get scheme by ID with full criteria and document checklist
 */
export async function getSchemeById(id) {
  const schemes = await query('SELECT * FROM welfare_schemes WHERE id = ?', [id]);
  if (!schemes || schemes.length === 0) {
    return null;
  }

  const scheme = schemes[0];

  // Fetch criteria
  const criteria = await query(
    'SELECT * FROM eligibility_criteria WHERE scheme_id = ? ORDER BY is_mandatory DESC, weight DESC',
    [id]
  );

  // Fetch documents
  const documents = await query(
    'SELECT * FROM scheme_documents WHERE scheme_id = ? ORDER BY is_mandatory DESC',
    [id]
  );

  if (typeof scheme.eligible_occupations === 'string') {
    try {
      scheme.eligible_occupations = JSON.parse(scheme.eligible_occupations);
    } catch {
      scheme.eligible_occupations = [scheme.eligible_occupations];
    }
  }

  return {
    ...scheme,
    criteria: criteria || [],
    documents: documents || [],
  };
}

/**
 * Create a new welfare scheme (Admin only)
 */
export async function createScheme(data) {
  const slug = (data.scheme_name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

  const occupationsJson = Array.isArray(data.eligible_occupations)
    ? JSON.stringify(data.eligible_occupations)
    : (data.eligible_occupations || '["All"]');

  const res = await query(
    `INSERT INTO welfare_schemes 
     (scheme_name, slug, description, category, department, state_coverage, min_age, max_age, min_income, max_income, eligible_occupations, official_url, is_active, source_ref, last_verified_date, is_demonstration)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.scheme_name,
      slug,
      data.description,
      data.category,
      data.department,
      data.state_coverage || 'All-India',
      data.min_age !== undefined ? Number(data.min_age) : null,
      data.max_age !== undefined ? Number(data.max_age) : null,
      data.min_income !== undefined ? Number(data.min_income) : null,
      data.max_income !== undefined ? Number(data.max_income) : null,
      occupationsJson,
      data.official_url || null,
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      data.source_ref || 'Official Department Portal',
      data.last_verified_date || new Date().toISOString().split('T')[0],
      data.is_demonstration ? 1 : 0,
    ]
  );

  return await getSchemeById(res.insertId);
}

/**
 * Update an existing welfare scheme (Admin only)
 */
export async function updateScheme(id, data) {
  const occupationsJson = Array.isArray(data.eligible_occupations)
    ? JSON.stringify(data.eligible_occupations)
    : (data.eligible_occupations || '["All"]');

  await query(
    `UPDATE welfare_schemes SET
      scheme_name = ?,
      description = ?,
      category = ?,
      department = ?,
      state_coverage = ?,
      min_age = ?,
      max_age = ?,
      min_income = ?,
      max_income = ?,
      eligible_occupations = ?,
      official_url = ?,
      is_active = ?,
      source_ref = ?,
      last_verified_date = ?,
      is_demonstration = ?,
      updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      data.scheme_name,
      data.description,
      data.category,
      data.department,
      data.state_coverage || 'All-India',
      data.min_age !== undefined && data.min_age !== '' ? Number(data.min_age) : null,
      data.max_age !== undefined && data.max_age !== '' ? Number(data.max_age) : null,
      data.min_income !== undefined && data.min_income !== '' ? Number(data.min_income) : null,
      data.max_income !== undefined && data.max_income !== '' ? Number(data.max_income) : null,
      occupationsJson,
      data.official_url || null,
      data.is_active ? 1 : 0,
      data.source_ref || 'Official Department Portal',
      data.last_verified_date || new Date().toISOString().split('T')[0],
      data.is_demonstration ? 1 : 0,
      id,
    ]
  );

  return await getSchemeById(id);
}

/**
 * Toggle active/inactive status (Admin only)
 */
export async function toggleSchemeStatus(id, isActive) {
  await query('UPDATE welfare_schemes SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
    isActive ? 1 : 0,
    id,
  ]);
  return await getSchemeById(id);
}

/**
 * Delete a welfare scheme (Admin only)
 */
export async function deleteScheme(id) {
  await query('DELETE FROM welfare_schemes WHERE id = ?', [id]);
  return { success: true };
}

/**
 * Add eligibility criteria rule to a scheme (Admin only)
 */
export async function addCriteria(schemeId, crit) {
  const res = await query(
    `INSERT INTO eligibility_criteria 
     (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      schemeId,
      crit.criterion_type || 'custom',
      crit.profile_field,
      crit.operator || '==',
      crit.target_value,
      crit.is_mandatory ? 1 : 0,
      Number(crit.weight) || 1.0,
      crit.description,
      crit.failure_reason || 'Criterion condition not satisfied',
    ]
  );
  return { id: res.insertId, ...crit };
}

/**
 * Delete eligibility criteria rule (Admin only)
 */
export async function deleteCriteria(criteriaId) {
  await query('DELETE FROM eligibility_criteria WHERE id = ?', [criteriaId]);
  return { success: true };
}

/**
 * Add document checklist item to a scheme (Admin only)
 */
export async function addDocument(schemeId, doc) {
  const res = await query(
    `INSERT INTO scheme_documents 
     (scheme_id, document_name, description, is_mandatory, issuing_authority)
     VALUES (?, ?, ?, ?, ?)`,
    [
      schemeId,
      doc.document_name,
      doc.description || null,
      doc.is_mandatory ? 1 : 0,
      doc.issuing_authority || null,
    ]
  );
  return { id: res.insertId, ...doc };
}

/**
 * Delete document checklist item (Admin only)
 */
export async function deleteDocument(docId) {
  await query('DELETE FROM scheme_documents WHERE id = ?', [docId]);
  return { success: true };
}

export default {
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
};
