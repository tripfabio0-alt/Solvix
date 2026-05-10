// ============================================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================================
// IMPORTANTE: Substitua os valores abaixo pelas credenciais do seu projeto.
// Você encontra essas chaves no painel do Supabase em: Settings > API
// ============================================================================

const SUPABASE_URL = 'https://dvvjcewohzbtgtotlbbv.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI'; // FALTANDO: Pegue em Settings > API

// Inicializa o cliente do Supabase
// (A biblioteca global 'supabase' deve ser carregada antes deste arquivo via CDN)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exporta o cliente para uso global
window.supabaseClient = supabaseClient;
