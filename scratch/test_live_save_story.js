const https = require('https');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const reqOptions = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testLiveProduction() {
  console.log('Testing Live Vercel Production Deployment...');

  // 1. Log in to get session cookie
  console.log('Logging in to https://bharat-launch.vercel.app/api/auth/login...');
  const loginRes = await request('https://bharat-launch.vercel.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ password: 'bharatlaunch2026' }));

  console.log('Login Status:', loginRes.status);
  console.log('Login Response:', loginRes.body);

  const cookieHeader = loginRes.headers['set-cookie'];
  if (!cookieHeader) {
    console.error('Failed to get session cookie from login.');
    return;
  }

  const sessionCookie = cookieHeader.map(c => c.split(';')[0]).join('; ');
  console.log('Session Cookie Acquired.');

  // 2. Attempt to save a story via POST /api/blogs
  const payload = {
    title: 'How to Validate a Startup Idea in India Before Spending Money',
    slug: 'validate-startup-idea-india',
    featuredImage: 'assets/blog-ideatomarket.jpg',
    category: 'Founder Playbook',
    excerpt: 'A rigorous, step-by-step framework for Indian founders to validate customer problems, test willingness to pay, and spot false signals before building.',
    content: '## Validation in India\n\nValidating before spending capital protects your personal savings.',
    author: 'BharatLaunch Editorial',
    publicationDate: '2026-09-01',
    published: true
  };

  console.log('Attempting POST /api/blogs with session cookie...');
  const postRes = await request('https://bharat-launch.vercel.app/api/blogs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': sessionCookie
    }
  }, JSON.stringify(payload));

  console.log('----------------------------------------------------');
  console.log(`POST /api/blogs HTTP Status: ${postRes.status}`);
  console.log(`POST /api/blogs Response Body: ${postRes.body}`);
  console.log('----------------------------------------------------');
}

testLiveProduction().catch(err => console.error('Live test error:', err));
