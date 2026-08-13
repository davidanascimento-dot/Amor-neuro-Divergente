// supabase-cliente.js

// A URL correta com as letras novas:
const SUPABASE_URL = 'https://qyixzontuhrxrrjrmzvy.supabase.co';

// A sua chave publishable:
const SUPABASE_ANON_KEY = 'sb_publishable_cPivIaJPzZRIRzkbFlAH_g_3R1_9auE';

window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);