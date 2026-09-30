import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hfdfstczzjtkypcdphnq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S6tljAfGrnoRmpKHQYaIrA_6Lzrhl82';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  criado_em?: string;
}

export interface Produto {
  id: string;
  categoria_id?: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  foto?: string; // base64 string
  foto_tipo?: string; // mime type
  foto_url?: string;
  destaque?: boolean;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface Cupom {
  id: string;
  codigo: string;
  tipo_desconto: 'porcentagem' | 'fixo';
  valor: number;
  valor_minimo?: number;
  uso_maximo?: number;
  usos?: number;
  valido_de?: string;
  valido_ate?: string;
  ativo: boolean;
  criado_em?: string;
}

export interface Promocao {
  id: string;
  nome: string;
  produto_id?: string;
  categoria_id?: string;
  desconto_pct: number;
  inicio_em?: string;
  expira_em?: string;
  ativo: boolean;
  criado_em?: string;
}

export interface Cliente {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  senha_hash?: string;
  criado_em?: string;
}

export interface Venda {
  id: string;
  cliente_id?: string;
  status: 'Pendente' | 'Aprovado' | 'Enviado' | 'Entregue' | 'Cancelado';
  subtotal: number;
  desconto: number;
  total: number;
  cupom_id?: string;
  criado_em?: string;
}

export interface ItemVenda {
  id: string;
  venda_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  desconto_pct: number;
}

export const getFotoSrc = (foto?: string | null, fotoTipo?: string | null): string | null => {
  if (!foto) return null;
  if (foto.startsWith('data:')) return foto;
  if (foto.startsWith('\\x')) {
    try {
      const hex = foto.slice(2);
      const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      return `data:${fotoTipo || 'image/png'};base64,${base64}`;
    } catch (e) {
      console.error('Erro ao converter foto hex:', e);
      return null;
    }
  }
  return `data:${fotoTipo || 'image/jpeg'};base64,${foto}`;
};
