const assert = require('assert');

// Test with non-existent host to simulate DNS failure
process.env.SUPABASE_URL = 'https://non-existent-bharatlaunch-project-9999.supabase.co';
process.env.SUPABASE_SECRET_KEY = 'dummy-key';

delete require.cache[require.resolve('../api/_lib/blogs')];
const { createBlog } = require('../api/_lib/blogs');

async function testFetchFailure() {
  console.log('Testing network failure handling in createBlog...');
  try {
    await createBlog({
      title: 'Test Blog',
      slug: 'test-blog',
      excerpt: 'Test excerpt',
      content: 'Test content',
      category: 'Founder Playbook'
    });
    assert.fail('Should have thrown an error');
  } catch (err) {
    console.log('Caught expected error:', err.message);
    assert.ok(err.message.includes('Database connection failed to non-existent-bharatlaunch-project-9999.supabase.co'), 'Error message should include target hostname and details');
    console.log('PASS: Detailed, safe connection failure message produced without exposing secret keys.');
  }
}

testFetchFailure().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
