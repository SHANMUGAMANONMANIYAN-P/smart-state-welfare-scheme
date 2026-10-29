import {
  evaluateCitizenProfile,
  getAssessmentHistory,
  getAssessmentDetail,
} from '../services/assessmentService.js';

export async function evaluate(req, res, next) {
  try {
    const results = await evaluateCitizenProfile(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Eligibility evaluation completed successfully.',
      data: results,
    });
  } catch (err) {
    next(err);
  }
}

export async function history(req, res, next) {
  try {
    const assessments = await getAssessmentHistory(req.user.id);
    res.status(200).json({
      success: true,
      data: assessments,
    });
  } catch (err) {
    next(err);
  }
}

export async function historyDetail(req, res, next) {
  try {
    const detail = await getAssessmentDetail(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (err) {
    next(err);
  }
}

export default {
  evaluate,
  history,
  historyDetail,
};
