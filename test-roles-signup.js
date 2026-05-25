const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://lzyvjwyquatcmhojygoz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6eXZqd3lxdWF0Y21ob2p5Z296Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzgyMjIsImV4cCI6MjA5NTExNDIyMn0.Yb_0aI2pWwx90YJCNvjBWZIZdrm5NTC0343_4XagkNM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testRole(role) {
  const email = `test-role-${role.toLowerCase()}-${Date.now()}@example.com`;
  console.log(`Testing signup for role: ${role} (${email})...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'TestPassword123!',
    options: {
      data: {
        name: `Test ${role}`,
        role: role,
        phone_number: `+220${Math.floor(1000000 + Math.random() * 9000000)}`
      }
    }
  });

  if (error) {
    console.log(`Role "${role}": FAILED (Error: ${error.message})`);
  } else {
    console.log(`Role "${role}": SUCCESS (User ID: ${data.user?.id})`);
  }
}

async function run() {
  await testRole('CUSTOMER');
  await testRole('STATION_BRANCH');
  await testRole('SUPER_ADMIN');
}

run();
