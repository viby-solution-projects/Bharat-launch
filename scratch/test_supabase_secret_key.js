const assert = require('assert');

// Simulate setting SUPABASE_SECRET_KEY as in Vercel
process.env.SUPABASE_URL = 'https://dummy-project.supabase.co';
process.env.SUPABASE_SECRET_KEY = 'dummy-secret-key-12345';
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

// Clear cache and reload blogs lib
delete require.cache[require.resolve('../api/_lib/blogs')];
const blogsLib = require('../api/_lib/blogs');

console.log('Testing SUPABASE_SECRET_KEY configuration detection...');
assert.strictEqual(blogsLib.isSupabaseConfigured(), true, 'isSupabaseConfigured() must be true when SUPABASE_SECRET_KEY is provided');
console.log('PASS: isSupabaseConfigured() correctly evaluates to true with SUPABASE_SECRET_KEY.');

// Test fallback when neither is provided
delete process.env.SUPABASE_SECRET_KEY;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete require.cache[require.resolve('../api/_lib/blogs')];
const blogsLibUnconfigured = require('../api/_lib/blogs');
assert.strictEqual(blogsLibUnconfigured.isSupabaseConfigured(), false, 'isSupabaseConfigured() must be false when keys are absent');
console.log('PASS: isSupabaseConfigured() correctly evaluates to false when keys are absent.');

console.log('ALL SUPABASE_SECRET_KEY UNIT TESTS PASSED! ✅');
