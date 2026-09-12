const assert = require('assert');

// Test 1: Full URL with quotes and whitespace
process.env.SUPABASE_URL = '  "https://myproject.supabase.co/rest/v1/"  ';
process.env.SUPABASE_SECRET_KEY = ' "ey-secret-key-test"\n ';

delete require.cache[require.resolve('../api/_lib/blogs')];
const { getSupabaseConfig, isSupabaseConfigured } = require('../api/_lib/blogs');

const cfg1 = getSupabaseConfig();
console.log('Test 1 Config:', cfg1);
assert.strictEqual(cfg1.url, 'https://myproject.supabase.co', 'URL should be stripped of quotes, whitespace, and trailing rest/v1');
assert.strictEqual(cfg1.key, 'ey-secret-key-test', 'Key should be stripped of quotes, whitespace, and newlines');
assert.strictEqual(cfg1.hostname, 'myproject.supabase.co', 'Hostname should be correctly parsed');
assert.strictEqual(cfg1.isConfigured, true, 'isConfigured should be true');
console.log('PASS: Test 1 (Sanitization of URL and Secret Key)');

// Test 2: URL without protocol
process.env.SUPABASE_URL = 'anotherproject.supabase.co';
const cfg2 = getSupabaseConfig();
assert.strictEqual(cfg2.url, 'https://anotherproject.supabase.co', 'Protocol https:// should be prepended');
assert.strictEqual(cfg2.hostname, 'anotherproject.supabase.co', 'Hostname parsed correctly');
console.log('PASS: Test 2 (Automatic protocol prefixing)');

// Test 3: Missing credentials
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SECRET_KEY;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
const cfg3 = getSupabaseConfig();
assert.strictEqual(cfg3.isConfigured, false, 'isConfigured should be false when keys absent');
assert.strictEqual(cfg3.hasUrl, false);
assert.strictEqual(cfg3.hasKey, false);
console.log('PASS: Test 3 (Correct unconfigured detection)');

console.log('ALL SANITIZATION TESTS PASSED! ✅');
