import { getProfileByUserId, upsertProfile, getProfileCompletionStatus } from '../services/profileService.js';

export async function getProfile(req, res, next) {
  try {
    const profile = await getProfileByUserId(req.user.id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updated = await upsertProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Citizen profile updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCompletion(req, res, next) {
  try {
    const status = await getProfileCompletionStatus(req.user.id);
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  getProfile,
  updateProfile,
  getCompletion,
};

