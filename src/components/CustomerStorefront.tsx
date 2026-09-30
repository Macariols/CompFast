import React, { useState, useEffect } from 'react';
import { supabase, Produto, Categoria, Promocao, Cupom, getFotoSrc } from '../lib/supabase';
import {
  ShoppingBag, Search, Tag, Filter, CheckCircle, ArrowRight,
  ShoppingCart, X, Plus, Minus, Trash2, Check, User
} from 'lucide-react';

interface CartItem {
  produto: Produto;
  quantidade: number;
  desconto_pct: number;
  preco_final: number;
}

interface CustomerStorefrontProps {
  onOpenAdmin: () => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({ onOpenAdmin }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [promocoes, setPromocoes] = useState<Promocao[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('all');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Cupom | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'customer' | 'success'>('cart');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string>('');
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat, resProm] = await Promise.all([
        supabase.from('produtos').select('*').eq('ativo', true),
        supabase.from('categorias').select('*').eq('ativo', true),
        supabase.from('promocoes').select('*').eq('ativo', true)
      ]);

      if (resProd.data) setProdutos(resProd.data);
      if (resCat.data) setCategorias(resCat.data);
      if (resProm.data) setPromocoes(resProm.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute Active Promotion for a Product
  const getProductPromotion = (produto: Produto) => {
    const now = new Date().toISOString();

    const prodProm = promocoes.find(p => p.produto_id === produto.id && (!p.expira_em || p.expira_em >= now));
    if (prodProm) return prodProm.desconto_pct;

    if (produto.categoria_id) {
      const catProm = promocoes.find(p => p.categoria_id === produto.categoria_id && (!p.expira_em || p.expira_em >= now));
      if (catProm) return catProm.desconto_pct;
    }

    return 0;
  };

  const calculateFinalPrice = (produto: Produto) => {
    const pct = getProductPromotion(produto);
    if (pct > 0) {
      return produto.preco * (1 - pct / 100);
    }
    return produto.preco;
  };

  const addToCart = (produto: Produto) => {
    const desconto_pct = getProductPromotion(produto);
    const preco_final = calculateFinalPrice(produto);

    setCart(prev => {
      const existing = prev.find(item => item.produto.id === produto.id);
      if (existing) {
        return prev.map(item =>
          item.produto.id === produto.id
            ? { ...item, quantidade: Math.min(item.quantidade + 1, produto.estoque) }
            : item
        );
      } else {
        return [...prev, { produto, quantidade: 1, desconto_pct, preco_final }];
      }
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (produtoId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.produto.id === produtoId) {
        const newQty = item.quantidade + delta;
        if (newQty <= 0) return null;
        return { ...item, quantidade: Math.min(newQty, item.produto.estoque) };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (produtoId: string) => {
    setCart(prev => prev.filter(item => item.produto.id !== produtoId));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.preco_final * item.quantidade, 0);

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.tipo_desconto === 'porcentagem') {
      couponDiscount = subtotal * (appliedCoupon.valor / 100);
    } else {
      couponDiscount = appliedCoupon.valor;
    }
  }

  const total = Math.max(0, subtotal - couponDiscount);

  const applyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const { data, error } = await supabase
        .from('cupons')
        .select('*')
        .eq('codigo', couponCode.trim().toUpperCase())
        .eq('ativo', true)
        .single();

      if (error || !data) {
        setCouponError('Cupom inválido ou expirado.');
        setAppliedCoupon(null);
        return;
      }

      const cupom: Cupom = data;
      const today = new Date().toISOString().split('T')[0];

      if (cupom.valido_ate && cupom.valido_ate < today) {
        setCouponError('Este cupom já expirou.');
        return;
      }

      if (cupom.valor_minimo && subtotal < cupom.valor_minimo) {
        setCouponError(`O valor mínimo para usar este cupom é R$ ${cupom.valor_minimo.toFixed(2)}.`);
        return;
      }

      setAppliedCoupon(cupom);
      setCouponError('');
    } catch (err) {
      setCouponError('Erro ao validar cupom.');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName) return;

    setSubmittingOrder(true);
    try {
      let clienteId: string | null = null;
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', customerEmail.trim().toLowerCase())
        .single();

      if (existingClient) {
        clienteId = existingClient.id;
      } else {
        const { data: newClient } = await supabase
          .from('clientes')
          .insert({
            nome: customerName.trim(),
            email: customerEmail.trim().toLowerCase(),
            telefone: customerPhone.trim()
          })
          .select()
          .single();

        if (newClient) clienteId = newClient.id;
      }

      const { data: venda, error: vendaErr } = await supabase
        .from('vendas')
        .insert({
          cliente_id: clienteId,
          status: 'Aprovado',
          subtotal: subtotal,
          desconto: couponDiscount,
          total: total,
          cupom_id: appliedCoupon ? appliedCoupon.id : null
        })
        .select()
        .single();

      if (vendaErr || !venda) throw vendaErr;

      const itensToInsert = cart.map(item => ({
        venda_id: venda.id,
        produto_id: item.produto.id,
        quantidade: item.quantidade,
        preco_unitario: item.produto.preco,
        desconto_pct: item.desconto_pct
      }));

      await supabase.from('itens_venda').insert(itensToInsert);

      if (appliedCoupon) {
        await supabase
          .from('cupons')
          .update({ usos: (appliedCoupon.usos || 0) + 1 })
          .eq('id', appliedCoupon.id);
      }

      for (const item of cart) {
        const newStock = Math.max(0, item.produto.estoque - item.quantidade);
        await supabase
          .from('produtos')
          .update({ estoque: newStock })
          .eq('id', item.produto.id);
      }

      setCompletedOrderNumber(venda.id.slice(0, 8).toUpperCase());
      setCheckoutStep('success');
      setCart([]);
      setAppliedCoupon(null);
      setCouponCode('');
    } catch (err) {
      console.error('Erro ao finalizar venda:', err);
      alert('Ocorreu um erro ao processar o seu pedido. Tente novamente.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const filteredProducts = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.descricao && p.descricao.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategoria === 'all' || p.categoria_id === selectedCategoria;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">Comp<span className="text-blue-500">Fast</span></span>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">E-commerce de Eletrônicos</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar produtos, marcas, ofertas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-2"
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>Painel da Loja</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950">
                  {cart.reduce((sum, item) => sum + item.quantidade, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 p-8 md:p-12 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Tag className="w-3.5 h-3.5" /> Promoções Especiais Ativas
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Tecnologia de Ponta com os Melhores Preços
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Aproveite nossos cupons e descontos exclusivos nas categorias de Informática, Celulares, Games e Áudio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategoria('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              selectedCategoria === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Todas as Categorias
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoria(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                selectedCategoria === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              Produtos Disponíveis ({filteredProducts.length})
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-80 animate-pulse p-4">
                  <div className="bg-slate-800 h-40 rounded-xl mb-4"></div>
                  <div className="bg-slate-800 h-4 w-3/4 rounded mb-2"></div>
                  <div className="bg-slate-800 h-4 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-base">Nenhum produto encontrado nesta categoria ou pesquisa.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(produto => {
                const discountPct = getProductPromotion(produto);
                const finalPrice = calculateFinalPrice(produto);

                return (
                  <div
                    key={produto.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition group hover:shadow-xl hover:shadow-blue-900/10"
                  >
                    <div>
                      <div className="relative h-48 bg-slate-950 rounded-xl overflow-hidden mb-4 border border-slate-800/60 flex items-center justify-center">
                        {discountPct > 0 && (
                          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow">
                            -{discountPct}% OFF
                          </span>
                        )}
                        {produto.destaque && (
                          <span className="absolute top-2 right-2 z-10 bg-amber-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-md">
                            Destaque
                          </span>
                        )}

                        {getFotoSrc(produto.foto, produto.foto_tipo) ? (
                          <img
                            src={getFotoSrc(produto.foto, produto.foto_tipo)!}
                            alt={produto.nome}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
                          />
                        ) : produto.foto_url ? (
                          <img
                            src={produto.foto_url}
                            alt={produto.nome}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="text-slate-600 flex flex-col items-center">
                            <ShoppingBag className="w-10 h-10 mb-1" />
                            <span className="text-xs">Sem foto</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 mb-3">
                        <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                          {categorias.find(c => c.id === produto.categoria_id)?.nome || 'Geral'}
                        </span>
                        <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{produto.nome}</h3>
                        <p className="text-slate-400 text-xs line-clamp-2">{produto.descricao || 'Sem descrição.'}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80">
                      <div className="mb-3">
                        {discountPct > 0 ? (
                          <div>
                            <span className="text-xs text-slate-500 line-through mr-2">
                              R$ {produto.preco.toFixed(2)}
                            </span>
                            <span className="text-xl font-black text-emerald-400">
                              R$ {finalPrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-black text-white">
                            R$ {produto.preco.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(produto)}
                        disabled={produto.estoque <= 0}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                          produto.estoque > 0
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {produto.estoque > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold">Seu Carrinho</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-3">
                  <ShoppingCart className="w-12 h-12 mx-auto stroke-1" />
                  <p>Seu carrinho está vazio.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.produto.id} className="flex gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="w-16 h-16 bg-slate-900 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-800">
                      {getFotoSrc(item.produto.foto, item.produto.foto_tipo) ? (
                        <img
                          src={getFotoSrc(item.produto.foto, item.produto.foto_tipo)!}
                          alt={item.produto.nome}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : item.produto.foto_url ? (
                        <img src={item.produto.foto_url} alt={item.produto.nome} className="w-full h-full object-contain p-1" />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{item.produto.nome}</h4>
                      <p className="text-xs text-emerald-400 font-bold mt-0.5">
                        R$ {item.preco_final.toFixed(2)}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900">
                          <button
                            onClick={() => updateCartQuantity(item.produto.id, -1)}
                            className="p-1 hover:bg-slate-800 text-slate-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold">{item.quantidade}</span>
                          <button
                            onClick={() => updateCartQuantity(item.produto.id, 1)}
                            className="p-1 hover:bg-slate-800 text-slate-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.produto.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-800 bg-slate-950/80 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Cupom de Desconto</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: COMPFAST10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={applyCoupon}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-blue-400 rounded-lg transition"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Cupom {appliedCoupon.codigo} aplicado!
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-slate-800/80 pt-3 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Desconto Cupom</span>
                      <span>- R$ {couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                    <span>Total</span>
                    <span className="text-emerald-400">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                    setCheckoutStep('customer');
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 text-sm"
                >
                  Finalizar Compra <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {checkoutStep === 'customer' && (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">
                  Identificação do Cliente
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Total de Itens:</span>
                    <span className="text-white font-semibold">{cart.reduce((s, i) => s + i.quantidade, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white">
                    <span>Valor a Pagar:</span>
                    <span className="text-emerald-400">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-sm"
                >
                  {submittingOrder ? 'Processando Pedido...' : 'Confirmar e Finalizar Pedido'}
                </button>
              </form>
            )}

            {checkoutStep === 'success' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-bold text-white">Pedido Realizado com Sucesso!</h3>
                <p className="text-slate-300 text-sm">
                  Obrigado por comprar na CompFast. Seu pedido número <span className="text-blue-400 font-mono font-bold">#{completedOrderNumber}</span> foi registrado no sistema.
                </p>

                <div className="pt-4">
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition text-sm"
                  >
                    Voltar à Loja
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="border-t border-slate-800/80 bg-slate-900 py-8 mt-12 text-center text-xs text-slate-500">
        <p>© 2026 E-commerce CompFast - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
