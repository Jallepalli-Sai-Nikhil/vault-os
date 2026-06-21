import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Minimal implementation to read .env
const envPath = path.resolve(process.cwd(), '.env');
let envData = '';
try {
  envData = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.log('No .env file found. Please create one with VITE_SUPABASE_URL and VITE_SUPABASE_SECRET_KEY');
  process.exit(1);
}

const envVars = {};
envData.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const url = envVars['VITE_SUPABASE_URL'];
const serviceKey = envVars['VITE_SUPABASE_SECRET_KEY'];

if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey);

async function seedAdmin() {
  const email = 'sainikhil.jallepalli@gmail.com';
  const password = 'nikhilAdmin';

  console.log(`Checking if admin user ${email} exists...`);
  
  // Create user
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log('User already exists! Attempting to force update role to god_admin...');
      
      // Get the existing user
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = listData.users.find(u => u.email === email);
      
      if (existingUser) {
        // Ensure profile is god_admin
        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
          id: existingUser.id,
          email: existingUser.email,
          role: 'god_admin'
        });
        
        if (profileError) {
          console.error('Failed to update profile:', profileError.message);
        } else {
          console.log('Successfully confirmed existing user is a god_admin.');
        }
      }
      return;
    }
    console.error('Failed to create user:', error.message);
    return;
  }

  if (data?.user) {
    console.log('User created successfully. Generating profile with god_admin privileges...');
    
    // Create profile
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: data.user.id,
      email,
      role: 'god_admin'
    });

    if (profileError) {
      console.error('Failed to create profile:', profileError.message);
    } else {
      console.log('✅ Success! You can now log into the app with:');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Role: god_admin');
    }
  }
}

seedAdmin();
