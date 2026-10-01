module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ok: true,
    app: 'Dynasty Tankathon',
    version: '6.0.0',
    runtime: process.version,
    timestamp: new Date().toISOString()
  });
};
