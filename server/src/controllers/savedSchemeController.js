import {
  getSavedSchemes,
  saveScheme,
  removeSavedScheme,
} from '../services/savedSchemeService.js';

export async function listSaved(req, res, next) {
  try {
    const schemes = await getSavedSchemes(req.user.id);
    res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes,
    });
  } catch (err) {
    next(err);
  }
}

export async function save(req, res, next) {
  try {
    const { scheme_id, notes } = req.body;
    if (!scheme_id) {
      return res.status(400).json({
        success: false,
        message: 'Scheme ID is required to bookmark.',
      });
    }

    const result = await saveScheme(req.user.id, scheme_id, notes);
    res.status(201).json({
      success: true,
      message: 'Scheme saved to your bookmarks.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const schemeId = req.params.schemeId;
    const result = await removeSavedScheme(req.user.id, schemeId);
    res.status(200).json({
      success: true,
      message: 'Scheme removed from your bookmarks.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  listSaved,
  save,
  remove,
};
