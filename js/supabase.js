// Configurações do Supabase
const SUPABASE_URL = 'https://hfdfstczzjtkypcdphnq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S6tljAfGrnoRmpKHQYaIrA_6Lzrhl82';

// Inicializar cliente do Supabase
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

/**
 * Converte bytea/hex ou url de foto para src de imagem utilizável
 */
function getFotoSrc(fotoData) {
  if (!fotoData) return null;
  if (typeof fotoData !== 'string') return null;

  // Se já for uma URL http ou Data URL
  if (fotoData.startsWith('http') || fotoData.startsWith('data:')) {
    return fotoData;
  }

  // Se for bytea PostgreSQL no formato hex (\x89504e47...)
  if (fotoData.startsWith('\\x')) {
    try {
      const hex = fotoData.slice(2);
      let binaryStr = '';
      for (let i = 0; i < hex.length; i += 2) {
        binaryStr += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      const base64 = btoa(binaryStr);
      let mimeType = 'image/jpeg';
      if (hex.startsWith('89504e47')) mimeType = 'image/png';
      else if (hex.startsWith('47494638')) mimeType = 'image/gif';
      else if (hex.startsWith('57454250')) mimeType = 'image/webp';

      return `data:${mimeType};base64,${base64}`;
    } catch (e) {
      console.error('Erro ao converter foto hex:', e);
      return null;
    }
  }

  return fotoData;
}

/**
 * Formata valor para moeda brasileira (R$)
 */
function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val || 0);
}
