import { query } from '../config/db.js';

/**
 * Get all schemes saved/bookmarked by the user
 */
export async function getSavedSchemes(userId) {
  const sql = `
    SELECT ss.id as saved_id, ss.saved_at, ss.notes, ws.* 
    FROM saved_schemes ss
    JOIN welfare_schemes ws ON ss.scheme_id = ws.id
    WHERE ss.user_id = ?
    ORDER BY ss.saved_at DESC
  `;
  const schemes = await query(sql, [userId]);

  for (const s of schemes) {
    const docs = await query('SELECT * FROM scheme_documents WHERE scheme_id = ?', [s.id]);
    s.documents = docs || [];
  }

  return schemes;
}

/**
 * Save / bookmark a welfare scheme
 */
export async function saveScheme(userId, schemeId, notes = null) {
  // Check if scheme exists
  const schemeExists = await query('SELECT id FROM welfare_schemes WHERE id = ?', [schemeId]);
  if (!schemeExists || schemeExists.length === 0) {
    const error = new Error('Welfare scheme not found.');
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  // Insert or update bookmark
  try {
    const res = await query(
      'INSERT INTO saved_schemes (user_id, scheme_id, notes) VALUES (?, ?, ?)',
      [userId, schemeId, notes]
    );
    return { success: true, saved_id: res.insertId, scheme_id: schemeId };
  } catch (err) {
    // If already saved, update notes
    await query(
      'UPDATE saved_schemes SET notes = ?, saved_at = CURRENT_TIMESTAMP WHERE user_id = ? AND scheme_id = ?',
      [notes, userId, schemeId]
    );
    return { success: true, scheme_id: schemeId, updated: true };
  }
}

/**
 * Remove a saved / bookmarked scheme
 */
export async function removeSavedScheme(userId, schemeId) {
  await query('DELETE FROM saved_schemes WHERE user_id = ? AND scheme_id = ?', [userId, schemeId]);
  return { success: true, removed_scheme_id: schemeId };
}

export default {
  getSavedSchemes,
  saveScheme,
  removeSavedScheme,
};
