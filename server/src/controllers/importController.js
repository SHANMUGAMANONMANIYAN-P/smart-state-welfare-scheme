import importService from '../services/importService.js';

/**
 * Government Welfare Scheme Data Import Controller
 */

export async function previewUpload(req, res, next) {
  try {
    let { rawContent, fileType = 'json', options = {} } = req.body || {};

    if (!rawContent && req.file && req.file.buffer) {
      rawContent = req.file.buffer.toString('utf8');
      if (req.file.originalname && req.file.originalname.endsWith('.csv')) {
        fileType = 'csv';
      }
    }

    if (!rawContent || !rawContent.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No file content or dataset payload received.',
      });
    }

    const previewResult = await importService.previewImport(rawContent, fileType, options);

    return res.json({
      success: true,
      message: 'Dataset parsed and validated successfully.',
      data: previewResult,
      summary: previewResult.summary,
      valid_records: previewResult.items?.filter((i) => i.isValid).map((i) => i.record) || [],
      duplicates: previewResult.items?.filter((i) => i.status.startsWith('duplicate')).map((i) => ({
        scheme_name: i.record.scheme_name,
        existing_id: i.existingRecord?.id,
        match_type: i.status,
        diffs: i.diffs || [],
      })) || [],
      rejected: previewResult.items?.filter((i) => !i.isValid).map((i) => ({
        record: i.record,
        errors: i.errors,
      })) || [],
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to parse and validate import payload.',
    });
  }
}

export async function confirmImport(req, res, next) {
  try {
    const items = req.body.items || req.body.records;
    const options = { ...(req.body.options || {}) };

    if (req.body.update_duplicates !== undefined) {
      options.overwriteDuplicates = req.body.update_duplicates;
    }
    if (req.body.default_status !== undefined) {
      options.verificationStatus = req.body.default_status;
    }
    if (req.body.source_type !== undefined) {
      options.sourceType = req.body.source_type;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No validated scheme items provided for import.',
      });
    }

    // Wrap items in evaluated structure if raw records were passed
    const evaluatedItems = items.map((item) => {
      if (item.record && item.isValid !== undefined) return item;
      return {
        isValid: true,
        record: item,
        status: 'new',
        errors: [],
      };
    });

    const adminId = req.user ? req.user.id : 1;
    const result = await importService.executeImport(adminId, evaluatedItems, options);

    return res.status(201).json({
      success: true,
      message: `Import completed: ${result.imported_count} imported, ${result.updated_count} updated, ${result.skipped_count} skipped, ${result.rejected_count} rejected.`,
      result: {
        batch_id: result.batch_id,
        records_processed: result.total_records,
        records_imported: result.imported_count,
        records_updated: result.updated_count,
        records_skipped: result.skipped_count,
        records_rejected: result.rejected_count,
        status: 'completed',
      },
      data: result,
    });
  } catch (err) {
    console.error('[Import Execution Error]', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Database error during transactional scheme import. All changes were safely rolled back.',
    });
  }
}

export async function getImportLogs(req, res, next) {
  try {
    const logs = await importService.getImportLogs();
    const formatted = logs.map((l) => ({
      ...l,
      records_processed: l.total_records,
      records_imported: l.imported_count,
      records_updated: l.updated_count,
      records_skipped: l.skipped_count,
      records_rejected: l.rejected_count,
    }));
    return res.json({
      success: true,
      logs: formatted,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyScheme(req, res, next) {
  try {
    const id = req.params.id || req.params.schemeId;
    const verification_status = req.body.verification_status || req.body.status;
    const notes = req.body.notes || '';

    if (!verification_status) {
      return res.status(400).json({
        success: false,
        message: 'verification_status is required.',
      });
    }

    const adminId = req.user ? req.user.id : 1;
    const result = await importService.verifyScheme(adminId, id, verification_status, notes);
    return res.json({
      success: true,
      message: `Scheme #${id} marked as '${verification_status}'.`,
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

export async function downloadTemplate(req, res, next) {
  try {
    const format = (req.params.format || req.query.format || 'json').toLowerCase();
    if (format === 'csv') {
      const csvContent = importService.getPredefinedDataset('template_csv');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="smartwelfare_scheme_template.csv"');
      return res.send(csvContent);
    } else {
      const jsonContent = importService.getPredefinedDataset('template_json');
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="smartwelfare_scheme_template.json"');
      return res.send(jsonContent);
    }
  } catch (err) {
    next(err);
  }
}

export async function loadPredefinedDataset(req, res, next) {
  try {
    const dataset = req.params.dataset || req.body.datasetKey || req.body.dataset;
    if (!['central', 'tamilnadu'].includes(dataset)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dataset requested. Allowed: 'central', 'tamilnadu'",
      });
    }

    const jsonContent = importService.getPredefinedDataset(dataset);
    const previewResult = await importService.previewImport(jsonContent, 'json');

    return res.json({
      success: true,
      datasetKey: dataset,
      dataset,
      source_name:
        dataset === 'central'
          ? 'Government of India / data.gov.in Official Welfare Schemes'
          : 'Government of Tamil Nadu Official Welfare Schemes',
      raw_content: jsonContent,
      data: previewResult,
      summary: previewResult.summary,
      valid_records: previewResult.items?.filter((i) => i.isValid).map((i) => i.record) || [],
      duplicates: previewResult.items?.filter((i) => i.status.startsWith('duplicate')).map((i) => ({
        scheme_name: i.record.scheme_name,
        existing_id: i.existingRecord?.id,
        match_type: i.status,
        diffs: i.diffs || [],
      })) || [],
      rejected: previewResult.items?.filter((i) => !i.isValid).map((i) => ({
        record: i.record,
        errors: i.errors,
      })) || [],
    });
  } catch (err) {
    next(err);
  }
}

export default {
  previewUpload,
  confirmImport,
  getImportLogs,
  verifyScheme,
  downloadTemplate,
  loadPredefinedDataset,
};
