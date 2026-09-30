// Estado global da aplicação do cliente
let state = {
  produtos: [],
  categorias: [],
  promocoes: [],
  cupons: [],
  carrinho: [],
  categoriaSelecionada: 'all',
  termoBusca: '',
  cupomAplicado: null
};

// Elementos do DOM
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  setupEventListeners();
  await carregarDados();
}

function setupEventListeners() {
  // Pesquisa
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.termoBusca = e.target.value.toLowerCase();
      renderProdutos();
    });
  }

  // Drawer do Carrinho
  const cartBtn = document.getElementById('cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartOverlay = document.getElementById('cart-overlay');

  if (cartBtn) cartBtn.addEventListener('click', toggleCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
  if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

  // Cupom
  const applyCouponBtn = document.getElementById('apply-coupon-btn');
  if (applyCouponBtn) applyCouponBtn.addEventListener('click', aplicarCupom);

  // Checkout Modal
  const checkoutBtn = document.getElementById('checkout-btn');
  const closeCheckoutBtn = document.getElementById('close-checkout-btn');
  const cancelCheckoutBtn = document.getElementById('cancel-checkout-btn');
  const checkoutOverlay = document.getElementById('checkout-overlay');
  const checkoutForm = document.getElementById('checkout-form');

  if (checkoutBtn) checkoutBtn.addEventListener('click', abrirModalCheckout);
  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', fecharModalCheckout);
  if (cancelCheckoutBtn) cancelCheckoutBtn.addEventListener('click', fecharModalCheckout);
  if (checkoutOverlay) checkoutOverlay.addEventListener('click', fecharModalCheckout);
  if (checkoutForm) checkoutForm.addEventListener('submit', finalizarPedido);
}

async function carregarDados() {
  try {
    const [resCat, resProd, resPromo, resCupom] = await Promise.all([
      supabaseClient.from('categorias').select('*'),
      supabaseClient.from('produtos').select('*'),
      supabaseClient.from('promocoes').select('*'),
      supabaseClient.from('cupons').select('*')
    ]);

    if (resCat.data) state.categorias = resCat.data;
    if (resProd.data) state.produtos = resProd.data;
    if (resPromo.data) state.promocoes = resPromo.data;
    if (resCupom.data) state.cupons = resCupom.data;

    renderCategorias();
    renderProdutos();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

function renderCategorias() {
  const tabsContainer = document.getElementById('categories-tabs');
  if (!tabsContainer) return;

  tabsContainer.innerHTML = `
    <button class="cat-tab ${state.categoriaSelecionada === 'all' ? 'active' : ''}" data-id="all">Todas as Categorias</button>
  `;

  state.categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-tab ${state.categoriaSelecionada === String(cat.id) ? 'active' : ''}`;
    btn.dataset.id = cat.id;
    btn.textContent = cat.nome;
    tabsContainer.appendChild(btn);
  });

  // Events nas tabs
  tabsContainer.querySelectorAll('.cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      tabsContainer.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.categoriaSelecionada = btn.dataset.id;
      renderProdutos();
    });
  });
}

function calcularDescontoProduto(produto) {
  const agora = new Date();
  const promosValidas = state.promocoes.filter(p => new Date(p.data_expiracao) > agora);

  let maiorDesconto = 0;

  promosValidas.forEach(p => {
    if (p.produto_id && p.produto_id === produto.id) {
      if (p.desconto_porcentagem > maiorDesconto) maiorDesconto = p.desconto_porcentagem;
    } else if (p.categoria_id && p.categoria_id === produto.categoria_id) {
      if (p.desconto_porcentagem > maiorDesconto) maiorDesconto = p.desconto_porcentagem;
    }
  });

  if (maiorDesconto > 0) {
    const precoComDesconto = produto.preco * (1 - maiorDesconto / 100);
    return {
      temDesconto: true,
      descontoPorcentagem: maiorDesconto,
      precoOriginal: produto.preco,
      precoFinal: precoComDesconto
    };
  }

  return {
    temDesconto: false,
    precoOriginal: produto.preco,
    precoFinal: produto.preco
  };
}

function renderProdutos() {
  const grid = document.getElementById('products-grid');
  const title = document.getElementById('section-title');
  if (!grid) return;

  let filtrados = state.produtos.filter(p => {
    const bateCategoria = state.categoriaSelecionada === 'all' || String(p.categoria_id) === state.categoriaSelecionada;
    const bateBusca = !state.termoBusca || p.nome.toLowerCase().includes(state.termoBusca) || (p.descricao && p.descricao.toLowerCase().includes(state.termoBusca));
    return bateCategoria && bateBusca;
  });

  if (title) {
    title.textContent = `📦 Produtos Disponíveis (${filtrados.length})`;
  }

  if (filtrados.length === 0) {
    grid.innerHTML = `<div class="text-center" style="grid-column: 1/-1; padding: 3rem; color: var(--text-secondary);">Nenhum produto encontrado.</div>`;
    return;
  }

  grid.innerHTML = '';
  filtrados.forEach(prod => {
    const calc = calcularDescontoProduto(prod);
    const fotoSrc = getFotoSrc(prod.foto);
    const catNome = state.categorias.find(c => c.id === prod.categoria_id)?.nome || 'Eletrônicos';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image-container">
        ${fotoSrc ? `<img src="${fotoSrc}" alt="${prod.nome}" class="product-image">` : `<div class="product-image-placeholder">📦</div>`}
        <div class="product-badges">
          ${calc.temDesconto ? `<span class="badge badge-promo">-${calc.descontoPorcentagem}%</span>` : ''}
          ${prod.destaque ? `<span class="badge badge-highlight">Destaque</span>` : ''}
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${catNome}</span>
        <h3 class="product-title">${prod.nome}</h3>
        <p class="product-description">${prod.descricao || ''}</p>
        <div class="product-footer">
          <div class="product-prices">
            ${calc.temDesconto ? `<span class="old-price">${formatCurrency(calc.precoOriginal)}</span>` : ''}
            <span class="current-price">${formatCurrency(calc.precoFinal)}</span>
          </div>
          <button class="btn btn-primary add-cart-btn" data-id="${prod.id}">+ Adicionar</button>
        </div>
      </div>
    `;

    card.querySelector('.add-cart-btn').addEventListener('click', () => adicionarAoCarrinho(prod));
    grid.appendChild(card);
  });
}

function adicionarAoCarrinho(produto) {
  const itemExistente = state.carrinho.find(item => item.id === produto.id);
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    state.carrinho.push({
      ...produto,
      quantidade: 1
    });
  }

  atualizarCarrinho();
  toggleCart(true);
}

function atualizarCarrinho() {
  const cartCountBadge = document.getElementById('cart-count-badge');
  const cartItemsCount = document.getElementById('cart-items-count');
  const cartList = document.getElementById('cart-items-list');

  const totalItens = state.carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  if (cartCountBadge) cartCountBadge.textContent = totalItens;
  if (cartItemsCount) cartItemsCount.textContent = totalItens;

  if (!cartList) return;

  if (state.carrinho.length === 0) {
    cartList.innerHTML = `<div class="text-center" style="padding: 2rem; color: var(--text-secondary);">Seu carrinho está vazio.</div>`;
    renderResumoCarrinho();
    return;
  }

  cartList.innerHTML = '';
  state.carrinho.forEach(item => {
    const calc = calcularDescontoProduto(item);
    const fotoSrc = getFotoSrc(item.foto);

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      ${fotoSrc ? `<img src="${fotoSrc}" class="cart-item-img">` : `<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;">📦</div>`}
      <div class="cart-item-details">
        <div class="cart-item-title">${item.nome}</div>
        <div class="cart-item-price">${formatCurrency(calc.precoFinal)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn dec-btn">-</button>
          <span>${item.quantidade}</span>
          <button class="qty-btn inc-btn">+</button>
        </div>
      </div>
      <button class="btn-icon rem-btn" style="color: var(--accent-red);">&times;</button>
    `;

    div.querySelector('.dec-btn').addEventListener('click', () => alterarQtdItem(item.id, -1));
    div.querySelector('.inc-btn').addEventListener('click', () => alterarQtdItem(item.id, 1));
    div.querySelector('.rem-btn').addEventListener('click', () => removerItemCarrinho(item.id));

    cartList.appendChild(div);
  });

  renderResumoCarrinho();
}

function alterarQtdItem(id, delta) {
  const item = state.carrinho.find(i => i.id === id);
  if (!item) return;

  item.quantidade += delta;
  if (item.quantidade <= 0) {
    removerItemCarrinho(id);
  } else {
    atualizarCarrinho();
  }
}

function removerItemCarrinho(id) {
  state.carrinho = state.carrinho.filter(i => i.id !== id);
  atualizarCarrinho();
}

function renderResumoCarrinho() {
  const subtotal = state.carrinho.reduce((acc, item) => {
    const calc = calcularDescontoProduto(item);
    return acc + (calc.precoFinal * item.quantidade);
  }, 0);

  let valorDesconto = 0;
  if (state.cupomAplicado) {
    if (state.cupomAplicado.tipo === 'porcentagem') {
      valorDesconto = subtotal * (state.cupomAplicado.valor / 100);
    } else {
      valorDesconto = state.cupomAplicado.valor;
    }
  }

  const total = Math.max(0, subtotal - valorDesconto);

  document.getElementById('cart-subtotal').textContent = formatCurrency(subtotal);

  const discountRow = document.getElementById('discount-row');
  const discountLabel = document.getElementById('discount-label');
  const cartDiscount = document.getElementById('cart-discount');

  if (state.cupomAplicado && valorDesconto > 0) {
    discountRow.classList.remove('hidden');
    discountLabel.textContent = state.cupomAplicado.codigo;
    cartDiscount.textContent = `-${formatCurrency(valorDesconto)}`;
  } else {
    discountRow.classList.add('hidden');
  }

  document.getElementById('cart-total').textContent = formatCurrency(total);
}

function aplicarCupom() {
  const input = document.getElementById('coupon-input');
  const msg = document.getElementById('coupon-message');
  if (!input || !msg) return;

  const codigo = input.value.trim().toUpperCase();
  if (!codigo) {
    msg.textContent = 'Informe o código do cupom';
    msg.className = 'coupon-msg error';
    return;
  }

  const cupom = state.cupons.find(c => c.codigo.toUpperCase() === codigo && c.ativo);
  if (!cupom) {
    msg.textContent = 'Cupom inválido ou expirado';
    msg.className = 'coupon-msg error';
    state.cupomAplicado = null;
    renderResumoCarrinho();
    return;
  }

  const subtotal = state.carrinho.reduce((acc, item) => {
    const calc = calcularDescontoProduto(item);
    return acc + (calc.precoFinal * item.quantidade);
  }, 0);

  if (cupom.valor_minimo && subtotal < cupom.valor_minimo) {
    msg.textContent = `Valor mínimo para este cupom: ${formatCurrency(cupom.valor_minimo)}`;
    msg.className = 'coupon-msg error';
    state.cupomAplicado = null;
    renderResumoCarrinho();
    return;
  }

  state.cupomAplicado = cupom;
  msg.textContent = `Cupom ${cupom.codigo} aplicado com sucesso!`;
  msg.className = 'coupon-msg success';
  renderResumoCarrinho();
}

function toggleCart(forceOpen) {
  const drawer = document.getElementById('cart-drawer');
  if (!drawer) return;

  if (typeof forceOpen === 'boolean') {
    if (forceOpen) drawer.classList.add('open');
    else drawer.classList.remove('open');
  } else {
    drawer.classList.toggle('open');
  }
}

function abrirModalCheckout() {
  if (state.carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }
  toggleCart(false);
  document.getElementById('checkout-modal').classList.add('open');
}

function fecharModalCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
}

async function finalizarPedido(e) {
  e.preventDefault();

  const nome = document.getElementById('c-nome').value;
  const email = document.getElementById('c-email').value;
  const telefone = document.getElementById('c-telefone').value;
  const cpf = document.getElementById('c-cpf').value;
  const endereco = document.getElementById('c-endereco').value;

  try {
    // 1. Cadastrar ou buscar cliente
    let clienteId = null;
    const { data: clienteExistente } = await supabaseClient
      .from('clientes')
      .select('id')
      .eq('email', email)
      .single();

    if (clienteExistente) {
      clienteId = clienteExistente.id;
    } else {
      const { data: novoCliente, error: errCliente } = await supabaseClient
        .from('clientes')
        .insert([{ nome, email, telefone, cpf, endereco }])
        .select('id')
        .single();

      if (errCliente) throw errCliente;
      clienteId = novoCliente.id;
    }

    // 2. Calcular totais
    const subtotal = state.carrinho.reduce((acc, item) => {
      const calc = calcularDescontoProduto(item);
      return acc + (calc.precoFinal * item.quantidade);
    }, 0);

    let valorDesconto = 0;
    if (state.cupomAplicado) {
      if (state.cupomAplicado.tipo === 'porcentagem') {
        valorDesconto = subtotal * (state.cupomAplicado.valor / 100);
      } else {
        valorDesconto = state.cupomAplicado.valor;
      }
    }

    const total = Math.max(0, subtotal - valorDesconto);

    // 3. Criar venda
    const { data: venda, error: errVenda } = await supabaseClient
      .from('vendas')
      .insert([{
        cliente_id: clienteId,
        data_venda: new Date().toISOString(),
        subtotal,
        desconto: valorDesconto,
        total,
        cupom_codigo: state.cupomAplicado ? state.cupomAplicado.codigo : null,
        status: 'Pendente'
      }])
      .select('id')
      .single();

    if (errVenda) throw errVenda;

    // 4. Criar itens da venda e atualizar estoque
    for (const item of state.carrinho) {
      const calc = calcularDescontoProduto(item);
      await supabaseClient.from('itens_venda').insert([{
        venda_id: venda.id,
        produto_id: item.id,
        quantidade: item.quantidade,
        preco_unitario: calc.precoFinal,
        subtotal: calc.precoFinal * item.quantidade
      }]);

      if (item.estoque !== undefined) {
        await supabaseClient
          .from('produtos')
          .update({ estoque: Math.max(0, item.estoque - item.quantidade) })
          .eq('id', item.id);
      }
    }

    alert(`Pedido #${venda.id} realizado com sucesso! Obrigado pela compra.`);
    state.carrinho = [];
    state.cupomAplicado = null;
    atualizarCarrinho();
    fecharModalCheckout();
    carregarDados();
  } catch (err) {
    console.error('Erro ao finalizar pedido:', err);
    alert('Erro ao processar o pedido. Tente novamente.');
  }
}
