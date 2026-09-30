import React, { useState, useEffect } from 'react';
import { supabase, Produto, Categoria, Cupom, Promocao, Cliente, Venda, ItemVenda, getFotoSrc } from '../lib/supabase';
import {
  Package, FolderTree, Tag, Ticket, ShoppingBag, Users, Plus, Edit2, Trash2, X,
  ArrowLeft, ImageIcon, RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<'produtos' | 'categorias' | 'cupons' | 'promocoes' | 'vendas' | 'clientes'>('produtos');

  // Data States
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Form States
  const [modalType, setModalType] = useState<'produto' | 'categoria' | 'cupom' | 'promocao' | 'venda_detalhes' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedVendaItens, setSelectedVendaItens] = useState<ItemVenda[]>([]);

  // Form Field States
  // Categoria
  const [catNome, setCatNome] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catAtivo, setCatAtivo] = useState(true);

  // Produto
  const [prodNome, setProdNome] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPreco, setProdPreco] = useState('');
  const [prodEstoque, setProdEstoque] = useState('');
  const [prodCategoriaId, setProdCategoriaId] = useState('');
  const [prodDestaque, setProdDestaque] = useState(false);
  const [prodFotoBase64, setProdFotoBase64] = useState('');
  const [prodFotoTipo, setProdFotoTipo] = useState('');

  // Cupom
  const [cupomCodigo, setCupomCodigo] = useState('');
  const [cupomTipo, setCupomTipo] = useState<'porcentagem' | 'fixo'>('porcentagem');
  const [cupomValor, setCupomValor] = useState('');
  const [cupomValorMinimo, setCupomValorMinimo] = useState('');
  const [cupomUsoMaximo, setCupomUsoMaximo] = useState('');
  const [cupomValidoAte, setCupomValidoAte] = useState('');
  const [cupomAtivo, setCupomAtivo] = useState(true);

  // Promoção
  const [promNome, setPromNome] = useState('');
  const [promDescontoPct, setPromDescontoPct] = useState('');
  const [promTipoAlvo, setPromTipoAlvo] = useState<'produto' | 'categoria'>('produto');
  const [promProdutoId, setPromProdutoId] = useState('');
  const [promCategoriaId, setPromCategoriaId] = useState('');
  const [promExpiraEm, setPromExpiraEm] = useState('');
  const [promAtivo, setPromAtivo] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat, resCup, resProm, resVend, resCli] = await Promise.all([
        supabase.from('produtos').select('*').order('criado_em', { ascending: false }),
        supabase.from('categorias').select('*').order('nome', { ascending: true }),
        supabase.from('cupons').select('*').order('criado_em', { ascending: false }),
        supabase.from('promocoes').select('*').order('criado_em', { ascending: false }),
        supabase.from('vendas').select('*').order('criado_em', { ascending: false }),
        supabase.from('clientes').select('*').order('criado_em', { ascending: false })
      ]);

      if (resProd.data) setProdutos(resProd.data);
      if (resCat.data) setCategorias(resCat.data);
      if (resCup.data) setCupons(resCup.data);
      if (resProm.data) setPromocoes(resProm.data);
      if (resVend.data) setVendas(resVend.data);
      if (resCli.data) setClientes(resCli.data);
    } catch (err) {
      console.error('Erro ao buscar dados admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProdFotoTipo(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProdFotoBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  // --- CRUD CATEGORIAS ---
  const openCategoriaModal = (cat?: Categoria) => {
    if (cat) {
      setEditingItem(cat);
      setCatNome(cat.nome);
      setCatDesc(cat.descricao || '');
      setCatAtivo(cat.ativo);
    } else {
      setEditingItem(null);
      setCatNome('');
      setCatDesc('');
      setCatAtivo(true);
    }
    setModalType('categoria');
  };

  const handleSaveCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNome.trim()) return;

    if (editingItem) {
      await supabase.from('categorias').update({
        nome: catNome,
        descricao: catDesc,
        ativo: catAtivo
      }).eq('id', editingItem.id);
    } else {
      await supabase.from('categorias').insert({
        nome: catNome,
        descricao: catDesc,
        ativo: catAtivo
      });
    }

    setModalType(null);
    fetchAllData();
  };

  const handleDeleteCategoria = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    await supabase.from('categorias').delete().eq('id', id);
    fetchAllData();
  };

  // --- CRUD PRODUTOS ---
  const openProdutoModal = (prod?: Produto) => {
    if (prod) {
      setEditingItem(prod);
      setProdNome(prod.nome);
      setProdDesc(prod.descricao || '');
      setProdPreco(prod.preco.toString());
      setProdEstoque(prod.estoque.toString());
      setProdCategoriaId(prod.categoria_id || '');
      setProdDestaque(prod.destaque || false);
      setProdFotoBase64(prod.foto || '');
      setProdFotoTipo(prod.foto_tipo || '');
    } else {
      setEditingItem(null);
      setProdNome('');
      setProdDesc('');
      setProdPreco('');
      setProdEstoque('');
      setProdCategoriaId(categorias[0]?.id || '');
      setProdDestaque(false);
      setProdFotoBase64('');
      setProdFotoTipo('');
    }
    setModalType('produto');
  };

  const handleSaveProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNome.trim() || !prodPreco) return;

    const payload = {
      nome: prodNome,
      descricao: prodDesc,
      preco: parseFloat(prodPreco),
      estoque: parseInt(prodEstoque) || 0,
      categoria_id: prodCategoriaId || null,
      destaque: prodDestaque,
      foto: prodFotoBase64,
      foto_tipo: prodFotoTipo,
      ativo: true
    };

    if (editingItem) {
      await supabase.from('produtos').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('produtos').insert(payload);
    }

    setModalType(null);
    fetchAllData();
  };

  const handleDeleteProduto = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    await supabase.from('produtos').delete().eq('id', id);
    fetchAllData();
  };

  // --- CRUD CUPONS ---
  const openCupomModal = (cupom?: Cupom) => {
    if (cupom) {
      setEditingItem(cupom);
      setCupomCodigo(cupom.codigo);
      setCupomTipo(cupom.tipo_desconto);
      setCupomValor(cupom.valor.toString());
      setCupomValorMinimo(cupom.valor_minimo ? cupom.valor_minimo.toString() : '');
      setCupomUsoMaximo(cupom.uso_maximo ? cupom.uso_maximo.toString() : '');
      setCupomValidoAte(cupom.valido_ate || '');
      setCupomAtivo(cupom.ativo);
    } else {
      setEditingItem(null);
      setCupomCodigo('');
      setCupomTipo('porcentagem');
      setCupomValor('');
      setCupomValorMinimo('');
      setCupomUsoMaximo('');
      setCupomValidoAte('');
      setCupomAtivo(true);
    }
    setModalType('cupom');
  };

  const handleSaveCupom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cupomCodigo.trim() || !cupomValor) return;

    const payload = {
      codigo: cupomCodigo.trim().toUpperCase(),
      tipo_desconto: cupomTipo,
      valor: parseFloat(cupomValor),
      valor_minimo: cupomValorMinimo ? parseFloat(cupomValorMinimo) : null,
      uso_maximo: cupomUsoMaximo ? parseInt(cupomUsoMaximo) : null,
      valido_ate: cupomValidoAte || null,
      ativo: cupomAtivo
    };

    if (editingItem) {
      await supabase.from('cupons').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('cupons').insert(payload);
    }

    setModalType(null);
    fetchAllData();
  };

  const handleDeleteCupom = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;
    await supabase.from('cupons').delete().eq('id', id);
    fetchAllData();
  };

  // --- CRUD PROMOÇÕES ---
  const openPromocaoModal = (prom?: Promocao) => {
    if (prom) {
      setEditingItem(prom);
      setPromNome(prom.nome);
      setPromDescontoPct(prom.desconto_pct.toString());
      if (prom.produto_id) {
        setPromTipoAlvo('produto');
        setPromProdutoId(prom.produto_id);
        setPromCategoriaId('');
      } else {
        setPromTipoAlvo('categoria');
        setPromCategoriaId(prom.categoria_id || '');
        setPromProdutoId('');
      }
      setPromExpiraEm(prom.expira_em ? prom.expira_em.split('T')[0] : '');
      setPromAtivo(prom.ativo);
    } else {
      setEditingItem(null);
      setPromNome('');
      setPromDescontoPct('');
      setPromTipoAlvo('produto');
      setPromProdutoId(produtos[0]?.id || '');
      setPromCategoriaId('');
      setPromExpiraEm('');
      setPromAtivo(true);
    }
    setModalType('promocao');
  };

  const handleSavePromocao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promNome.trim() || !promDescontoPct) return;

    const payload = {
      nome: promNome,
      desconto_pct: parseFloat(promDescontoPct),
      produto_id: promTipoAlvo === 'produto' ? promProdutoId : null,
      categoria_id: promTipoAlvo === 'categoria' ? promCategoriaId : null,
      expira_em: promExpiraEm ? new Date(promExpiraEm).toISOString() : null,
      ativo: promAtivo
    };

    if (editingItem) {
      await supabase.from('promocoes').update(payload).eq('id', editingItem.id);
    } else {
      await supabase.from('promocoes').insert(payload);
    }

    setModalType(null);
    fetchAllData();
  };

  const handleDeletePromocao = async (id: string) => {
    if (!confirm('Deseja excluir esta promoção?')) return;
    await supabase.from('promocoes').delete().eq('id', id);
    fetchAllData();
  };

  // --- VENDAS & STATUS ---
  const handleUpdateVendaStatus = async (vendaId: string, status: 'Pendente' | 'Aprovado' | 'Enviado' | 'Entregue' | 'Cancelado') => {
    await supabase.from('vendas').update({ status }).eq('id', vendaId);
    fetchAllData();
  };

  const openVendaDetalhesModal = async (venda: Venda) => {
    setEditingItem(venda);
    const { data } = await supabase.from('itens_venda').select('*').eq('venda_id', venda.id);
    setSelectedVendaItens(data || []);
    setModalType('venda_detalhes');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToStore}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar à Loja
            </button>
            <div className="h-6 w-px bg-slate-800"></div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Painel de Gestão da Loja
            </h1>
          </div>

          <button
            onClick={fetchAllData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Atualizar Dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto border-t border-slate-800/60 pt-1">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'produtos'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" /> Produtos
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'categorias'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4" /> Categorias
          </button>
          <button
            onClick={() => setActiveTab('cupons')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'cupons'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-4 h-4" /> Cupons
          </button>
          <button
            onClick={() => setActiveTab('promocoes')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'promocoes'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" /> Promoções
          </button>
          <button
            onClick={() => setActiveTab('vendas')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'vendas'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Vendas
          </button>
          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'clientes'
                ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Clientes
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'produtos' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Produtos ({produtos.length})
              </h2>
              <button
                onClick={() => openProdutoModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/20 transition"
              >
                <Plus className="w-4 h-4" /> Novo Produto
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-4">Foto</th>
                      <th className="p-4">Nome</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Preço</th>
                      <th className="p-4">Estoque</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {produtos.map(p => {
                      const cat = categorias.find(c => c.id === p.categoria_id);
                      return (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="p-4">
                            <div className="w-12 h-12 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                              {getFotoSrc(p.foto, p.foto_tipo) ? (
                                <img
                                  src={getFotoSrc(p.foto, p.foto_tipo)!}
                                  alt={p.nome}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : p.foto_url ? (
                                <img src={p.foto_url} alt={p.nome} className="w-full h-full object-contain p-1" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-slate-600" />
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white">{p.nome}</p>
                            {p.destaque && (
                              <span className="inline-block mt-0.5 px-2 py-0.2 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">
                                Destaque
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-xs text-slate-400">{cat ? cat.nome : 'Sem categoria'}</td>
                          <td className="p-4 font-bold text-white">R$ {p.preco.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              p.estoque > 5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {p.estoque} un
                            </span>
                          </td>
                          <td className="p-4">
                            {p.ativo ? (
                              <span className="text-emerald-400 text-xs font-semibold">Ativo</span>
                            ) : (
                              <span className="text-slate-500 text-xs font-semibold">Inativo</span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => openProdutoModal(p)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduto(p.id)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categorias' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white">Categorias ({categorias.length})</h2>
              <button
                onClick={() => openCategoriaModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" /> Nova Categoria
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Descrição</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {categorias.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-white">{c.nome}</td>
                      <td className="p-4 text-xs text-slate-400">{c.descricao || '-'}</td>
                      <td className="p-4">
                        {c.ativo ? (
                          <span className="text-emerald-400 text-xs font-semibold">Ativa</span>
                        ) : (
                          <span className="text-slate-500 text-xs font-semibold">Inativa</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openCategoriaModal(c)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategoria(c.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'cupons' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white">Cupons de Desconto ({cupons.length})</h2>
              <button
                onClick={() => openCupomModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" /> Novo Cupom
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Código</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Usos</th>
                    <th className="p-4">Validade</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {cupons.map(c => (
                    <tr key={c.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-blue-400">{c.codigo}</td>
                      <td className="p-4 text-xs capitalize">{c.tipo_desconto}</td>
                      <td className="p-4 font-bold text-white">
                        {c.tipo_desconto === 'porcentagem' ? `${c.valor}%` : `R$ ${c.valor.toFixed(2)}`}
                      </td>
                      <td className="p-4 text-xs">{c.usos || 0} / {c.uso_maximo || '∞'}</td>
                      <td className="p-4 text-xs text-slate-400">{c.valido_ate || 'Sem validade'}</td>
                      <td className="p-4">
                        {c.ativo ? (
                          <span className="text-emerald-400 text-xs font-semibold">Ativo</span>
                        ) : (
                          <span className="text-slate-500 text-xs font-semibold">Inativo</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openCupomModal(c)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCupom(c.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'promocoes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white">Promoções ({promocoes.length})</h2>
              <button
                onClick={() => openPromocaoModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" /> Nova Promoção
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Alvo</th>
                    <th className="p-4">Desconto</th>
                    <th className="p-4">Expiração</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {promocoes.map(p => {
                    const prodTarget = p.produto_id ? produtos.find(pr => pr.id === p.produto_id) : null;
                    const catTarget = p.categoria_id ? categorias.find(ct => ct.id === p.categoria_id) : null;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-bold text-white">{p.nome}</td>
                        <td className="p-4 text-xs text-slate-300">
                          {prodTarget ? (
                            <span className="text-blue-400">Produto: {prodTarget.nome}</span>
                          ) : catTarget ? (
                            <span className="text-indigo-400">Categoria: {catTarget.nome}</span>
                          ) : (
                            'Geral'
                          )}
                        </td>
                        <td className="p-4 font-bold text-red-400">-{p.desconto_pct}% OFF</td>
                        <td className="p-4 text-xs text-slate-400">
                          {p.expira_em ? new Date(p.expira_em).toLocaleDateString('pt-BR') : 'Sem expiração'}
                        </td>
                        <td className="p-4">
                          {p.ativo ? (
                            <span className="text-emerald-400 text-xs font-semibold">Ativa</span>
                          ) : (
                            <span className="text-slate-500 text-xs font-semibold">Inativa</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openPromocaoModal(p)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePromocao(p.id)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'vendas' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white">Gestão de Vendas ({vendas.length})</h2>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Pedido ID</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {vendas.map(v => {
                    const cli = clientes.find(c => c.id === v.cliente_id);
                    return (
                      <tr key={v.id} className="hover:bg-slate-800/40">
                        <td className="p-4 font-mono font-bold text-blue-400">#{v.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-4 font-semibold text-white">{cli ? cli.nome : 'Cliente Anônimo'}</td>
                        <td className="p-4 text-xs text-slate-400">
                          {v.criado_em ? new Date(v.criado_em).toLocaleString('pt-BR') : '-'}
                        </td>
                        <td className="p-4 font-bold text-emerald-400">R$ {v.total.toFixed(2)}</td>
                        <td className="p-4">
                          <select
                            value={v.status}
                            onChange={(e) => handleUpdateVendaStatus(v.id, e.target.value as any)}
                            className="bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregue">Entregue</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openVendaDetalhesModal(v)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold rounded-lg border border-slate-700 transition"
                          >
                            Ver Itens
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white">Clientes Cadastrados ({clientes.length})</h2>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Nome</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Telefone</th>
                    <th className="p-4">Data de Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {clientes.map(cli => (
                    <tr key={cli.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-white">{cli.nome}</td>
                      <td className="p-4 text-xs text-blue-400">{cli.email}</td>
                      <td className="p-4 text-xs text-slate-400">{cli.telefone || '-'}</td>
                      <td className="p-4 text-xs text-slate-400">
                        {cli.criado_em ? new Date(cli.criado_em).toLocaleDateString('pt-BR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {modalType === 'produto' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              {editingItem ? 'Editar Produto' : 'Novo Produto'}
            </h3>

            <form onSubmit={handleSaveProduto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={prodNome}
                  onChange={(e) => setProdNome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                <select
                  value={prodCategoriaId}
                  onChange={(e) => setProdCategoriaId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Nenhuma</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPreco}
                    onChange={(e) => setProdPreco(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estoque *</label>
                  <input
                    type="number"
                    required
                    value={prodEstoque}
                    onChange={(e) => setProdEstoque(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Foto do Produto (Salva no BD)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-blue-400 hover:file:bg-slate-700 cursor-pointer"
                />
                {prodFotoBase64 && (
                  <div className="mt-2 w-20 h-20 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                    <img
                      src={getFotoSrc(prodFotoBase64, prodFotoTipo) || prodFotoBase64}
                      alt="Preview"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="prodDestaque"
                  checked={prodDestaque}
                  onChange={(e) => setProdDestaque(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                />
                <label htmlFor="prodDestaque" className="text-xs font-semibold text-slate-300">Produto em Destaque</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'categoria' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              {editingItem ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>

            <form onSubmit={handleSaveCategoria} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  value={catNome}
                  onChange={(e) => setCatNome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'cupom' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              {editingItem ? 'Editar Cupom' : 'Novo Cupom'}
            </h3>

            <form onSubmit={handleSaveCupom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Código do Cupom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DESCONTO10"
                  value={cupomCodigo}
                  onChange={(e) => setCupomCodigo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Desconto</label>
                  <select
                    value={cupomTipo}
                    onChange={(e) => setCupomTipo(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="porcentagem">Porcentagem (%)</option>
                    <option value="fixo">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cupomValor}
                    onChange={(e) => setCupomValor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Mínimo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cupomValorMinimo}
                    onChange={(e) => setCupomValorMinimo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Validade Até</label>
                  <input
                    type="date"
                    value={cupomValidoAte}
                    onChange={(e) => setCupomValidoAte(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'promocao' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              {editingItem ? 'Editar Promoção' : 'Nova Promoção'}
            </h3>

            <form onSubmit={handleSavePromocao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Promoção *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Black Friday 20%"
                  value={promNome}
                  onChange={(e) => setPromNome(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Desconto (%) *</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  required
                  value={promDescontoPct}
                  onChange={(e) => setPromDescontoPct(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Aplicar Por</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPromTipoAlvo('produto')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      promTipoAlvo === 'produto'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Por Produto
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromTipoAlvo('categoria')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      promTipoAlvo === 'categoria'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Por Categoria
                  </button>
                </div>
              </div>

              {promTipoAlvo === 'produto' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selecione o Produto</label>
                  <select
                    value={promProdutoId}
                    onChange={(e) => setPromProdutoId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Selecione a Categoria</label>
                  <select
                    value={promCategoriaId}
                    onChange={(e) => setPromCategoriaId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Data de Expiração</label>
                <input
                  type="date"
                  value={promExpiraEm}
                  onChange={(e) => setPromExpiraEm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'venda_detalhes' && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
              Detalhes do Pedido #{editingItem.id.slice(0, 8).toUpperCase()}
            </h3>

            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
                <p className="text-slate-400">Total do Pedido: <span className="text-emerald-400 font-bold text-sm">R$ {editingItem.total.toFixed(2)}</span></p>
                <p className="text-slate-400">Status: <span className="text-white font-semibold">{editingItem.status}</span></p>
              </div>

              <h4 className="text-xs font-bold text-slate-300 uppercase">Itens Comprados</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedVendaItens.map(item => {
                  const prod = produtos.find(p => p.id === item.produto_id);
                  return (
                    <div key={item.id} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <p className="font-bold text-white">{prod ? prod.nome : 'Produto'}</p>
                        <p className="text-slate-400">{item.quantidade}x R$ {item.preco_unitario.toFixed(2)}</p>
                      </div>
                      <p className="font-bold text-emerald-400">
                        R$ {(item.quantidade * item.preco_unitario * (1 - (item.desconto_pct || 0) / 100)).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
