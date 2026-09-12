const { destroySession } = require('../_lib/blogs');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  destroySession(req);
  res.setHeader('Set-Cookie', 'bharatlaunch_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  return res.status(200).json({ authenticated: false });
};
