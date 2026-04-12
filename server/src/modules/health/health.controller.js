export function getHealth(req, res) {
  res.json({
    success: true,
    service: 'Smart Campus OS API',
    timestamp: new Date().toISOString()
  });
}
