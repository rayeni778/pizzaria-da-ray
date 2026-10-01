/* ===== Utilitários (dados salvos no navegador via localStorage) ===== */
const ler = (k, padrao) => { try { return JSON.parse(localStorage.getItem(k)) ?? padrao; } catch { return padrao; } };
const gravar = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const sessao = () => ler('sessao', null);              // e-mail do usuário logado
const usuarioAtual = () => ler('usuarios', []).find(u => u.email === sessao());

function toast(texto) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = texto;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ===== Cardápio ===== */
const CARDAPIO = [
  { id: 1,  cat: 'Pizzas',      emoji: '🍕', nome: 'Margherita',      desc: 'Molho de tomate, mussarela, manjericão fresco.', preco: 42 },
  { id: 2,  cat: 'Pizzas',      emoji: '🍕', nome: 'Calabresa',       desc: 'Calabresa fatiada, cebola e azeitonas.', preco: 46 },
  { id: 3,  cat: 'Pizzas',      emoji: '🧀', nome: 'Quatro Queijos',  desc: 'Mussarela, provolone, gorgonzola e parmesão.', preco: 52 },
  { id: 4,  cat: 'Pizzas',      emoji: '🍕', nome: 'Portuguesa',      desc: 'Presunto, ovo, cebola, ervilha e mussarela.', preco: 54 },
  { id: 5,  cat: 'Hambúrgueres', emoji: '🍔', nome: 'Clássico',       desc: 'Blend 150 g, queijo, alface, tomate e maionese da casa.', preco: 28 },
  { id: 6,  cat: 'Hambúrgueres', emoji: '🥓', nome: 'Cheddar Bacon',  desc: 'Blend 150 g, cheddar cremoso e bacon crocante.', preco: 34 },
  { id: 7,  cat: 'Hambúrgueres', emoji: '🍔', nome: 'Duplo Smash',    desc: 'Dois smash de 90 g, queijo prato e picles.', preco: 38 },
  { id: 8,  cat: 'Hambúrgueres', emoji: '🥬', nome: 'Veggie',         desc: 'Hambúrguer de grão-de-bico, rúcula e tomate seco.', preco: 30 },
  { id: 9,  cat: 'Bebidas',     emoji: '🥤', nome: 'Refrigerante lata', desc: 'Cola, guaraná ou limão. 350 ml.', preco: 6 },
  { id: 10, cat: 'Bebidas',     emoji: '🍊', nome: 'Suco natural',    desc: 'Laranja ou limão, 400 ml.', preco: 9 },
  { id: 11, cat: 'Bebidas',     emoji: '🍺', nome: 'Cerveja long neck', desc: 'Gelada, 330 ml.', preco: 12 },
  { id: 12, cat: 'Sobremesas',  emoji: '🍫', nome: 'Brownie',         desc: 'Brownie de chocolate com sorvete de creme.', preco: 14 },
  { id: 13, cat: 'Sobremesas',  emoji: '🍰', nome: 'Petit gâteau',    desc: 'Chocolate com recheio cremoso.', preco: 18 },
];

/* ===== Carrinho ===== */
const carrinho = () => ler('carrinho', []);          // [{id, qtd}]
const totalCarrinho = () => carrinho().reduce((s, i) => s + CARDAPIO.find(p => p.id === i.id).preco * i.qtd, 0);

function adicionar(id) {
  const c = carrinho();
  const item = c.find(i => i.id === id);
  item ? item.qtd++ : c.push({ id, qtd: 1 });
  gravar('carrinho', c);
  atualizarCarrinho();
  toast('Item adicionado ao carrinho');
}
function alterarQtd(id, delta) {
  let c = carrinho();
  const item = c.find(i => i.id === id);
  item.qtd += delta;
  c = c.filter(i => i.qtd > 0);
  gravar('carrinho', c);
  atualizarCarrinho();
}

function montarGaveta() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="fundo-gaveta" id="fundo"></div>
    <aside class="gaveta" id="gaveta" aria-label="Carrinho de compras">
      <header><h2>Seu pedido</h2><button class="fechar" id="fechar" aria-label="Fechar carrinho">×</button></header>
      <div class="lista-carrinho" id="lista-carrinho"></div>
      <div class="total"><span>Total</span><span id="total"></span></div>
      <p class="entrega" id="entrega"></p>
      <button class="btn" id="finalizar">Finalizar pedido</button>
    </aside>`);
  const alternar = abrir => {
    document.getElementById('gaveta').classList.toggle('aberta', abrir);
    document.getElementById('fundo').classList.toggle('aberto', abrir);
  };
  document.getElementById('fechar').onclick = () => alternar(false);
  document.getElementById('fundo').onclick = () => alternar(false);
  document.getElementById('finalizar').onclick = finalizarPedido;
  document.addEventListener('click', e => { if (e.target.closest('#abrir-carrinho')) alternar(true); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') alternar(false); });
}

function atualizarCarrinho() {
  const c = carrinho();
  const lista = document.getElementById('lista-carrinho');
  const qtdTotal = c.reduce((s, i) => s + i.qtd, 0);
  const badge = document.getElementById('contador');
  if (badge) badge.textContent = qtdTotal;

  lista.innerHTML = c.length ? c.map(i => {
    const p = CARDAPIO.find(x => x.id === i.id);
    return `<div class="linha-item">
      <strong>${p.nome}</strong><span>${brl(p.preco * i.qtd)}</span>
      <div class="qtd">
        <button data-id="${i.id}" data-d="-1" aria-label="Diminuir">−</button>
        <span>${i.qtd}</span>
        <button data-id="${i.id}" data-d="1" aria-label="Aumentar">+</button>
      </div></div>`;
  }).join('') : '<p class="vazio">Seu carrinho está vazio. Escolha um item do cardápio.</p>';

  lista.querySelectorAll('button').forEach(b =>
    b.onclick = () => alterarQtd(Number(b.dataset.id), Number(b.dataset.d)));

  document.getElementById('total').textContent = brl(totalCarrinho());
  const u = usuarioAtual();
  document.getElementById('entrega').textContent = u
    ? `Entrega em: ${u.rua}, ${u.numero} - ${u.bairro}, ${u.cidade}`
    : 'Para finalizar, crie uma conta e faça login com seu endereço de entrega.';
}

function finalizarPedido() {
  if (!carrinho().length) return toast('Adicione itens antes de finalizar.');
  const u = usuarioAtual();
  if (!u) {                                   // sem login → cadastro → login
    toast('Crie sua conta para finalizar o pedido.');
    setTimeout(() => location.href = 'cadastro.html', 1200);
    return;
  }
  const pedidos = ler('pedidos', []);
  pedidos.push({
    email: u.email,
    data: new Date().toLocaleString('pt-BR'),
    itens: carrinho().map(i => ({ ...CARDAPIO.find(p => p.id === i.id), qtd: i.qtd })),
    total: totalCarrinho(),
    endereco: `${u.rua}, ${u.numero} - ${u.bairro}, ${u.cidade}`,
  });
  gravar('pedidos', pedidos);
  gravar('carrinho', []);
  toast('Pedido enviado! Acompanhe em "Minha conta".');
  setTimeout(() => location.href = 'conta.html', 1500);
}

/* ===== Menu de navegação (muda se estiver logado) ===== */
function montarNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const u = usuarioAtual();
  nav.innerHTML = `
    <a href="index.html">Cardápio</a>
    ${u ? '<a href="conta.html">Minha conta</a><button id="sair">Sair</button>'
        : '<a href="login.html">Entrar</a><a href="cadastro.html">Criar conta</a>'}
    <button class="cart-btn" id="abrir-carrinho">Carrinho (<span id="contador">0</span>)</button>`;
  const sair = document.getElementById('sair');
  if (sair) sair.onclick = () => { localStorage.removeItem('sessao'); location.href = 'index.html'; };
}

/* ===== Página inicial ===== */
function paginaIndex() {
  const cats = ['Todos', ...new Set(CARDAPIO.map(p => p.cat))];
  const filtros = document.getElementById('filtros');
  const grade = document.getElementById('grade');

  function desenhar(cat) {
    filtros.innerHTML = cats.map(c => `<button class="${c === cat ? 'ativo' : ''}" data-cat="${c}">${c}</button>`).join('');
    filtros.querySelectorAll('button').forEach(b => b.onclick = () => desenhar(b.dataset.cat));
    grade.innerHTML = CARDAPIO.filter(p => cat === 'Todos' || p.cat === cat).map(p => `
      <article class="item">
        <div class="foto" aria-hidden="true">${p.emoji}</div>
        <div class="info">
          <h3>${p.nome}</h3><p>${p.desc}</p>
          <div class="preco"><strong>${brl(p.preco)}</strong>
            <button class="btn" data-add="${p.id}">Adicionar</button></div>
        </div>
      </article>`).join('');
    grade.querySelectorAll('[data-add]').forEach(b => b.onclick = () => adicionar(Number(b.dataset.add)));
  }
  desenhar('Todos');
}

/* ===== Cadastro ===== */
function paginaCadastro() {
  const form = document.getElementById('form-cadastro');
  const msg = document.getElementById('msg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    Object.keys(d).forEach(k => d[k] = d[k].trim());
    d.email = d.email.toLowerCase();
    if (Object.values(d).some(v => !v)) { msg.className = 'msg erro'; msg.textContent = 'Preencha todos os campos.'; return; }
    if (d.senha.length < 6) { msg.className = 'msg erro'; msg.textContent = 'A senha precisa ter pelo menos 6 caracteres.'; return; }
    const usuarios = ler('usuarios', []);
    if (usuarios.some(u => u.email === d.email)) {
      msg.className = 'msg erro'; msg.textContent = 'Este e-mail já está cadastrado. Vá para a tela de login.'; return;
    }
    usuarios.push(d);
    gravar('usuarios', usuarios);
    msg.className = 'msg ok'; msg.textContent = 'Conta criada! Redirecionando para o login...';
    setTimeout(() => location.href = 'login.html', 1200);
  });
}

/* ===== Login ===== */
function paginaLogin() {
  const form = document.getElementById('form-login');
  const msg = document.getElementById('msg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.email.value.trim().toLowerCase();
    const u = ler('usuarios', []).find(x => x.email === email && x.senha === form.senha.value);
    if (!u) { msg.className = 'msg erro'; msg.textContent = 'E-mail ou senha incorretos.'; return; }
    gravar('sessao', u.email);
    location.href = 'conta.html';
  });
}

/* ===== Site oficial após login ===== */
function paginaConta() {
  const u = usuarioAtual();
  if (!u) { location.href = 'login.html'; return; }       // área protegida
  document.getElementById('ola').textContent = `Olá, ${u.nome.split(' ')[0]}!`;
  document.getElementById('dados').innerHTML = `
    <dt>Nome</dt><dd>${u.nome}</dd>
    <dt>E-mail</dt><dd>${u.email}</dd>
    <dt>Telefone</dt><dd>${u.telefone}</dd>
    <dt>Endereço</dt><dd>${u.rua}, ${u.numero} - ${u.bairro}, ${u.cidade}</dd>`;
  const meus = ler('pedidos', []).filter(p => p.email === u.email).reverse();
  document.getElementById('pedidos').innerHTML = meus.length
    ? meus.map(p => `<div class="pedido"><strong>${brl(p.total)}</strong> <small>· ${p.data}</small><br>
        ${p.itens.map(i => `${i.qtd}× ${i.nome}`).join(', ')}</div>`).join('')
    : '<p class="vazio">Você ainda não fez pedidos.</p>';
}

/* ===== Inicialização ===== */
document.addEventListener('DOMContentLoaded', () => {
  const pagina = document.body.dataset.page;
  if (pagina === 'index' || pagina === 'conta') { montarNav(); montarGaveta(); atualizarCarrinho(); }
  if (pagina === 'index') paginaIndex();
  if (pagina === 'cadastro') paginaCadastro();
  if (pagina === 'login') paginaLogin();
  if (pagina === 'conta') paginaConta();
});
