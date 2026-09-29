const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

let supabase = null;

const isSupabaseConfigured = () => {
  return (
    config.SUPABASE_URL &&
    config.SUPABASE_SERVICE_ROLE_KEY &&
    !config.SUPABASE_URL.includes('placeholder') &&
    !config.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
  );
};

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('✅ Supabase Client initialized with Service Role Key');
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Running FoodSave with built-in resilient database layer pre-seeded with demo data.');
}

module.exports = {
  supabase,
  isSupabaseConfigured
};
