import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate that Supabase URL is a valid HTTP/HTTPS URL
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
  });
  console.error('❌ Please set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY in your .env.local file');
}

if (supabaseUrl && !isValidUrl(supabaseUrl)) {
  console.error('❌ Invalid Supabase URL:', supabaseUrl);
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL');
}

// Cliente para operaciones del lado del cliente
export const supabase = supabaseUrl && isValidUrl(supabaseUrl) && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Cliente con permisos de servicio para operaciones del lado del servidor
export const supabaseAdmin = supabaseUrl && isValidUrl(supabaseUrl) && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export default supabaseAdmin;
