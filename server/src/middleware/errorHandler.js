export function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  console.error(err);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}
