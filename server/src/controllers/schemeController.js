import { getAllSchemes, getSchemeById } from '../services/schemeService.js';

export async function listSchemes(req, res, next) {
  try {
    const { category, state, search } = req.query;
    const schemes = await getAllSchemes({
      category,
      state,
      search,
      activeOnly: true, // Public endpoint only returns active schemes
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

export async function getScheme(req, res, next) {
  try {
    const scheme = await getSchemeById(req.params.id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Welfare scheme not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  listSchemes,
  getScheme,
};
