/**
 * Centralized error handling middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('[Application Error]', err.stack || err.message);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'An unexpected server error occurred. Please try again later.',
    errors: err.errors || undefined,
    ...(process.env.NODE_ENV === 'development' && { devDetails: err.message }),
  });
}

/**
 * 404 Route Not Found middleware
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
}

export default {
  errorHandler,
  notFoundHandler,
};
