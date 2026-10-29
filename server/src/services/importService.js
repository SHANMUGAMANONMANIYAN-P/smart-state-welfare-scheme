import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, withTransaction } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Government Welfare Scheme Data Import Service
 * Enterprise-grade validation, duplicate detection, diff generation, and transactional imports.
 */

/**
 * Robust CSV Line Parser supporting quoted values and escaped quotes
 */
function parseCSV(text) {
  const lines = [];
  let row = [''];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push('');
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
        lines.push(row);
      }
      row = [''];
    } else {
      row[row.length - 1] += char;
    }
  }

  if (row.length > 1 || (row.length === 1 && row[0].trim() !== '')) {
    lines.push(row);
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.trim());
  const records = [];

  for (let r = 1; r < lines.length; r++) {
    const values = lines[r];
    const record = {};
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      const val = values[c] !== undefined ? values[c].trim() : '';
      record[header] = val;
    }
    records.push(record);
  }

  return records;
}

/**
 * Parse uploaded content (JSON or CSV)
 */
export function parseImportContent(rawContent, fileType = 'json') {
  if (!rawContent) {
    throw new Error('Import file is empty. Please provide valid CSV or JSON content.');
  }

  if (typeof rawContent === 'object') {
    return Array.isArray(rawContent) ? rawContent : [rawContent];
  }

  const cleanContent = rawContent.trim();
  if (!cleanContent) {
    throw new Error('Import file is empty. Please provide valid CSV or JSON content.');
  }

  if (fileType === 'csv' || (!cleanContent.startsWith('[') && !cleanContent.startsWith('{'))) {
    const records = parseCSV(cleanContent);
    return records.map((rec) => {
      // Parse nested JSON strings if present in CSV
      let criteria = [];
      let documents = [];
      let eligible_occupations = [];

      try {
        if (rec.criteria_json) criteria = JSON.parse(rec.criteria_json);
      } catch {
        criteria = [];
      }

      try {
        if (rec.documents_json) documents = JSON.parse(rec.documents_json);
      } catch {
        documents = [];
      }

      try {
        if (rec.eligible_occupations) {
          eligible_occupations = rec.eligible_occupations.startsWith('[')
            ? JSON.parse(rec.eligible_occupations)
            : rec.eligible_occupations.split(',').map((s) => s.trim());
        }
      } catch {
        eligible_occupations = [];
      }

      return {
        ...rec,
        min_age: rec.min_age !== '' && !isNaN(Number(rec.min_age)) ? Number(rec.min_age) : null,
        max_age: rec.max_age !== '' && !isNaN(Number(rec.max_age)) ? Number(rec.max_age) : null,
        min_income: rec.min_income !== '' && !isNaN(Number(rec.min_income)) ? Number(rec.min_income) : null,
        max_income: rec.max_income !== '' && !isNaN(Number(rec.max_income)) ? Number(rec.max_income) : null,
        eligible_occupations,
        criteria,
        documents,
      };
    });
  }

  try {
    const parsed = JSON.parse(cleanContent);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    throw new Error(`Invalid JSON format: ${err.message}`);
  }
}

/**
 * Validate a scheme record against schema & business integrity rules
 */
export function validateSchemeRecord(record, index = 0) {
  const errors = [];
  const rowNum = index + 1;

  if (!record.scheme_name || typeof record.scheme_name !== 'string' || record.scheme_name.trim().length < 3) {
    errors.push(`Row ${rowNum}: scheme_name (Scheme Name) is required (minimum 3 characters).`);
  }

  if (!record.department || typeof record.department !== 'string' || record.department.trim().length < 3) {
    errors.push(`Row ${rowNum}: Responsible department / ministry is required.`);
  }

  if (!record.category || typeof record.category !== 'string' || record.category.trim().length < 2) {
    errors.push(`Row ${rowNum}: Category is required.`);
  }

  const officialUrl = record.official_url || record.source_url;
  if (!officialUrl || !/^https?:\/\/.+/i.test(String(officialUrl).trim())) {
    errors.push(`Row ${rowNum}: A valid official portal URL (https://...) is required.`);
  }

  const sourceUrl = record.source_url || record.official_url;
  if (!sourceUrl || !/^https?:\/\/.+/i.test(String(sourceUrl).trim())) {
    errors.push(`Row ${rowNum}: A valid official source reference URL (source_url) is required.`);
  }

  if (record.min_age !== null && record.min_age !== undefined && Number(record.min_age) < 0) {
    errors.push(`Row ${rowNum}: Minimum age cannot be negative.`);
  }

  if (record.max_age !== null && record.max_age !== undefined && Number(record.max_age) < 0) {
    errors.push(`Row ${rowNum}: Maximum age cannot be negative.`);
  }

  if (record.min_age !== null && record.max_age !== null && Number(record.min_age) > Number(record.max_age)) {
    errors.push(`Row ${rowNum}: Minimum age (${record.min_age}) cannot exceed maximum age (${record.max_age}).`);
  }

  if (record.min_income !== null && record.min_income !== undefined && Number(record.min_income) < 0) {
    errors.push(`Row ${rowNum}: Minimum income cannot be negative.`);
  }

  if (record.max_income !== null && record.max_income !== undefined && Number(record.max_income) < 0) {
    errors.push(`Row ${rowNum}: Maximum income cannot be negative.`);
  }

  if (record.min_income !== null && record.max_income !== null && Number(record.min_income) > Number(record.max_income)) {
    errors.push(`Row ${rowNum}: Minimum income (${record.min_income}) cannot exceed maximum income (${record.max_income}).`);
  }

  // Validate Criteria rules
  const validOperators = ['<=', '>=', '<', '>', '==', '=', '!=', 'in', 'not_in', 'between'];
  const validCriterionTypes = [
    'age', 'income', 'state', 'occupation', 'employment_status', 'education_level',
    'family_size', 'housing_status', 'area_type', 'disability', 'student', 'gender',
    'social_category', 'custom'
  ];

  if (record.criteria && Array.isArray(record.criteria)) {
    record.criteria.forEach((crit, cIdx) => {
      const cNum = cIdx + 1;
      if (!crit.profile_field) {
        errors.push(`Row ${rowNum}, Criterion ${cNum}: profile_field is required.`);
      }
      if (!validOperators.includes(crit.operator)) {
        errors.push(`Row ${rowNum}, Criterion ${cNum}: Invalid operator '${crit.operator}'. Allowed: ${validOperators.join(', ')}`);
      }
      if (crit.target_value === undefined || crit.target_value === null || crit.target_value === '') {
        errors.push(`Row ${rowNum}, Criterion ${cNum}: target_value is required.`);
      }
    });
  }

  // Normalization
  const baseName = record.slug || record.scheme_name || `scheme-${Date.now()}-${index}`;
  const slug = String(baseName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const normalized = {
    ...record,
    scheme_name: record.scheme_name?.trim() || '',
    slug,
    department: record.department?.trim() || '',
    category: record.category?.trim() || '',
    state_coverage: record.state_coverage?.trim() || 'All-India',
    description: record.description?.trim() || record.scheme_name?.trim() || '',
    benefits_summary: record.benefits_summary?.trim() || record.benefits?.trim() || '',
    official_url: record.official_url?.trim() || '',
    source_ref: record.source_ref?.trim() || 'Official Government Portal',
    source_url: record.source_url?.trim() || record.official_url?.trim() || '',
    source_id: record.source_id?.trim() || `SCHEME-${Date.now()}-${index}`,
    last_verified_date: record.last_verified_date || new Date().toISOString().split('T')[0],
    is_active: record.is_active !== undefined ? Boolean(record.is_active) : true,
    verification_status: record.verification_status || 'pending_verification',
    is_demonstration: Boolean(record.is_demonstration),
    eligible_occupations: Array.isArray(record.eligible_occupations) ? record.eligible_occupations : [],
    criteria: Array.isArray(record.criteria) ? record.criteria : [],
    documents: Array.isArray(record.documents) ? record.documents : [],
  };

  return {
    isValid: errors.length === 0,
    valid: errors.length === 0,
    errors,
    record: normalized,
  };
}

/**
 * Detect duplicates against existing database records
 */
export async function detectDuplicates(validatedRecords) {
  const existingSchemes = await query(
    `SELECT id, scheme_name, slug, department, state_coverage, source_id, official_url,
            min_income, max_income, min_age, max_age, benefits_summary, verification_status
     FROM welfare_schemes`
  );

  return validatedRecords.map((item) => {
    const record = item.record || item;
    let match = null;

    // 1. Stable source identifier match
    if (record.source_id) {
      match = existingSchemes.find(
        (ex) => ex.source_id && ex.source_id.trim().toLowerCase() === record.source_id.trim().toLowerCase()
      );
    }

    // 2. Strict composite match: (Name + Department + State)
    if (!match) {
      match = existingSchemes.find(
        (ex) =>
          ex.scheme_name.trim().toLowerCase() === record.scheme_name.trim().toLowerCase() &&
          ex.state_coverage.trim().toLowerCase() === record.state_coverage.trim().toLowerCase()
      );
    }

    // 3. Slug match
    if (!match && record.slug) {
      match = existingSchemes.find(
        (ex) => ex.slug && ex.slug.trim().toLowerCase() === record.slug.trim().toLowerCase()
      );
    }

    if (!match) {
      return {
        ...item,
        status: 'new',
        existingRecord: null,
        diffs: {},
      };
    }

    // Compare fields and generate diff
    const diffs = {};
    const checkFields = [
      { key: 'department', label: 'Department' },
      { key: 'category', label: 'Category' },
      { key: 'state_coverage', label: 'State Coverage' },
      { key: 'official_url', label: 'Official URL' },
      { key: 'max_income', label: 'Income Limit' },
      { key: 'min_age', label: 'Min Age' },
      { key: 'max_age', label: 'Max Age' },
      { key: 'benefits_summary', label: 'Benefits' },
    ];

    for (const f of checkFields) {
      const oldVal = match[f.key] !== null && match[f.key] !== undefined ? String(match[f.key]).trim() : '';
      const newVal = record[f.key] !== null && record[f.key] !== undefined ? String(record[f.key]).trim() : '';
      if (oldVal !== newVal && newVal !== '') {
        diffs[f.key] = { label: f.label, oldVal, newVal };
      }
    }

    const diffList = Object.entries(diffs).map(([field, v]) => ({ field, ...v }));
    const hasDiff = diffList.length > 0;

    return {
      ...item,
      scheme_name: record.scheme_name,
      status: hasDiff ? 'duplicate_with_diff' : 'duplicate_identical',
      existingRecord: match,
      existing_id: match.id,
      diffs: diffList,
      diffMap: diffs,
    };
  });
}

/**
 * Preview an import without committing any changes to database
 */
export async function previewImport(rawContent, fileType = 'json', options = {}) {
  const parsedRecords = parseImportContent(rawContent, fileType);
  if (!parsedRecords.length) {
    throw new Error('No valid records found in import payload.');
  }

  const validated = parsedRecords.map((rec, i) => validateSchemeRecord(rec, i));
  const evaluated = await detectDuplicates(validated);

  const total = evaluated.length;
  const valid = evaluated.filter((r) => r.isValid).length;
  const invalid = total - valid;
  const newCount = evaluated.filter((r) => r.isValid && r.status === 'new').length;
  const diffCount = evaluated.filter((r) => r.isValid && r.status === 'duplicate_with_diff').length;
  const identicalCount = evaluated.filter((r) => r.isValid && r.status === 'duplicate_identical').length;

  return {
    summary: {
      total_records: total,
      valid_records: valid,
      invalid_records: invalid,
      new_schemes: newCount,
      updates_with_diff: diffCount,
      identical_duplicates: identicalCount,
    },
    items: evaluated,
  };
}

/**
 * Execute import with strict database transaction and rollback safety
 */
export async function executeImport(adminIdOrParams, evaluatedItemsParam, optionsParam = {}) {
  let adminId = adminIdOrParams;
  let evaluatedItems = evaluatedItemsParam;
  let options = optionsParam;

  if (typeof adminIdOrParams === 'object' && adminIdOrParams !== null && !Array.isArray(adminIdOrParams)) {
    const params = adminIdOrParams;
    adminId = params.adminId || 1;
    evaluatedItems = params.records || params.items || [];
    options = {
      overwriteDuplicates: params.updateDuplicates ?? params.overwriteDuplicates ?? false,
      verificationStatus: params.defaultStatus || params.verificationStatus || 'pending_verification',
      sourceType: params.sourceType || 'json',
      sourceName: params.sourceName || 'Official Government Dataset',
      ...params,
    };
  }

  const {
    overwriteDuplicates = false,
    verificationStatus = 'pending_verification',
    sourceType = 'json',
    sourceName = 'Official Government Dataset',
    fileName = 'scheme_import.json',
  } = options;

  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let rejectedCount = 0;
  const errorLogs = [];
  const processedSchemes = [];

  // Wrap items in evaluated structure if raw records were passed
  if (Array.isArray(evaluatedItems)) {
    evaluatedItems = evaluatedItems.map((item) => {
      if (item && item.record && item.isValid !== undefined) return item;
      return {
        isValid: true,
        record: item,
        status: 'new',
        errors: [],
      };
    });
  }

  // Execute inside an ACID database transaction
  const importResult = await withTransaction(async (dbQuery) => {
    for (const item of evaluatedItems) {
      if (!item.isValid) {
        rejectedCount++;
        errorLogs.push({
          scheme_name: item.record?.scheme_name || 'Unknown',
          errors: item.errors,
        });
        continue;
      }

      const { record } = item;
      let status = item.status || 'new';
      let existingRecord = item.existingRecord;

      if (!existingRecord && record.source_id) {
        const matches = await dbQuery('SELECT * FROM welfare_schemes WHERE source_id = ?', [record.source_id]);
        if (matches && matches.length > 0) {
          existingRecord = matches[0];
          status = 'duplicate_with_diff';
        }
      }

      // Duplicate handling
      if (status === 'duplicate_identical' || status === 'duplicate_with_diff') {
        if (!overwriteDuplicates) {
          skippedCount++;
          processedSchemes.push({
            id: existingRecord.id,
            scheme_name: record.scheme_name,
            action: 'skipped',
            reason: 'Existing scheme record retained without modifications.',
          });
          continue;
        }

        // Administrator approved update
        await dbQuery(
          `UPDATE welfare_schemes
           SET scheme_name = ?, description = ?, category = ?, department = ?, state_coverage = ?,
               min_age = ?, max_age = ?, min_income = ?, max_income = ?, eligible_occupations = ?,
               official_url = ?, source_ref = ?, source_url = ?, benefits_summary = ?,
               verification_status = ?, last_verified_date = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            record.scheme_name,
            record.description,
            record.category,
            record.department,
            record.state_coverage,
            record.min_age,
            record.max_age,
            record.min_income,
            record.max_income,
            JSON.stringify(record.eligible_occupations || []),
            record.official_url,
            record.source_ref,
            record.source_url,
            record.benefits_summary || '',
            verificationStatus,
            record.last_verified_date || new Date().toISOString().split('T')[0],
            record.is_active !== undefined ? (record.is_active ? 1 : 0) : 1,
            existingRecord.id,
          ]
        );

        // Update criteria and documents if supplied
        if (record.criteria && record.criteria.length > 0) {
          await dbQuery('DELETE FROM eligibility_criteria WHERE scheme_id = ?', [existingRecord.id]);
          for (const crit of record.criteria) {
            await dbQuery(
              `INSERT INTO eligibility_criteria
               (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                existingRecord.id,
                crit.criterion_type || crit.profile_field || 'custom',
                crit.profile_field,
                crit.operator,
                String(crit.target_value),
                crit.is_mandatory ? 1 : 0,
                Number(crit.weight || 1.0),
                crit.description || `${crit.profile_field} requirement`,
                crit.failure_reason || `${crit.profile_field} does not satisfy scheme criteria`,
              ]
            );
          }
        }

        if (record.documents && record.documents.length > 0) {
          await dbQuery('DELETE FROM scheme_documents WHERE scheme_id = ?', [existingRecord.id]);
          for (const doc of record.documents) {
            await dbQuery(
              `INSERT INTO scheme_documents (scheme_id, document_name, description, is_mandatory, issuing_authority)
               VALUES (?, ?, ?, ?, ?)`,
              [
                existingRecord.id,
                doc.document_name,
                doc.description || '',
                doc.is_mandatory ? 1 : 0,
                doc.issuing_authority || 'Competent Authority',
              ]
            );
          }
        }

        updatedCount++;
        processedSchemes.push({
          id: existingRecord.id,
          scheme_name: record.scheme_name,
          action: 'updated',
          verification_status: verificationStatus,
        });
        continue;
      }

      // New Scheme Insertion
      const insertResult = await dbQuery(
        `INSERT INTO welfare_schemes
         (scheme_name, slug, description, category, department, state_coverage,
          min_age, max_age, min_income, max_income, eligible_occupations, official_url,
          source_id, source_url, benefits_summary, verification_status, import_date,
          is_active, source_ref, last_verified_date, is_demonstration)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, 0)`,
        [
          record.scheme_name,
          `${record.slug}-${Date.now().toString().slice(-4)}`,
          record.description,
          record.category,
          record.department,
          record.state_coverage,
          record.min_age,
          record.max_age,
          record.min_income,
          record.max_income,
          JSON.stringify(record.eligible_occupations || []),
          record.official_url,
          record.source_id,
          record.source_url,
          record.benefits_summary || '',
          verificationStatus,
          record.is_active !== undefined ? (record.is_active ? 1 : 0) : 1,
          record.source_ref || 'Official Government Portal',
          record.last_verified_date || new Date().toISOString().split('T')[0],
        ]
      );

      const newSchemeId = insertResult.insertId;

      // Insert criteria rules
      if (record.criteria && record.criteria.length > 0) {
        for (const crit of record.criteria) {
          await dbQuery(
            `INSERT INTO eligibility_criteria
             (scheme_id, criterion_type, profile_field, operator, target_value, is_mandatory, weight, description, failure_reason)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newSchemeId,
              crit.criterion_type || crit.profile_field || 'custom',
              crit.profile_field,
              crit.operator,
              String(crit.target_value),
              crit.is_mandatory ? 1 : 0,
              Number(crit.weight || 1.0),
              crit.description || `${crit.profile_field} requirement`,
              crit.failure_reason || `${crit.profile_field} does not satisfy scheme criteria`,
            ]
          );
        }
      }

      // Insert required documents
      if (record.documents && record.documents.length > 0) {
        for (const doc of record.documents) {
          await dbQuery(
            `INSERT INTO scheme_documents (scheme_id, document_name, description, is_mandatory, issuing_authority)
             VALUES (?, ?, ?, ?, ?)`,
            [
              newSchemeId,
              doc.document_name,
              doc.description || '',
              doc.is_mandatory ? 1 : 0,
              doc.issuing_authority || 'Competent Authority',
            ]
          );
        }
      }

      importedCount++;
      processedSchemes.push({
        id: newSchemeId,
        scheme_name: record.scheme_name,
        action: 'imported',
        verification_status: verificationStatus,
      });
    }

    // Save batch import log
    const logResult = await dbQuery(
      `INSERT INTO scheme_import_logs
       (admin_id, source_type, source_name, file_name, total_records, imported_count, updated_count, skipped_count, rejected_count, status, error_log, report_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
      [
        adminId,
        sourceType,
        sourceName,
        fileName,
        evaluatedItems.length,
        importedCount,
        updatedCount,
        skippedCount,
        rejectedCount,
        JSON.stringify(errorLogs),
        JSON.stringify({ processedSchemes }),
      ]
    );

    return {
      batch_id: logResult.insertId,
      status: 'completed',
      records_processed: evaluatedItems.length,
      records_imported: importedCount,
      records_updated: updatedCount,
      records_skipped: skippedCount,
      records_rejected: rejectedCount,
      total_records: evaluatedItems.length,
      imported_count: importedCount,
      updated_count: updatedCount,
      skipped_count: skippedCount,
      rejected_count: rejectedCount,
      processed_schemes: processedSchemes,
      errors: errorLogs,
      verification_status: verificationStatus,
      imported_at: new Date().toISOString(),
    };
  });

  return importResult;
}

/**
 * Fetch historical import audit logs
 */
export async function getImportLogs() {
  return await query(
    `SELECT l.*, u.email as admin_email
     FROM scheme_import_logs l
     JOIN users u ON l.admin_id = u.id
     ORDER BY l.created_at DESC
     LIMIT 50`
  );
}

/**
 * Update verification status of a welfare scheme
 */
export async function verifyScheme(arg1, arg2, arg3 = '', arg4 = '') {
  let schemeId;
  let verificationStatus;
  let notes = '';

  if (typeof arg2 === 'string' && ['verified', 'pending_verification', 'rejected', 'outdated'].includes(arg2)) {
    schemeId = arg1;
    verificationStatus = arg2;
    notes = arg3;
  } else {
    schemeId = arg2;
    verificationStatus = arg3;
    notes = arg4;
  }

  const allowed = ['verified', 'pending_verification', 'rejected', 'outdated'];
  if (!allowed.includes(verificationStatus)) {
    throw new Error(`Invalid status '${verificationStatus}'. Allowed: ${allowed.join(', ')}`);
  }

  const now = new Date().toISOString();
  await query(
    `UPDATE welfare_schemes
     SET verification_status = ?, last_verified_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [verificationStatus, schemeId]
  );

  return {
    schemeId,
    verification_status: verificationStatus,
    verificationStatus,
    updated: true,
    last_verified_at: now,
  };
}

/**
 * Load authentic pre-packaged official datasets (Central Government or Tamil Nadu)
 */
export function getPredefinedDataset(datasetKey) {
  let filePath = '';
  if (datasetKey === 'central') {
    filePath = path.resolve(__dirname, '../data/official_central_schemes.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else if (datasetKey === 'tamilnadu') {
    filePath = path.resolve(__dirname, '../data/official_tamilnadu_schemes.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else if (datasetKey === 'template_csv') {
    filePath = path.resolve(__dirname, '../data/templates/scheme_import_template.csv');
    return fs.readFileSync(filePath, 'utf8');
  } else if (datasetKey === 'template_json') {
    filePath = path.resolve(__dirname, '../data/templates/scheme_import_template.json');
    return fs.readFileSync(filePath, 'utf8');
  } else {
    throw new Error(`Unknown dataset '${datasetKey}'`);
  }
}

export default {
  parseImportContent,
  validateSchemeRecord,
  detectDuplicates,
  previewImport,
  executeImport,
  getImportLogs,
  verifyScheme,
  getPredefinedDataset,
};
