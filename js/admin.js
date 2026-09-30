let adminState = {
  produtos: [],
  categorias: [],
  cupons: [],
  promocoes: [],
  vendas: [],
  clientes: [],
  fotoBase64Temp: null
};

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

async function initAdmin() {
  setupSubnav();
  setupModals();
  setupFormEvents();
  await carregarTudo();
}

function setupSubnav() {
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
      const secTarget = document.getElementById(`section-${target}`);
      if (secTarget) secTarget.classList.add('active');
    });
  });
}

function setupModals() {
  // Botões de fechar modal
  document.querySelectorAll('.close-modal, .modal-overlay').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
    });
  });

  // Botões de adicionar
  document.getElementById('btn-add-produto').addEventListener('click', () => abrirModalProduto());
  document.getElementById('btn-add-categoria').addEventListener('click', () => abrirModalCategoria());
  document.getElementById('btn-add-cupom').addEventListener('click', () => abrirModalCupom());
  document.getElementById('btn-add-promocao').addEventListener('click', () => abrirModalPromocao());
}

async function carregarTudo() {
  await Promise.all([
    carregarProdutos(),
    carregarCategorias(),
    carregarCupons(),
    carregarPromocoes(),
    carregarVendas(),
    carregarClientes()
  ]);
}

/* --- PRODUTOS --- */
async function carregarProdutos() {
  const { data } = await supabaseClient.from('produtos').select('*');
  if (data) adminState.produtos = data;
  renderTabelaProdutos();
}

function renderTabelaProdutos() {
  const tbody = document.getElementById('tbl-produtos');
  document.getElementById('prod-count').textContent = adminState.produtos.length;
  if (!tbody) return;

  if (adminState.produtos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Nenhum produto cadastrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  adminState.produtos.forEach(p => {
    const fotoSrc = getFotoSrc(p.foto);
    const catNome = adminState.categorias.find(c => c.id === p.categoria_id)?.nome || '-';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fotoSrc ? `<img src="${fotoSrc}" class="table-img">` : `📦`}</td>
      <td><strong>${p.nome}</strong> ${p.destaque ? `<span class="badge badge-highlight">Destaque</span>` : ''}</td>
      <td>${catNome}</td>
      <td>${formatCurrency(p.preco)}</td>
      <td><span class="badge badge-promo">${p.estoque || 0} un</span></td>
      <td><span class="badge badge-success">Ativo</span></td>
      <td class="actions-cell">
        <button class="btn btn-secondary btn-sm edit-btn">✏️ Editar</button>
        <button class="btn btn-danger btn-sm del-btn">🗑️ Excluir</button>
      </td>
    `;

    tr.querySelector('.edit-btn').addEventListener('click', () => abrirModalProduto(p));
    tr.querySelector('.del-btn').addEventListener('click', () => excluirProduto(p.id));

    tbody.appendChild(tr);
  });
}

function abrirModalProduto(produto = null) {
  const modal = document.getElementById('modal-produto');
  const title = document.getElementById('modal-produto-title');
  const selectCat = document.getElementById('p-categoria');

  // Popular select de categorias
  selectCat.innerHTML = '<option value="">-- Selecione --</option>';
  adminState.categorias.forEach(c => {
    selectCat.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
  });

  adminState.fotoBase64Temp = null;
  document.getElementById('p-foto-preview').innerHTML = '';

  if (produto) {
    title.textContent = 'Editar Produto';
    document.getElementById('p-id').value = produto.id;
    document.getElementById('p-nome').value = produto.nome;
    document.getElementById('p-categoria').value = produto.categoria_id || '';
    document.getElementById('p-preco').value = produto.preco;
    document.getElementById('p-estoque').value = produto.estoque || 0;
    document.getElementById('p-destaque').value = String(produto.destaque || false);
    document.getElementById('p-descricao').value = produto.descricao || '';

    const fotoSrc = getFotoSrc(produto.foto);
    if (fotoSrc) {
      document.getElementById('p-foto-preview').innerHTML = `<img src="${fotoSrc}">`;
      adminState.fotoBase64Temp = fotoSrc;
    }
  } else {
    title.textContent = 'Novo Produto';
    document.getElementById('form-produto').reset();
    document.getElementById('p-id').value = '';
  }

  modal.classList.add('open');
}

async function excluirProduto(id) {
  if (confirm('Deseja realmente excluir este produto?')) {
    await supabaseClient.from('produtos').delete().eq('id', id);
    carregarProdutos();
  }
}

/* --- CATEGORIAS --- */
async function carregarCategorias() {
  const { data } = await supabaseClient.from('categorias').select('*');
  if (data) adminState.categorias = data;
  renderTabelaCategorias();
}

function renderTabelaCategorias() {
  const tbody = document.getElementById('tbl-categorias');
  document.getElementById('cat-count').textContent = adminState.categorias.length;
  if (!tbody) return;

  if (adminState.categorias.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">Nenhuma categoria cadastrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  adminState.categorias.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${c.id}</td>
      <td><strong>${c.nome}</strong></td>
      <td>${c.descricao || '-'}</td>
      <td class="actions-cell">
        <button class="btn btn-secondary btn-sm edit-btn">✏️ Editar</button>
        <button class="btn btn-danger btn-sm del-btn">🗑️ Excluir</button>
      </td>
    `;

    tr.querySelector('.edit-btn').addEventListener('click', () => abrirModalCategoria(c));
    tr.querySelector('.del-btn').addEventListener('click', () => excluirCategoria(c.id));

    tbody.appendChild(tr);
  });
}

function abrirModalCategoria(categoria = null) {
  const modal = document.getElementById('modal-categoria');
  const title = document.getElementById('modal-categoria-title');

  if (categoria) {
    title.textContent = 'Editar Categoria';
    document.getElementById('cat-id').value = categoria.id;
    document.getElementById('cat-nome').value = categoria.nome;
    document.getElementById('cat-descricao').value = categoria.descricao || '';
  } else {
    title.textContent = 'Nova Categoria';
    document.getElementById('form-categoria').reset();
    document.getElementById('cat-id').value = '';
  }

  modal.classList.add('open');
}

async function excluirCategoria(id) {
  if (confirm('Deseja realmente excluir esta categoria?')) {
    await supabaseClient.from('categorias').delete().eq('id', id);
    carregarCategorias();
  }
}

/* --- CUPONS --- */
async function carregarCupons() {
  const { data } = await supabaseClient.from('cupons').select('*');
  if (data) adminState.cupons = data;
  renderTabelaCupons();
}

function renderTabelaCupons() {
  const tbody = document.getElementById('tbl-cupons');
  document.getElementById('cupom-count').textContent = adminState.cupons.length;
  if (!tbody) return;

  if (adminState.cupons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Nenhum cupom cadastrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  adminState.cupons.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color: var(--accent-blue);">${c.codigo}</strong></td>
      <td>${c.tipo === 'porcentagem' ? 'Porcentagem (%)' : 'Valor Fixo (R$)'}</td>
      <td><strong>${c.tipo === 'porcentagem' ? `${c.valor}%` : formatCurrency(c.valor)}</strong></td>
      <td>${c.valor_minimo ? formatCurrency(c.valor_minimo) : 'R$ 0,00'}</td>
      <td><span class="badge ${c.ativo ? 'badge-success' : 'badge-danger'}">${c.ativo ? 'Ativo' : 'Inativo'}</span></td>
      <td class="actions-cell">
        <button class="btn btn-secondary btn-sm edit-btn">✏️ Editar</button>
        <button class="btn btn-danger btn-sm del-btn">🗑️ Excluir</button>
      </td>
    `;

    tr.querySelector('.edit-btn').addEventListener('click', () => abrirModalCupom(c));
    tr.querySelector('.del-btn').addEventListener('click', () => excluirCupom(c.id));

    tbody.appendChild(tr);
  });
}

function abrirModalCupom(cupom = null) {
  const modal = document.getElementById('modal-cupom');
  const title = document.getElementById('modal-cupom-title');

  if (cupom) {
    title.textContent = 'Editar Cupom';
    document.getElementById('cup-id').value = cupom.id;
    document.getElementById('cup-codigo').value = cupom.codigo;
    document.getElementById('cup-tipo').value = cupom.tipo;
    document.getElementById('cup-valor').value = cupom.valor;
    document.getElementById('cup-minimo').value = cupom.valor_minimo || 0;
    document.getElementById('cup-ativo').value = String(cupom.ativo);
  } else {
    title.textContent = 'Novo Cupom';
    document.getElementById('form-cupom').reset();
    document.getElementById('cup-id').value = '';
  }

  modal.classList.add('open');
}

async function excluirCupom(id) {
  if (confirm('Deseja realmente excluir este cupom?')) {
    await supabaseClient.from('cupons').delete().eq('id', id);
    carregarCupons();
  }
}

/* --- PROMOÇÕES --- */
async function carregarPromocoes() {
  const { data } = await supabaseClient.from('promocoes').select('*');
  if (data) adminState.promocoes = data;
  renderTabelaPromocoes();
}

function renderTabelaPromocoes() {
  const tbody = document.getElementById('tbl-promocoes');
  document.getElementById('promo-count').textContent = adminState.promocoes.length;
  if (!tbody) return;

  if (adminState.promocoes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Nenhuma promoção cadastrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  adminState.promocoes.forEach(p => {
    let alvoText = 'Geral';
    if (p.produto_id) {
      const prod = adminState.produtos.find(item => item.id === p.produto_id);
      alvoText = prod ? `Produto: ${prod.nome}` : `Produto #${p.produto_id}`;
    } else if (p.categoria_id) {
      const cat = adminState.categorias.find(item => item.id === p.categoria_id);
      alvoText = cat ? `Categoria: ${cat.nome}` : `Categoria #${p.categoria_id}`;
    }

    const expirada = new Date(p.data_expiracao) < new Date();

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${p.nome}</strong></td>
      <td>${alvoText}</td>
      <td><span class="badge badge-promo">-${p.desconto_porcentagem}%</span></td>
      <td>${new Date(p.data_expiracao).toLocaleDateString('pt-BR')}</td>
      <td><span class="badge ${expirada ? 'badge-danger' : 'badge-success'}">${expirada ? 'Expirada' : 'Ativa'}</span></td>
      <td class="actions-cell">
        <button class="btn btn-secondary btn-sm edit-btn">✏️ Editar</button>
        <button class="btn btn-danger btn-sm del-btn">🗑️ Excluir</button>
      </td>
    `;

    tr.querySelector('.edit-btn').addEventListener('click', () => abrirModalPromocao(p));
    tr.querySelector('.del-btn').addEventListener('click', () => excluirPromocao(p.id));

    tbody.appendChild(tr);
  });
}

function abrirModalPromocao(promocao = null) {
  const modal = document.getElementById('modal-promocao');
  const title = document.getElementById('modal-promocao-title');
  const selectProd = document.getElementById('promo-produto');
  const selectCat = document.getElementById('promo-categoria');

  // Popular selects
  selectProd.innerHTML = '<option value="">-- Todos ou por Categoria --</option>';
  adminState.produtos.forEach(p => {
    selectProd.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
  });

  selectCat.innerHTML = '<option value="">-- Nenhuma / Apenas Produto --</option>';
  adminState.categorias.forEach(c => {
    selectCat.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
  });

  if (promocao) {
    title.textContent = 'Editar Promoção';
    document.getElementById('promo-id').value = promocao.id;
    document.getElementById('promo-nome').value = promocao.nome;
    document.getElementById('promo-desconto').value = promocao.desconto_porcentagem;
    document.getElementById('promo-expiracao').value = promocao.data_expiracao ? promocao.data_expiracao.split('T')[0] : '';
    document.getElementById('promo-produto').value = promocao.produto_id || '';
    document.getElementById('promo-categoria').value = promocao.categoria_id || '';
  } else {
    title.textContent = 'Nova Promoção';
    document.getElementById('form-promocao').reset();
    document.getElementById('promo-id').value = '';
  }

  modal.classList.add('open');
}

async function excluirPromocao(id) {
  if (confirm('Deseja realmente excluir esta promoção?')) {
    await supabaseClient.from('promocoes').delete().eq('id', id);
    carregarPromocoes();
  }
}

/* --- VENDAS --- */
async function carregarVendas() {
  const { data } = await supabaseClient.from('vendas').select('*, clientes(nome, email)');
  if (data) adminState.vendas = data;
  renderTabelaVendas();
}

function renderTabelaVendas() {
  const tbody = document.getElementById('tbl-vendas');
  document.getElementById('venda-count').textContent = adminState.vendas.length;
  if (!tbody) return;

  if (adminState.vendas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Nenhuma venda registrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  adminState.vendas.forEach(v => {
    const clienteNome = v.clientes ? v.clientes.nome : `Cliente #${v.cliente_id}`;
    const dataFmt = v.data_venda ? new Date(v.data_venda).toLocaleString('pt-BR') : '-';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${v.id}</td>
      <td><strong>${clienteNome}</strong></td>
      <td>${dataFmt}</td>
      <td><strong>${formatCurrency(v.total)}</strong></td>
      <td>
        <select class="status-select" data-id="${v.id}">
          <option value="Pendente" ${v.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
          <option value="Pago" ${v.status === 'Pago' ? 'selected' : ''}>Pago</option>
          <option value="Cancelado" ${v.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
        </select>
      </td>
      <td>
        <button class="btn btn-secondary btn-sm status-save-btn">Salvar Status</button>
      </td>
    `;

    tr.querySelector('.status-save-btn').addEventListener('click', async () => {
      const select = tr.querySelector('.status-select');
      await supabaseClient.from('vendas').update({ status: select.value }).eq('id', v.id);
      alert('Status atualizado!');
      carregarVendas();
    });

    tbody.appendChild(tr);
  });
}

/* --- CLIENTES --- */
async function carregarClientes() {
  const { data } = await supabaseClient.from('clientes').select('*');
  if (data) adminState.clientes = data;
  renderTabelaClientes();
}

function renderTabelaClientes() {
  const tbody = document.getElementById('tbl-clientes');
  document.getElementById('cliente-count').textContent = adminState.clientes.length;
  if (!tbody) return;

  if (adminState.clientes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Nenhum cliente cadastrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  adminState.clientes.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${c.id}</td>
      <td><strong>${c.nome}</strong></td>
      <td>${c.email}</td>
      <td>${c.telefone || '-'}</td>
      <td>${c.cpf || '-'}</td>
      <td>${c.endereco || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* --- EVENTOS DOS FORMULÁRIOS --- */
function setupFormEvents() {
  // Upload de Foto Produto
  document.getElementById('p-foto').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        adminState.fotoBase64Temp = evt.target.result;
        document.getElementById('p-foto-preview').innerHTML = `<img src="${evt.target.result}">`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Submit Produto
  document.getElementById('form-produto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('p-id').value;
    const nome = document.getElementById('p-nome').value;
    const categoria_id = document.getElementById('p-categoria').value || null;
    const preco = parseFloat(document.getElementById('p-preco').value);
    const estoque = parseInt(document.getElementById('p-estoque').value);
    const destaque = document.getElementById('p-destaque').value === 'true';
    const descricao = document.getElementById('p-descricao').value;

    const payload = {
      nome,
      categoria_id,
      preco,
      estoque,
      destaque,
      descricao
    };

    if (adminState.fotoBase64Temp) {
      payload.foto = adminState.fotoBase64Temp;
    }

    if (id) {
      await supabaseClient.from('produtos').update(payload).eq('id', id);
    } else {
      await supabaseClient.from('produtos').insert([payload]);
    }

    document.getElementById('modal-produto').classList.remove('open');
    carregarProdutos();
  });

  // Submit Categoria
  document.getElementById('form-categoria').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cat-id').value;
    const nome = document.getElementById('cat-nome').value;
    const descricao = document.getElementById('cat-descricao').value;

    if (id) {
      await supabaseClient.from('categorias').update({ nome, descricao }).eq('id', id);
    } else {
      await supabaseClient.from('categorias').insert([{ nome, descricao }]);
    }

    document.getElementById('modal-categoria').classList.remove('open');
    carregarCategorias();
  });

  // Submit Cupom
  document.getElementById('form-cupom').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('cup-id').value;
    const codigo = document.getElementById('cup-codigo').value.toUpperCase();
    const tipo = document.getElementById('cup-tipo').value;
    const valor = parseFloat(document.getElementById('cup-valor').value);
    const valor_minimo = parseFloat(document.getElementById('cup-minimo').value) || 0;
    const ativo = document.getElementById('cup-ativo').value === 'true';

    const payload = { codigo, tipo, valor, valor_minimo, ativo };

    if (id) {
      await supabaseClient.from('cupons').update(payload).eq('id', id);
    } else {
      await supabaseClient.from('cupons').insert([payload]);
    }

    document.getElementById('modal-cupom').classList.remove('open');
    carregarCupons();
  });

  // Submit Promoção
  document.getElementById('form-promocao').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('promo-id').value;
    const nome = document.getElementById('promo-nome').value;
    const desconto_porcentagem = parseFloat(document.getElementById('promo-desconto').value);
    const data_expiracao = new Date(document.getElementById('promo-expiracao').value).toISOString();
    const produto_id = document.getElementById('promo-produto').value || null;
    const categoria_id = document.getElementById('promo-categoria').value || null;

    const payload = { nome, desconto_porcentagem, data_expiracao, produto_id, categoria_id };

    if (id) {
      await supabaseClient.from('promocoes').update(payload).eq('id', id);
    } else {
      await supabaseClient.from('promocoes').insert([payload]);
    }

    document.getElementById('modal-promocao').classList.remove('open');
    carregarPromocoes();
  });
}
