/* ══════════════════════════════════════════
   CHIKARELLA — app.js v6
   Template adaptable para cualquier marca
══════════════════════════════════════════ */

// ══ DEFAULTS ══
var DEFAULT_CFG = {
  brand: 'Chikarella',
  tagline: 'Moda Femenina Premium',
  wa: '51999999999',
  phone: '+51 999 999 999',
  email: 'chikarella@gmail.com',
  maypass: 'mayor2025',
  adminUser: 'admin',
  adminPass: 'chikarella2025',
  tiktok: 'https://tiktok.com/@chikarella',
  instagram: 'https://instagram.com/chikarella',
  facebook: 'https://facebook.com/chikarella',
  store1: 'Jirón Gamarra 1159, Galería Augusto Allca, Tienda 172',
  store2: 'Damero, Sótano 2, Tienda 009'
};

var DEFAULT_BANNER = {
  eyebrow: 'Nueva Colección 2025',
  title: 'La moda que te hace brillar',
  sub: 'Prendas exclusivas para la mujer moderna. Calidad premium directo desde Gamarra, Lima.',
  heroImages: [
    'assets/images/product_01.jpg',
    'assets/images/product_03.jpg',
    'assets/images/product_07.jpg',
    'assets/images/product_09.jpg'
  ],
  heroImgData: [null, null, null, null]
};

// ══ STATE ══
var prods = [];
var cfg = {};
var banner = {};
var analytics = {};
var isMay = false;
var curProd = null;
var heroImgEdits = [null, null, null, null];

// ══ ANALYTICS ══
function initAnalytics() {
  try {
    var saved = localStorage.getItem('chk_analytics');
    analytics = saved ? JSON.parse(saved) : { views: 0, buys: 0, byProduct: {}, sessions: 0, lastReset: new Date().toLocaleDateString('es-PE') };
  } catch(e) {
    analytics = { views: 0, buys: 0, byProduct: {}, sessions: 0, lastReset: '-' };
  }
  // Count session
  analytics.sessions = (analytics.sessions || 0) + 1;
  analytics.views = (analytics.views || 0) + 1;
  saveAnalytics();
  updateProofBadges();
}
function saveAnalytics() {
  localStorage.setItem('chk_analytics', JSON.stringify(analytics));
}
function trackBuy(id, name) {
  analytics.buys = (analytics.buys || 0) + 1;
  if (!analytics.byProduct) analytics.byProduct = {};
  analytics.byProduct[id] = analytics.byProduct[id] || { name: name, views: 0, buys: 0 };
  analytics.byProduct[id].buys++;
  saveAnalytics();
  updateProofBadges();
  // Simulate ticker event
  addTickerEvent('compra', name);
}
function trackView(id, name) {
  if (!analytics.byProduct) analytics.byProduct = {};
  analytics.byProduct[id] = analytics.byProduct[id] || { name: name, views: 0, buys: 0 };
  analytics.byProduct[id].views++;
  saveAnalytics();
}
function resetAnalytics() {
  analytics = { views: 0, buys: 0, byProduct: {}, sessions: 0, lastReset: new Date().toLocaleDateString('es-PE') };
  saveAnalytics();
  renderStats();
  updateProofBadges();
}
function updateProofBadges() {
  var vEl = document.getElementById('views-count');
  var bEl = document.getElementById('buys-count');
  if (vEl) vEl.textContent = (analytics.views || 0).toLocaleString();
  if (bEl) bEl.textContent = (analytics.buys || 0).toLocaleString();
}

// ══ SOCIAL PROOF TICKER ══
var tickerEvents = [];
var TICKER_NAMES = ['María','Carmen','Lucía','Valentina','Sofía','Camila','Isabella','Daniela','Fernanda','Gabriela','Andrea','Paola','Natalia','Verónica','Patricia','Alejandra','Vanessa','Monica','Xiomara','Brenda'];
var TICKER_CITIES = ['Lima','Arequipa','Trujillo','Cusco','Piura','Callao','Iquitos','Chiclayo','Huancayo','Tacna','Pucallpa'];

function buildDefaultTicker() {
  var msgs = [];
  var pList = prods.length > 0 ? prods : [{name:'Blusa Floral'},{name:'Vestido Midi'},{name:'Conjunto Chic'}];
  for (var i = 0; i < 12; i++) {
    var n = TICKER_NAMES[Math.floor(Math.random() * TICKER_NAMES.length)];
    var c = TICKER_CITIES[Math.floor(Math.random() * TICKER_CITIES.length)];
    var p = pList[Math.floor(Math.random() * pList.length)];
    var type = Math.random() > 0.4 ? 'compra' : 'vista';
    if (type === 'compra') {
      msgs.push('<span>⚡ ' + n + ' de ' + c + ' acaba de comprar</span> ' + p.name);
    } else {
      msgs.push('<span>👁 ' + n + ' de ' + c + ' está viendo</span> ' + p.name);
    }
  }
  return msgs;
}

function renderTicker() {
  var inner = document.getElementById('ticker-inner');
  if (!inner) return;
  var msgs = tickerEvents.length > 0 ? tickerEvents : buildDefaultTicker();
  var full = msgs.concat(msgs); // duplicate for seamless loop
  inner.innerHTML = full.map(function(m) {
    return '<div class="ticker-msg">' + m + '</div>';
  }).join('');
}

function addTickerEvent(type, productName) {
  var n = TICKER_NAMES[Math.floor(Math.random() * TICKER_NAMES.length)];
  var c = TICKER_CITIES[Math.floor(Math.random() * TICKER_CITIES.length)];
  var msg = type === 'compra'
    ? '<span>⚡ ' + n + ' de ' + c + ' acaba de comprar</span> ' + productName
    : '<span>👁 ' + n + ' está viendo</span> ' + productName;
  tickerEvents.unshift(msg);
  if (tickerEvents.length > 20) tickerEvents.pop();
  renderTicker();
}

// ══ DATA LOADING ══
function loadAll() {
  // Products
  try {
    var s = localStorage.getItem('chk_prods_v6');
    prods = s ? JSON.parse(s) : null;
  } catch(e) { prods = null; }

  // Config
  try {
    var s = localStorage.getItem('chk_cfg_v6');
    cfg = s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_CFG));
  } catch(e) { cfg = JSON.parse(JSON.stringify(DEFAULT_CFG)); }
  for (var k in DEFAULT_CFG) { if (cfg[k] === undefined) cfg[k] = DEFAULT_CFG[k]; }

  // Banner
  try {
    var s = localStorage.getItem('chk_banner_v6');
    banner = s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_BANNER));
  } catch(e) { banner = JSON.parse(JSON.stringify(DEFAULT_BANNER)); }
}

function loadProducts(callback) {
  if (prods) { callback(); return; }
  // Try to fetch from data/products.json (works on GitHub Pages)
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/products.json', true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        prods = JSON.parse(xhr.responseText);
        localStorage.setItem('chk_prods_v6', JSON.stringify(prods));
      } catch(e) { prods = []; }
    } else {
      prods = [];
    }
    callback();
  };
  xhr.onerror = function() { prods = []; callback(); };
  xhr.send();
}

function saveProds() { localStorage.setItem('chk_prods_v6', JSON.stringify(prods)); }
function saveCfg() { localStorage.setItem('chk_cfg_v6', JSON.stringify(cfg)); }
function saveBannerStore() { localStorage.setItem('chk_banner_v6', JSON.stringify(banner)); }

// ══ FORMAT ══
function fmt(v) { return 'S/ ' + (+v).toFixed(2); }

function imgSrc(val) {
  if (!val) return fallbackImg();
  if (val.indexOf('data:') === 0) return val; // base64 uploaded
  // Relative path (GitHub Pages)
  return val;
}

function fallbackImg() {
  return 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#f0ebe0"/><text x="300" y="400" font-family="Georgia,serif" font-size="22" text-anchor="middle" fill="#c8a96e" font-style="italic">Chikarella</text></svg>');
}

// ══ HERO ══
function renderHero() {
  var ey = banner.eyebrow || DEFAULT_BANNER.eyebrow;
  var ti = banner.title || DEFAULT_BANNER.title;
  var su = banner.sub || DEFAULT_BANNER.sub;

  var eyEl = document.getElementById('h-eyebrow');
  var tiEl = document.querySelector('.hero-h1');
  var suEl = document.getElementById('h-sub');
  if (eyEl) eyEl.textContent = ey;
  if (tiEl) tiEl.innerHTML = ti.replace(/\n/g, '<br>').replace('brillar', '<em>brillar</em>').replace(cfg.brand, '<em>' + cfg.brand + '</em>');
  if (suEl) suEl.textContent = su;

  // Hero images — 4 cells, 2x2 grid, NO text overlay
  var imgs = banner.heroImgData || [];
  var defaults = banner.heroImages || DEFAULT_BANNER.heroImages;
  var heroRight = document.getElementById('hero-imgs');
  if (!heroRight) return;

  var cells = [];
  for (var i = 0; i < 4; i++) {
    var src = (imgs[i] && imgs[i] !== null) ? imgs[i] : (defaults[i] || (prods[i % prods.length] ? imgSrc(prods[i % prods.length].img) : fallbackImg()));
    cells.push(src);
  }

  heroRight.innerHTML =
    '<div class="hero-img-cell" style="grid-row:span 2">' +
      '<img src="' + cells[0] + '" alt="' + (cfg.brand||'') + ' colección" loading="eager">' +
    '</div>' +
    '<div class="hero-img-cell"><img src="' + cells[1] + '" alt="' + (cfg.brand||'') + '" loading="eager"></div>' +
    '<div class="hero-img-cell"><img src="' + cells[2] + '" alt="' + (cfg.brand||'') + '" loading="eager"></div>';
    // Note: 3 cells (1 tall + 2 stacked) = cleaner composition without text overlap
}

// ══ BRAND LABELS ══
function applyBrand() {
  var b = cfg.brand || 'Chikarella';
  var els = ['nav-brand-name','adm-brand-name','login-brand','footer-brand'];
  els.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = b;
  });
  document.title = b + ' — ' + (cfg.tagline || 'Catálogo');
  var navLogo = document.querySelector('.nav-logo');
  if (navLogo) navLogo.textContent = b;
  var footLogo = document.querySelector('.footer-logo');
  if (footLogo) footLogo.textContent = b;
}

// ══ SOCIALS ══
function renderSocials() {
  var row = document.getElementById('socials-row');
  if (!row) return;
  var items = [];
  if (cfg.wa) items.push({ icon: '💬', label: 'WhatsApp', href: 'https://wa.me/' + cfg.wa.replace(/\D/g, '') });
  if (cfg.tiktok) items.push({ icon: '🎵', label: 'TikTok', href: cfg.tiktok });
  if (cfg.instagram) items.push({ icon: '📷', label: 'Instagram', href: cfg.instagram });
  if (cfg.facebook) items.push({ icon: '👍', label: 'Facebook', href: cfg.facebook });
  row.innerHTML = items.map(function(it) {
    return '<a href="' + it.href + '" target="_blank" class="social-pill">' + it.icon + ' ' + it.label + '</a>';
  }).join('');

  var tlLink = document.getElementById('tiktok-link');
  if (tlLink && cfg.tiktok) { tlLink.href = cfg.tiktok; }

  var phoneEl = document.getElementById('ct-phone');
  if (phoneEl) phoneEl.textContent = cfg.phone || '+51 999 999 999';
  var emailEl = document.getElementById('ct-email');
  if (emailEl) emailEl.textContent = cfg.email || '';
}

// ══ SOBRE IMGS ══
function renderSobre() {
  var el = document.getElementById('sobre-imgs');
  if (!el || !prods.length) return;
  var picks = [Math.min(4, prods.length-1), Math.min(6, prods.length-1), Math.min(8, prods.length-1)];
  el.innerHTML = picks.map(function(idx, j) {
    var p = prods[idx % prods.length];
    var src = p ? imgSrc(p.img) : fallbackImg();
    return '<div class="sobre-img"><img src="' + src + '" alt="' + (cfg.brand||'') + '" loading="lazy"></div>';
  }).join('');
}

// ══ PRODUCTS ══
var TAG_MAP = { trend: 'Tendencia', new: 'Nuevo', sale: 'Oferta' };
var TAG_CLS = { trend: 'tag-trend', new: 'tag-new', sale: 'tag-sale' };
var ST_MAP = { ok: 'Disponible', low: 'Poco stock', out: 'Agotado' };
var ST_CLS = { ok: 'st-ok', low: 'st-low', out: 'st-out' };

function renderProds() {
  var g = document.getElementById('products-grid');
  if (!g) return;
  if (!prods || !prods.length) {
    g.innerHTML = '<div style="padding:60px;text-align:center;color:var(--muted);font-size:.9rem">No hay productos en el catálogo aún.</div>';
    return;
  }
  g.innerHTML = prods.map(function(p) {
    var tagH = p.tag ? '<span class="pcard-tag ' + (TAG_CLS[p.tag]||'') + '">' + (TAG_MAP[p.tag]||p.tag) + '</span>' : '';
    // Price display: public sees unit + mayorista. Mayorista sees all 3.
    var priceBlock = '';
    priceBlock += '<div class="price-line"><span class="price-lbl">Precio Unidad</span><span class="price-amt">' + fmt(p.p1) + '</span></div>';
    priceBlock += '<div class="price-divider"></div>';
    priceBlock += '<div class="price-line"><span class="price-lbl">Mayorista</span><span class="price-amt mayor">' + fmt(p.p2) + '</span></div>';
    if (isMay) {
      priceBlock += '<div class="price-line"><span class="price-lbl">Docena (×12)</span><span class="price-amt">' + fmt(p.p3) + '</span></div>';
    }

    return '<div class="pcard" onclick="openPModal(\'' + p.id + '\')">' +
      '<div class="pcard-img">' +
      '<img src="' + imgSrc(p.img) + '" alt="' + p.name + '" loading="lazy" onerror="this.src=fallbackImg()">' +
      tagH +
      '<button class="pcard-wa" onclick="event.stopPropagation();buyWA(\'' + p.id + '\')">💬 Comprar por WhatsApp</button>' +
      '</div>' +
      '<div class="pcard-body">' +
      '<div class="pcard-name">' + p.name + '</div>' +
      '<div class="pcard-code">' + p.code + '</div>' +
      '<div class="pcard-prices">' + priceBlock + '</div>' +
      '<span class="pcard-stock ' + (ST_CLS[p.stock] || 'st-ok') + '">' + (ST_MAP[p.stock] || 'Disponible') + '</span>' +
      '<div class="pcard-actions">' +
      '<button class="btn-buy" onclick="event.stopPropagation();buyWA(\'' + p.id + '\')">Comprar</button>' +
      '<button class="btn-eye" onclick="event.stopPropagation();openPModal(\'' + p.id + '\')">👁</button>' +
      '</div></div></div>';
  }).join('');
}

// ══ PRODUCT MODAL ══
function openPModal(id) {
  var p = findProd(id);
  if (!p) return;
  curProd = p;
  trackView(id, p.name);
  addTickerEvent('vista', p.name);

  var imgEl = document.getElementById('pm-img');
  imgEl.src = imgSrc(p.img);
  imgEl.onerror = function() { this.src = fallbackImg(); };

  document.getElementById('pm-name').textContent = p.name;
  document.getElementById('pm-code').textContent = p.code;
  document.getElementById('pm-desc').textContent = p.desc || '';

  // Price table — public: unidad + mayorista | mayorista: all 3
  var pt = document.getElementById('pm-prices');
  var rows = '';
  rows += '<tr><td>Precio Mayorista</td><td>' + fmt(p.p2) + '</td></tr>';
  rows += '<tr><td>Precio Unidad</td><td>' + fmt(p.p1) + '</td></tr>';
  if (isMay) {
    rows += '<tr><td>Precio Docena (×12)</td><td>' + fmt(p.p3) + '</td></tr>';
  }
  pt.innerHTML = rows;

  var stockEl = document.getElementById('pm-stock-row');
  stockEl.innerHTML = '<span class="pcard-stock ' + (ST_CLS[p.stock]||'st-ok') + '">' + (ST_MAP[p.stock]||'Disponible') + '</span>';

  document.getElementById('pm-wa-btn').onclick = function() { buyWA(id); };
  document.getElementById('pmodal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePModal() {
  document.getElementById('pmodal').classList.remove('open');
  document.body.style.overflow = '';
}
function shareProduct() {
  var p = curProd;
  if (!p) return;
  var t = (cfg.brand||'Chikarella') + ': ' + p.name + ' (' + p.code + ')\nPrecio: ' + fmt(p.p1) + ' | Mayorista: ' + fmt(p.p2) + '\nGamarra, Lima';
  if (navigator.share) {
    navigator.share({ title: p.name, text: t });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(t).then(function() { alert('Copiado al portapapeles ✓'); });
  }
}

// ══ WHATSAPP ══
function buildMsg(p) {
  // Intentionally sends product name, code, price and desc — image sharing via WA itself
  return encodeURIComponent(
    'Hola ' + (cfg.brand||'Chikarella') + '! 👋\n\n' +
    'Me interesa este producto:\n' +
    '👗 *' + p.name + '*\n' +
    '🔖 Código: ' + p.code + '\n' +
    '💰 Precio Unidad: ' + fmt(p.p1) + '\n' +
    '💰 Precio Mayorista: ' + fmt(p.p2) + '\n' +
    (isMay ? '💰 Precio Docena: ' + fmt(p.p3) + '\n' : '') +
    (p.desc ? '\n📋 ' + p.desc + '\n' : '') +
    '\n¿Pueden confirmarme disponibilidad?\n' +
    '📍 ' + (cfg.brand||'Chikarella') + ' · Gamarra, Lima'
  );
}
function buyWA(id) {
  var p = findProd(id);
  if (!p) return;
  trackBuy(id, p.name);
  var waNum = (cfg.wa || '51999999999').replace(/\D/g, '');
  window.open('https://wa.me/' + waNum + '?text=' + buildMsg(p), '_blank');
}
function openWA() {
  var waNum = (cfg.wa || '51999999999').replace(/\D/g, '');
  window.open('https://wa.me/' + waNum + '?text=' + encodeURIComponent('Hola ' + (cfg.brand||'Chikarella') + '! 👋 Me gustaría ver el catálogo de productos. ¿Me pueden ayudar?'), '_blank');
}

// ══ MAYORISTA ══
function openMayModal() {
  document.getElementById('may-modal').classList.add('open');
  document.getElementById('may-err').classList.add('hidden');
  setTimeout(function() { var el = document.getElementById('may-pass'); if (el) el.focus(); }, 100);
}
function closeMayModal() { document.getElementById('may-modal').classList.remove('open'); }
function doMayLogin() {
  var pass = document.getElementById('may-pass').value;
  var correct = cfg.maypass || DEFAULT_CFG.maypass;
  if (pass === correct) {
    isMay = true;
    closeMayModal();
    document.getElementById('may-pass').value = '';
    document.getElementById('may-bar').classList.remove('hidden');
    var btn = document.getElementById('may-nav-btn');
    if (btn) { btn.textContent = '✓ Mayorista'; btn.classList.add('active-may'); }
    renderProds();
  } else {
    document.getElementById('may-err').classList.remove('hidden');
  }
}
function logoutMay() {
  isMay = false;
  document.getElementById('may-bar').classList.add('hidden');
  var btn = document.getElementById('may-nav-btn');
  if (btn) { btn.textContent = '🔑 Mayorista'; btn.classList.remove('active-may'); }
  renderProds();
}

// ══ SCROLL HELPER ══
function scrollTo(id) {
  var el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ══ ADMIN ══
function showLogin() {
  document.getElementById('login-screen').classList.add('open');
  document.getElementById('lerr').classList.add('hidden');
}
function closeLogin() { document.getElementById('login-screen').classList.remove('open'); }
function doLogin() {
  var u = document.getElementById('lu').value.trim();
  var p = document.getElementById('lp').value;
  var adminU = cfg.adminUser || DEFAULT_CFG.adminUser;
  var adminP = cfg.adminPass || DEFAULT_CFG.adminPass;
  if (u === adminU && p === adminP) {
    closeLogin();
    openAdm();
  } else {
    document.getElementById('lerr').classList.remove('hidden');
  }
}
function openAdm() {
  renderAdmProds();
  renderStats();
  populateCfgForm();
  populateBannerForm();
  document.getElementById('admin-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeAdm() {
  document.getElementById('admin-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Tab switching
document.addEventListener('DOMContentLoaded', function() {
  var tabs = document.querySelectorAll('.adm-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      admSec(this.getAttribute('data-sec'));
    });
  });
});

function admSec(s) {
  document.querySelectorAll('.adm-sec').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.adm-tab').forEach(function(el) { el.classList.remove('active'); });
  var sec = document.getElementById('sec-' + s);
  if (sec) sec.classList.add('active');
  var tab = document.querySelector('.adm-tab[data-sec="' + s + '"]');
  if (tab) tab.classList.add('active');
  if (s === 'analytics') renderStats();
}

// ── ADMIN PRODUCTS ──
function renderAdmProds() {
  var g = document.getElementById('adm-pgrid');
  if (!g) return;
  if (!prods.length) {
    g.innerHTML = '<div style="color:var(--muted);font-size:.85rem">No hay productos aún. Usa "+ Agregar" para empezar.</div>';
    return;
  }
  g.innerHTML = prods.map(function(p) {
    return '<div class="adm-pcard">' +
      '<img src="' + imgSrc(p.img) + '" alt="' + p.name + '" onerror="this.src=fallbackImg()">' +
      '<div class="adm-pcard-body">' +
      '<div class="adm-pcard-name">' + p.name + '</div>' +
      '<div class="adm-pcard-code">' + p.code + '</div>' +
      '<div style="font-size:.76rem;margin-bottom:8px;color:var(--muted)">Un:' + fmt(p.p1) + ' May:' + fmt(p.p2) + ' Doc:' + fmt(p.p3) + '</div>' +
      '<div class="adm-pcard-btns">' +
      '<button class="btn-edit-s" onclick="editProd(\'' + p.id + '\')">Editar</button>' +
      '<button class="btn-del-s" onclick="delProd(\'' + p.id + '\')">Eliminar</button>' +
      '</div></div></div>';
  }).join('');
}

function editProd(id) {
  var p = findProd(id);
  if (!p) return;
  document.getElementById('eid').value = id;
  document.getElementById('fn').value = p.name;
  document.getElementById('fc').value = p.code;
  document.getElementById('ftag').value = p.tag || '';
  document.getElementById('fstock').value = p.stock || 'ok';
  document.getElementById('fdesc').value = p.desc || '';
  document.getElementById('fp1').value = p.p1;
  document.getElementById('fp2').value = p.p2;
  document.getElementById('fp3').value = p.p3;
  document.getElementById('fimgdata').value = p.img || '';
  var prev = document.getElementById('img-prev');
  prev.src = imgSrc(p.img);
  prev.classList.remove('hidden');
  document.getElementById('form-h').textContent = 'Editar Producto';
  admSec('add');
}

function saveProd() {
  var id = document.getElementById('eid').value;
  var name = document.getElementById('fn').value.trim();
  var code = document.getElementById('fc').value.trim();
  if (!name || !code) { alert('Nombre y código son obligatorios'); return; }
  var d = {
    id: id || ('p' + Date.now()),
    name: name,
    code: code,
    tag: document.getElementById('ftag').value,
    stock: document.getElementById('fstock').value,
    desc: document.getElementById('fdesc').value.trim(),
    p1: parseFloat(document.getElementById('fp1').value) || 0,
    p2: parseFloat(document.getElementById('fp2').value) || 0,
    p3: parseFloat(document.getElementById('fp3').value) || 0,
    img: document.getElementById('fimgdata').value || ''
  };
  if (id) {
    for (var i = 0; i < prods.length; i++) { if (prods[i].id === id) { prods[i] = d; break; } }
  } else {
    prods.push(d);
  }
  saveProds();
  renderProds();
  renderAdmProds();
  renderSobre();
  clearForm();
  admSec('prods');
}

function delProd(id) {
  if (!confirm('¿Eliminar este producto?')) return;
  prods = prods.filter(function(p) { return p.id !== id; });
  saveProds();
  renderProds();
  renderAdmProds();
}

function clearForm() {
  ['eid','fn','fc','fp1','fp2','fp3','fdesc','fimgdata'].forEach(function(x) {
    var el = document.getElementById(x);
    if (el) el.value = '';
  });
  document.getElementById('ftag').value = '';
  document.getElementById('fstock').value = 'ok';
  var prev = document.getElementById('img-prev');
  if (prev) prev.classList.add('hidden');
  document.getElementById('form-h').textContent = 'Agregar Producto';
}

function prevImg(e) {
  var f = e.target.files[0];
  if (!f) return;
  var r = new FileReader();
  r.onload = function(ev) {
    document.getElementById('fimgdata').value = ev.target.result;
    var prev = document.getElementById('img-prev');
    prev.src = ev.target.result;
    prev.classList.remove('hidden');
  };
  r.readAsDataURL(f);
}

// ── BANNER ADMIN ──
function setHeroImg(idx, e) {
  var f = e.target.files[0];
  if (!f) return;
  var r = new FileReader();
  r.onload = function(ev) {
    heroImgEdits[idx] = ev.target.result;
    var cell = document.getElementById('hc' + idx);
    if (cell) {
      var existing = cell.querySelector('img');
      if (!existing) {
        existing = document.createElement('img');
        existing.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block';
        cell.appendChild(existing);
      }
      existing.src = ev.target.result;
      var span = cell.querySelector('span');
      if (span) span.style.display = 'none';
    }
  };
  r.readAsDataURL(f);
}

function populateBannerForm() {
  var fields = { 'b-ey': banner.eyebrow, 'b-ti': banner.title, 'b-su': banner.sub };
  for (var k in fields) {
    var el = document.getElementById(k);
    if (el) el.value = fields[k] || '';
  }
  heroImgEdits = [null, null, null, null];
  var heroData = banner.heroImgData || [];
  var defaults = banner.heroImages || DEFAULT_BANNER.heroImages;
  for (var i = 0; i < 4; i++) {
    var src = (heroData[i] && heroData[i] !== null) ? heroData[i] : (defaults[i] || '');
    var cell = document.getElementById('hc' + i);
    if (cell && src) {
      var existing = cell.querySelector('img');
      if (!existing) {
        existing = document.createElement('img');
        existing.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block';
        cell.appendChild(existing);
      }
      existing.src = src;
      var span = cell.querySelector('span');
      if (span) span.style.display = 'none';
    }
  }
}

function saveBanner() {
  banner.eyebrow = document.getElementById('b-ey').value;
  banner.title = document.getElementById('b-ti').value;
  banner.sub = document.getElementById('b-su').value;
  if (!banner.heroImgData) banner.heroImgData = [null, null, null, null];
  for (var i = 0; i < 4; i++) {
    if (heroImgEdits[i] !== null) banner.heroImgData[i] = heroImgEdits[i];
  }
  saveBannerStore();
  renderHero();
  alert('Banner actualizado ✓');
}

// ── CONFIG ADMIN ──
function populateCfgForm() {
  var fields = {
    'cf-brand': cfg.brand, 'cf-tag': cfg.tagline,
    'cf-wa': cfg.wa, 'cf-phone': cfg.phone, 'cf-email': cfg.email,
    'cf-maypass': cfg.maypass,
    'cf-tiktok': cfg.tiktok, 'cf-ig': cfg.instagram, 'cf-fb': cfg.facebook,
    'cf-admp': ''
  };
  for (var k in fields) {
    var el = document.getElementById(k);
    if (el) el.value = fields[k] || '';
  }
}

function saveConfig() {
  cfg.brand = document.getElementById('cf-brand').value.trim() || 'Chikarella';
  cfg.tagline = document.getElementById('cf-tag').value.trim();
  cfg.wa = (document.getElementById('cf-wa').value || '').replace(/\D/g, '');
  cfg.phone = document.getElementById('cf-phone').value.trim();
  cfg.email = document.getElementById('cf-email').value.trim();
  cfg.maypass = document.getElementById('cf-maypass').value.trim();
  cfg.tiktok = document.getElementById('cf-tiktok').value.trim();
  cfg.instagram = document.getElementById('cf-ig').value.trim();
  cfg.facebook = document.getElementById('cf-fb').value.trim();
  var newPass = document.getElementById('cf-admp').value.trim();
  if (newPass) cfg.adminPass = newPass;
  saveCfg();
  applyBrand();
  renderSocials();
  alert('Configuración guardada ✓');
}

// ── ANALYTICS ──
function renderStats() {
  var totalViews = analytics.views || 0;
  var totalBuys = analytics.buys || 0;
  var sessions = analytics.sessions || 0;
  var byProd = analytics.byProduct || {};

  var sg = document.getElementById('stats-grid');
  if (sg) {
    sg.innerHTML =
      '<div class="scard"><div class="scard-v">' + totalViews.toLocaleString() + '</div><div class="scard-l">Vistas Totales</div></div>' +
      '<div class="scard"><div class="scard-v">' + totalBuys.toLocaleString() + '</div><div class="scard-l">Compras WhatsApp</div></div>' +
      '<div class="scard"><div class="scard-v">' + sessions.toLocaleString() + '</div><div class="scard-l">Sesiones</div></div>' +
      '<div class="scard"><div class="scard-v">' + prods.length + '</div><div class="scard-l">Productos</div></div>';
  }

  var sub = document.getElementById('stats-sub');
  if (sub) {
    sub.innerHTML = '<div style="font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;font-weight:500;margin-bottom:10px">Información</div>' +
      '<div style="font-size:.82rem;color:var(--muted);line-height:1.8">' +
      'Desde: <strong>' + (analytics.lastReset || '-') + '</strong><br>' +
      'Disponibles: <strong>' + prods.filter(function(p){return p.stock==='ok';}).length + '</strong> · ' +
      'Poco stock: <strong>' + prods.filter(function(p){return p.stock==='low';}).length + '</strong> · ' +
      'Agotados: <strong>' + prods.filter(function(p){return p.stock==='out';}).length + '</strong>' +
      '</div>';
  }

  var sp = document.getElementById('stats-products');
  if (sp) {
    var entries = [];
    for (var id in byProd) { entries.push(byProd[id]); }
    entries.sort(function(a, b) { return b.buys - a.buys; });
    if (!entries.length) {
      sp.innerHTML = '<div style="font-size:.82rem;color:var(--muted)">Aún no hay datos de vistas por producto.</div>';
    } else {
      sp.innerHTML = '<div style="font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;font-weight:500;margin-bottom:12px">Top Productos</div>' +
        entries.slice(0, 10).map(function(e) {
          return '<div style="display:flex;justify-content:space-between;font-size:.82rem;padding:7px 0;border-bottom:1px solid var(--border)">' +
            '<span>' + e.name + '</span>' +
            '<span style="color:var(--muted)">👁 ' + (e.views||0) + ' · 🛒 ' + (e.buys||0) + '</span>' +
            '</div>';
        }).join('');
    }
  }
}

// ── PDF ──
function genPDF(mayorista) {
  var jspdf = window.jspdf;
  if (!jspdf) { alert('Cargando PDF... intenta en un segundo.'); return; }
  var doc = new jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  var W = 210, H = 297;
  var brand = cfg.brand || 'Chikarella';

  // Cover
  doc.setFillColor(10, 10, 10); doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(232, 180, 184); doc.rect(0, H / 2 - 1, W, 1.5, 'F');
  doc.setTextColor(250, 250, 248); doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(48);
  doc.text(brand, W / 2, H / 2 - 22, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(200, 170, 155);
  doc.text((cfg.tagline || 'MODA FEMENINA PREMIUM').toUpperCase(), W / 2, H / 2 - 10, { align: 'center' });
  doc.setTextColor(232, 180, 184); doc.setFontSize(12);
  doc.text(mayorista ? 'Catálogo Mayorista' : 'Catálogo de Productos', W / 2, H / 2 + 18, { align: 'center' });
  doc.setTextColor(140, 130, 120); doc.setFontSize(8);
  doc.text(cfg.store1 || '', W / 2, H / 2 + 34, { align: 'center' });
  doc.text(cfg.store2 || '', W / 2, H / 2 + 42, { align: 'center' });
  doc.text((cfg.phone || '') + (cfg.email ? '  ·  ' + cfg.email : ''), W / 2, H / 2 + 52, { align: 'center' });
  doc.text('Generado: ' + new Date().toLocaleDateString('es-PE'), W / 2, H / 2 + 62, { align: 'center' });

  // Products — 2 per page
  for (var i = 0; i < prods.length; i++) {
    if (i % 2 === 0) {
      doc.addPage();
      doc.setFillColor(240, 235, 224); doc.rect(0, 0, W, H, 'F');
      doc.setFillColor(10, 10, 10); doc.rect(0, 0, W, 12, 'F');
      doc.setTextColor(232, 180, 184); doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(8);
      doc.text(brand, 12, 8);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 165, 150); doc.setFontSize(7);
      doc.text(mayorista ? 'CATÁLOGO MAYORISTA' : 'CATÁLOGO', W - 12, 8, { align: 'right' });
    }
    var p = prods[i];
    var col = i % 2;
    var cx = col === 0 ? 8 : W / 2 + 3;
    var cw = W / 2 - 11;
    var cy = 20;
    doc.setFillColor(255, 255, 255); doc.roundedRect(cx, cy, cw, H - 30, 3, 3, 'F');
    try {
      var src = imgSrc(p.img);
      if (src && src.indexOf('data:image') === 0) {
        doc.addImage(src, 'JPEG', cx + 2, cy + 2, cw - 4, 92, undefined, 'FAST');
      }
    } catch (e) {}
    if (p.tag) {
      var tc = p.tag === 'trend' ? [232,180,184] : p.tag === 'new' ? [200,169,110] : [50,180,100];
      doc.setFillColor(tc[0], tc[1], tc[2]);
      doc.roundedRect(cx + 4, cy + cw - 10, 26, 5, 1, 1, 'F');
      doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'bold'); doc.setFontSize(5);
      doc.text((TAG_MAP[p.tag] || p.tag).toUpperCase(), cx + 17, cy + cw - 6.5, { align: 'center' });
    }
    var iy = cy + 97;
    doc.setTextColor(10, 10, 10); doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(10);
    doc.text(doc.splitTextToSize(p.name, cw - 8), cx + 4, iy + 7);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(130, 120, 110);
    doc.text(p.code, cx + 4, iy + 15);
    doc.setDrawColor(220, 215, 205); doc.line(cx + 4, iy + 18, cx + cw - 4, iy + 18);
    var pRows = mayorista
      ? [['Precio Mayorista', fmt(p.p2), [196,120,120]], ['Precio Unidad', fmt(p.p1), [10,10,10]], ['Precio Docena x12', fmt(p.p3), [80,130,80]]]
      : [['Precio Unidad', fmt(p.p1), [10,10,10]], ['Precio Mayorista', fmt(p.p2), [196,120,120]]];
    for (var j = 0; j < pRows.length; j++) {
      var py = iy + 26 + j * 9;
      doc.setFontSize(7.5); doc.setTextColor(130, 120, 110); doc.setFont('helvetica', 'normal'); doc.text(pRows[j][0], cx + 4, py);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(pRows[j][2][0], pRows[j][2][1], pRows[j][2][2]); doc.text(pRows[j][1], cx + cw - 4, py, { align: 'right' });
    }
    var sc = p.stock === 'ok' ? [200,232,200] : p.stock === 'low' ? [255,238,195] : [255,208,208];
    doc.setFillColor(sc[0], sc[1], sc[2]); doc.roundedRect(cx + 4, iy + 53, 28, 5, 1, 1, 'F');
    doc.setTextColor(60, 80, 60); doc.setFont('helvetica', 'bold'); doc.setFontSize(4.8);
    doc.text(p.stock === 'ok' ? 'DISPONIBLE' : p.stock === 'low' ? 'POCO STOCK' : 'AGOTADO', cx + 18, iy + 56.8, { align: 'center' });
    if (p.desc) {
      doc.setTextColor(150, 140, 130); doc.setFont('helvetica', 'normal'); doc.setFontSize(6);
      doc.text(doc.splitTextToSize(p.desc, cw - 8).slice(0, 3), cx + 4, iy + 63);
    }
    doc.setTextColor(215, 205, 190); doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(6.5);
    doc.text(brand.toUpperCase(), cx + cw / 2, cy + H - 33, { align: 'center' });
  }
  // Back
  doc.addPage();
  doc.setFillColor(10, 10, 10); doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(232, 180, 184); doc.rect(70, H / 2 - 18, 70, 1, 'F');
  doc.setTextColor(232, 180, 184); doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(22);
  doc.text('Gracias por tu', W / 2, H / 2 - 28, { align: 'center' });
  doc.text('preferencia', W / 2, H / 2 - 12, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setTextColor(150, 140, 130); doc.setFontSize(8);
  doc.text(brand + ' — ' + (cfg.tagline || ''), W / 2, H / 2 + 10, { align: 'center' });
  doc.text((cfg.phone || '') + '  ·  Gamarra, Lima, Perú', W / 2, H / 2 + 20, { align: 'center' });
  doc.save(brand + '_Catalogo' + (mayorista ? '_Mayorista' : '') + '.pdf');
}

// ══ UTILITY ══
function findProd(id) {
  for (var i = 0; i < prods.length; i++) { if (prods[i].id === id) return prods[i]; }
  return null;
}

// ══ INIT ══
loadAll();
loadProducts(function() {
  applyBrand();
  renderHero();
  renderProds();
  renderSobre();
  renderSocials();
  renderTicker();
  initAnalytics();
});

// ══════════════════════════════════════════
// EXPORTAR PARA GITHUB — Solución datos persistentes
// ══════════════════════════════════════════

function exportForGitHub() {
  var productsJSON = JSON.stringify(prods, null, 2);
  var configJSON = JSON.stringify({
    brand: cfg.brand || DEFAULT_CFG.brand,
    tagline: cfg.tagline || DEFAULT_CFG.tagline,
    wa: cfg.wa || DEFAULT_CFG.wa,
    phone: cfg.phone || DEFAULT_CFG.phone,
    email: cfg.email || DEFAULT_CFG.email,
    maypass: cfg.maypass || DEFAULT_CFG.maypass,
    adminUser: cfg.adminUser || DEFAULT_CFG.adminUser,
    adminPass: cfg.adminPass || DEFAULT_CFG.adminPass,
    tiktok: cfg.tiktok || DEFAULT_CFG.tiktok,
    instagram: cfg.instagram || DEFAULT_CFG.instagram,
    facebook: cfg.facebook || DEFAULT_CFG.facebook,
    store1: cfg.store1 || DEFAULT_CFG.store1,
    store2: cfg.store2 || DEFAULT_CFG.store2,
    banner: banner
  }, null, 2);

  var overlay = document.getElementById('export-overlay');
  document.getElementById('export-products-txt').value = productsJSON;
  document.getElementById('export-config-txt').value = configJSON;
  overlay.classList.add('open');
}

function copyExport(which) {
  var el = document.getElementById('export-' + which + '-txt');
  el.select();
  el.setSelectionRange(0, 99999);
  try {
    document.execCommand('copy');
    var btn = event.target;
    var orig = btn.textContent;
    btn.textContent = '✓ Copiado!';
    btn.style.background = '#25D366';
    setTimeout(function() { btn.textContent = orig; btn.style.background = ''; }, 2000);
  } catch(e) {
    navigator.clipboard.writeText(el.value).then(function() {
      alert('Copiado al portapapeles ✓');
    });
  }
}

function downloadExport(which) {
  var el = document.getElementById('export-' + which + '-txt');
  var blob = new Blob([el.value], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = which === 'products' ? 'products.json' : 'config.json';
  a.click();
}

// ══════════════════════════════════════════
// IMPROVEMENTS v6.1
// ══════════════════════════════════════════

// Override initAnalytics — start from realistic numbers
function initAnalytics() {
  try {
    var saved = localStorage.getItem('chk_analytics');
    analytics = saved ? JSON.parse(saved) : null;
  } catch(e) { analytics = null; }

  if (!analytics) {
    // First time: generate realistic starting numbers
    var baseViews = 1000 + Math.floor(Math.random() * 500); // 1000-1500
    var baseBuys = 80 + Math.floor(Math.random() * 60);    // 80-140
    analytics = {
      views: baseViews,
      buys: baseBuys,
      byProduct: {},
      sessions: Math.floor(baseViews * 0.4),
      lastReset: new Date().toLocaleDateString('es-PE'),
      seedDate: Date.now()
    };
  }

  // Add daily organic growth — each day adds ~20-80 views
  var lastSeed = analytics.seedDate || Date.now();
  var daysPassed = Math.floor((Date.now() - lastSeed) / 86400000);
  if (daysPassed > 0) {
    analytics.views += daysPassed * (20 + Math.floor(Math.random() * 60));
    analytics.buys += daysPassed * (1 + Math.floor(Math.random() * 5));
    analytics.seedDate = Date.now();
  }

  // Count this session
  analytics.sessions = (analytics.sessions || 0) + 1;
  analytics.views = (analytics.views || 0) + 1;
  saveAnalytics();
  updateProofBadges();

  // Simulate organic counter ticking every 30-90 seconds
  setInterval(function() {
    if (Math.random() > 0.4) {
      analytics.views++;
      saveAnalytics();
      updateProofBadges();
    }
  }, 45000 + Math.random() * 45000);
}

// Override updateProofBadges with animated counter
function updateProofBadges() {
  animateCounter('views-count', analytics.views || 0);
  animateCounter('buys-count', analytics.buys || 0);
}

function animateCounter(id, target) {
  var el = document.getElementById(id);
  if (!el) return;
  var current = parseInt(el.textContent.replace(/,/g, '')) || 0;
  if (current === target) return;
  var step = Math.ceil(Math.abs(target - current) / 20);
  var dir = target > current ? 1 : -1;
  var timer = setInterval(function() {
    current += dir * step;
    if ((dir > 0 && current >= target) || (dir < 0 && current <= target)) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = current.toLocaleString();
  }, 40);
}

// Override buildMsg — include product image as link + full details
function buildMsg(p) {
  var brand = cfg.brand || 'Chikarella';
  // WhatsApp can't receive images via URL in message, but we include product link + image description
  var msg = 'Hola ' + brand + '! 👋\n\n';
  msg += '👗 *' + p.name + '*\n';
  msg += '🔖 Código: ' + p.code + '\n';
  msg += '💰 Precio Unidad: ' + fmt(p.p1) + '\n';
  msg += '💰 Precio Mayorista: ' + fmt(p.p2) + '\n';
  if (isMay) msg += '💰 Precio Docena (×12): ' + fmt(p.p3) + '\n';
  if (p.desc) msg += '\n📋 ' + p.desc + '\n';
  msg += '\n📸 *Adjunto foto del producto*\n';
  msg += '¿Confirman disponibilidad y forma de envío?\n';
  msg += '\n📍 ' + brand + ' · Gamarra, Lima';
  return encodeURIComponent(msg);
}

// New: buy WA with auto-open image share
function buyWA(id) {
  var p = findProd(id);
  if (!p) return;
  trackBuy(id, p.name);
  var waNum = (cfg.wa || '51999999999').replace(/\D/g, '');

  // Check if product has image data to share
  var imgSrcVal = imgSrc(p.img);
  var hasLocalImg = imgSrcVal && imgSrcVal.indexOf('data:image') === 0;

  if (hasLocalImg) {
    // Open share dialog first so user can share the photo, then WA
    showBuyWithPhoto(p, waNum);
  } else {
    window.open('https://wa.me/' + waNum + '?text=' + buildMsg(p), '_blank');
  }
}

function showBuyWithPhoto(p, waNum) {
  var overlay = document.getElementById('buy-photo-overlay');
  if (!overlay) {
    // Create overlay dynamically
    overlay = document.createElement('div');
    overlay.id = 'buy-photo-overlay';
    overlay.className = 'overlay';
    overlay.innerHTML =
      '<div class="buy-photo-box">' +
        '<button class="overlay-close" onclick="document.getElementById(\'buy-photo-overlay\').classList.remove(\'open\')">✕</button>' +
        '<div class="buy-photo-title">Comprar por WhatsApp</div>' +
        '<div class="buy-photo-sub">Para enviar la foto, sigue estos 2 pasos:</div>' +
        '<div class="buy-photo-steps">' +
          '<div class="buy-step">' +
            '<div class="buy-step-n">1</div>' +
            '<div>' +
              '<strong>Descarga la foto del producto</strong><br>' +
              '<span style="font-size:.78rem;color:var(--muted)">Mantén presionada la imagen y guárdala</span><br>' +
              '<img id="buy-photo-img" style="width:100%;max-height:220px;object-fit:cover;border-radius:6px;margin-top:8px;display:block">' +
              '<button id="buy-photo-dl" class="btn-s" style="width:100%;margin-top:8px" onclick="downloadBuyPhoto()">⬇ Descargar Foto</button>' +
            '</div>' +
          '</div>' +
          '<div class="buy-step">' +
            '<div class="buy-step-n">2</div>' +
            '<div>' +
              '<strong>Abre WhatsApp y adjunta la foto</strong><br>' +
              '<span style="font-size:.78rem;color:var(--muted)">El mensaje con los detalles ya estará listo</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button class="btn-wa-modal" id="buy-wa-btn" style="margin-top:20px">💬 Abrir WhatsApp</button>' +
      '</div>';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.classList.remove('open'); };
    document.body.appendChild(overlay);
  }

  var imgEl = document.getElementById('buy-photo-img');
  imgEl.src = imgSrc(p.img);
  window._buyPhotoData = imgSrc(p.img);
  window._buyProdName = p.name;

  document.getElementById('buy-wa-btn').onclick = function() {
    overlay.classList.remove('open');
    window.open('https://wa.me/' + waNum + '?text=' + buildMsg(p), '_blank');
  };
  overlay.classList.add('open');
}

function downloadBuyPhoto() {
  var a = document.createElement('a');
  a.href = window._buyPhotoData || '';
  a.download = (window._buyProdName || 'producto').replace(/\s+/g, '_') + '.jpg';
  a.click();
}

// Override prevImg for 2-image product
function prevProdImg(slot, e) {
  var f = e.target.files[0];
  if (!f) return;
  var r = new FileReader();
  r.onload = function(ev) {
    var data = ev.target.result;
    var hiddenId = slot === 0 ? 'fimgdata' : 'fimgdata2';
    document.getElementById(hiddenId).value = data;
    var prev = document.getElementById('fimg' + slot + '-prev');
    prev.src = data;
    prev.classList.remove('hidden');
    // Show/hide slot UI
    var inner = document.querySelector('#slot' + slot + ' .prod-img-slot-inner');
    if (inner) inner.style.display = 'none';
    var btns = document.getElementById('slot' + slot + '-btns');
    if (btns) btns.classList.remove('hidden');
  };
  r.readAsDataURL(f);
}

function clearProdImg(slot) {
  var hiddenId = slot === 0 ? 'fimgdata' : 'fimgdata2';
  document.getElementById(hiddenId).value = '';
  var prev = document.getElementById('fimg' + slot + '-prev');
  prev.src = ''; prev.classList.add('hidden');
  var inner = document.querySelector('#slot' + slot + ' .prod-img-slot-inner');
  if (inner) inner.style.display = '';
  var btns = document.getElementById('slot' + slot + '-btns');
  if (btns) btns.classList.add('hidden');
}

// Override clearForm
var _origClearForm = clearForm;
function clearForm() {
  ['eid','fn','fc','fp1','fp2','fp3','fdesc','fimgdata','fimgdata2'].forEach(function(x) {
    var el = document.getElementById(x); if (el) el.value = '';
  });
  document.getElementById('ftag').value = '';
  document.getElementById('fstock').value = 'ok';
  [0,1].forEach(function(s) {
    var prev = document.getElementById('fimg' + s + '-prev');
    if (prev) { prev.src = ''; prev.classList.add('hidden'); }
    var inner = document.querySelector('#slot' + s + ' .prod-img-slot-inner');
    if (inner) inner.style.display = '';
    var btns = document.getElementById('slot' + s + '-btns');
    if (btns) btns.classList.add('hidden');
  });
  document.getElementById('form-h').textContent = 'Agregar Producto';
}

// Override editProd to handle 2 images
var _origEditProd = editProd;
function editProd(id) {
  var p = findProd(id);
  if (!p) return;
  document.getElementById('eid').value = id;
  document.getElementById('fn').value = p.name;
  document.getElementById('fc').value = p.code;
  document.getElementById('ftag').value = p.tag || '';
  document.getElementById('fstock').value = p.stock || 'ok';
  document.getElementById('fdesc').value = p.desc || '';
  document.getElementById('fp1').value = p.p1;
  document.getElementById('fp2').value = p.p2;
  document.getElementById('fp3').value = p.p3;

  // Image 1
  var img1 = p.img || '';
  document.getElementById('fimgdata').value = img1;
  if (img1) {
    var prev0 = document.getElementById('fimg0-prev');
    prev0.src = imgSrc(img1); prev0.classList.remove('hidden');
    var inner0 = document.querySelector('#slot0 .prod-img-slot-inner');
    if (inner0) inner0.style.display = 'none';
    var btns0 = document.getElementById('slot0-btns');
    if (btns0) btns0.classList.remove('hidden');
  }

  // Image 2
  var img2 = p.img2 || '';
  document.getElementById('fimgdata2').value = img2;
  if (img2) {
    var prev1 = document.getElementById('fimg1-prev');
    prev1.src = imgSrc(img2); prev1.classList.remove('hidden');
    var inner1 = document.querySelector('#slot1 .prod-img-slot-inner');
    if (inner1) inner1.style.display = 'none';
    var btns1 = document.getElementById('slot1-btns');
    if (btns1) btns1.classList.remove('hidden');
  }

  document.getElementById('form-h').textContent = 'Editar Producto';
  admSec('add');
}

// Override saveProd to save img2
var _origSaveProd = saveProd;
function saveProd() {
  var id = document.getElementById('eid').value;
  var name = document.getElementById('fn').value.trim();
  var code = document.getElementById('fc').value.trim();
  if (!name || !code) { alert('Nombre y código son obligatorios'); return; }
  var d = {
    id: id || ('p' + Date.now()),
    name: name, code: code,
    tag: document.getElementById('ftag').value,
    stock: document.getElementById('fstock').value,
    desc: document.getElementById('fdesc').value.trim(),
    p1: parseFloat(document.getElementById('fp1').value) || 0,
    p2: parseFloat(document.getElementById('fp2').value) || 0,
    p3: parseFloat(document.getElementById('fp3').value) || 0,
    img: document.getElementById('fimgdata').value || '',
    img2: document.getElementById('fimgdata2').value || ''
  };
  if (id) {
    for (var i = 0; i < prods.length; i++) { if (prods[i].id === id) { prods[i] = d; break; } }
  } else {
    prods.push(d);
  }
  saveProds(); renderProds(); renderAdmProds(); renderSobre(); clearForm(); admSec('prods');
}

// Override openPModal to show 2 images with toggle
var _origOpenPModal = openPModal;
function openPModal(id) {
  var p = findProd(id);
  if (!p) return;
  curProd = p;
  trackView(id, p.name);
  addTickerEvent('vista', p.name);

  var imgEl = document.getElementById('pm-img');
  imgEl.src = imgSrc(p.img);
  imgEl.onerror = function() { this.src = fallbackImg(); };
  imgEl.style.cursor = p.img2 ? 'pointer' : 'default';
  imgEl.title = p.img2 ? 'Clic para ver foto 2' : '';

  var showingImg2 = false;
  imgEl.onclick = function() {
    if (!p.img2) return;
    showingImg2 = !showingImg2;
    imgEl.src = showingImg2 ? imgSrc(p.img2) : imgSrc(p.img);
  };

  // Add image toggle indicator if 2 images
  var imgSide = document.querySelector('.pmodal-img-side');
  var existingDots = imgSide ? imgSide.querySelector('.img-dots') : null;
  if (existingDots) existingDots.remove();
  if (p.img2 && imgSide) {
    var dots = document.createElement('div');
    dots.className = 'img-dots';
    dots.innerHTML = '<span class="dot active"></span><span class="dot"></span>';
    dots.style.cssText = 'position:absolute;bottom:12px;left:0;right:0;text-align:center;display:flex;gap:6px;justify-content:center;z-index:5';
    imgSide.style.position = 'relative';
    imgSide.appendChild(dots);
    imgEl.onclick = function() {
      if (!p.img2) return;
      showingImg2 = !showingImg2;
      imgEl.src = showingImg2 ? imgSrc(p.img2) : imgSrc(p.img);
      var dotEls = dots.querySelectorAll('.dot');
      dotEls[0].classList.toggle('active', !showingImg2);
      dotEls[1].classList.toggle('active', showingImg2);
    };
  }

  document.getElementById('pm-name').textContent = p.name;
  document.getElementById('pm-code').textContent = p.code;
  document.getElementById('pm-desc').textContent = p.desc || '';

  var pt = document.getElementById('pm-prices');
  var rows = '<tr><td>Precio Mayorista</td><td>' + fmt(p.p2) + '</td></tr>';
  rows += '<tr><td>Precio Unidad</td><td>' + fmt(p.p1) + '</td></tr>';
  if (isMay) rows += '<tr><td>Precio Docena (×12)</td><td>' + fmt(p.p3) + '</td></tr>';
  pt.innerHTML = rows;

  var ST_MAP = {ok:'Disponible',low:'Poco stock',out:'Agotado'};
  var ST_CLS = {ok:'st-ok',low:'st-low',out:'st-out'};
  document.getElementById('pm-stock-row').innerHTML =
    '<span class="pcard-stock ' + (ST_CLS[p.stock]||'st-ok') + '">' + (ST_MAP[p.stock]||'Disponible') + '</span>';

  document.getElementById('pm-wa-btn').onclick = function() { buyWA(id); };
  document.getElementById('pmodal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Hero image — clear/remove
function clearHeroImg(idx) {
  if (!confirm('¿Eliminar esta imagen del banner?')) return;
  if (!banner.heroImgData) banner.heroImgData = [null,null,null,null];
  banner.heroImgData[idx] = null;
  heroImgEdits[idx] = null;
  var cell = document.getElementById('hc' + idx);
  if (cell) {
    var img = document.getElementById('hc' + idx + '-img');
    if (img) img.style.display = 'none';
    var del = document.getElementById('hc' + idx + '-del');
    if (del) del.style.display = 'none';
    var chg = document.getElementById('hc' + idx + '-chg');
    if (chg) chg.style.display = 'none';
    var add = cell.querySelector('.hc-add');
    if (add) add.style.display = '';
  }
  saveBannerStore();
  renderHero();
}

// Override setHeroImg
function setHeroImg(idx, e) {
  var f = e.target.files[0]; if (!f) return;
  var r = new FileReader();
  r.onload = function(ev) {
    heroImgEdits[idx] = ev.target.result;
    var img = document.getElementById('hc' + idx + '-img');
    if (img) { img.src = ev.target.result; img.style.display = 'block'; }
    var del = document.getElementById('hc' + idx + '-del');
    if (del) del.style.display = 'flex';
    var chg = document.getElementById('hc' + idx + '-chg');
    if (chg) chg.style.display = 'flex';
    var add = document.querySelector('#hc' + idx + ' .hc-add');
    if (add) add.style.display = 'none';
  };
  r.readAsDataURL(f);
}

// Override populateBannerForm
function populateBannerForm() {
  var fields = { 'b-ey': banner.eyebrow, 'b-ti': banner.title, 'b-su': banner.sub };
  for (var k in fields) {
    var el = document.getElementById(k); if (el) el.value = fields[k] || '';
  }
  heroImgEdits = [null,null,null,null];
  var heroData = banner.heroImgData || [];
  var defaults = banner.heroImages || DEFAULT_BANNER.heroImages;
  for (var i = 0; i < 4; i++) {
    var src = (heroData[i] && heroData[i] !== null) ? heroData[i] : (defaults[i] || '');
    if (!src && prods.length > i) src = imgSrc(prods[i % prods.length].img);
    var imgEl = document.getElementById('hc' + i + '-img');
    var delEl = document.getElementById('hc' + i + '-del');
    var chgEl = document.getElementById('hc' + i + '-chg');
    var addEl = document.querySelector('#hc' + i + ' .hc-add');
    if (src && imgEl) {
      imgEl.src = src; imgEl.style.display = 'block';
      if (delEl) delEl.style.display = 'flex';
      if (chgEl) chgEl.style.display = 'flex';
      if (addEl) addEl.style.display = 'none';
    }
  }
}

// ══ OneDrive Integration ══
function saveOnedriveUrl() {
  var url = document.getElementById('cf-onedrive').value.trim();
  if (!url) { alert('Ingresa una URL de OneDrive'); return; }
  cfg.onedriveUrl = convertOnedriveUrl(url);
  saveCfg();
  showOdStatus('✅ URL guardada. Probando conexión...', 'ok');
  testOnedrive();
}

function convertOnedriveUrl(url) {
  // Convert sharing URL to direct download API URL
  if (url.indexOf('1drv.ms') > -1 || url.indexOf('onedrive.live.com') > -1) {
    var b64 = btoa(url).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
    return 'https://api.onedrive.com/v1.0/shares/u!' + b64 + '/root/content';
  }
  return url;
}

function testOnedrive() {
  var url = cfg.onedriveUrl || document.getElementById('cf-onedrive').value;
  if (!url) { showOdStatus('❌ No hay URL configurada', 'err'); return; }
  showOdStatus('⏳ Probando conexión...', 'info');
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var data = JSON.parse(xhr.responseText);
        if (Array.isArray(data)) {
          prods = data; saveProds(); renderProds(); renderAdmProds();
          showOdStatus('✅ Conexión exitosa — ' + data.length + ' productos cargados desde OneDrive', 'ok');
        } else {
          showOdStatus('⚠️ Archivo encontrado pero no tiene formato correcto (debe ser array JSON)', 'warn');
        }
      } catch(e) {
        showOdStatus('❌ Error al leer el archivo: ' + e.message, 'err');
      }
    } else {
      showOdStatus('❌ No se pudo conectar (error ' + xhr.status + '). Verifica que el enlace sea público.', 'err');
    }
  };
  xhr.onerror = function() {
    showOdStatus('❌ Error de red. El archivo debe estar compartido como "Cualquiera con el enlace".', 'err');
  };
  xhr.send();
}

function disableOnedrive() {
  cfg.onedriveUrl = '';
  saveCfg();
  document.getElementById('cf-onedrive').value = '';
  showOdStatus('OneDrive desactivado. Los datos se guardan localmente.', 'info');
}

function showOdStatus(msg, type) {
  var el = document.getElementById('od-status');
  if (!el) return;
  var colors = { ok:'#2e7d32', err:'#c62828', warn:'#e65100', info:'#555' };
  el.textContent = msg;
  el.style.color = colors[type] || '#555';
}

// Override loadProducts to check OneDrive first
var _origLoadProducts = loadProducts;
function loadProducts(callback) {
  if (cfg.onedriveUrl) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', cfg.onedriveUrl, true);
    xhr.timeout = 5000;
    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          var data = JSON.parse(xhr.responseText);
          if (Array.isArray(data)) { prods = data; saveProds(); callback(); return; }
        } catch(e) {}
      }
      _loadFromGitHub(callback);
    };
    xhr.onerror = xhr.ontimeout = function() { _loadFromGitHub(callback); };
    xhr.send();
  } else {
    _loadFromGitHub(callback);
  }
}

function _loadFromGitHub(callback) {
  if (prods && prods.length) { callback(); return; }
  var savedLocal = localStorage.getItem('chk_prods_v6');
  if (savedLocal) {
    try { prods = JSON.parse(savedLocal); callback(); return; } catch(e) {}
  }
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'data/products.json', true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      try { prods = JSON.parse(xhr.responseText); localStorage.setItem('chk_prods_v6', JSON.stringify(prods)); }
      catch(e) { prods = []; }
    } else { prods = []; }
    callback();
  };
  xhr.onerror = function() { prods = prods || []; callback(); };
  xhr.send();
}

// Add populateCfgForm patch for OneDrive
var _origPopulateCfgForm = populateCfgForm;
function populateCfgForm() {
  _origPopulateCfgForm();
  var odEl = document.getElementById('cf-onedrive');
  if (odEl && cfg.onedriveUrl) odEl.value = cfg.onedriveUrl;
}
