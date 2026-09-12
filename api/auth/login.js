const { ADMIN_PASSWORD, createSession } = require('../_lib/blogs');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const body = req.body || {};
  if (typeof body.password !== 'string' || body.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid owner password.' });
  }

  const token = createSession();
  res.setHeader('Set-Cookie', `bharatlaunch_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`);
  return res.status(200).json({ authenticated: true });
};
