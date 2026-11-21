import { store, today, daysAgo } from './store.js?v=28';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let CUR = localStorage.getItem('mlp_cur') || 'USD';
let cart = [];
const db = () => store.db;
const rol = () => db().usuario?.rol;
const esJefe = () => ['dueno', 'admin'].includes(rol());
const MODS = [['tablero', 'Tablero'], ['vender', 'Vender'], ['ventas', 'Ventas'], ['despacho', 'Por despachar'], ['inventario', 'Inventario'], ['cashea', 'Por cobrar'], ['compras', 'Compras'], ['porpagar', 'Por pagar'], ['caja', 'Caja'], ['clientes', 'Clientes'], ['reportes', 'Reportes']];
const modsDef = r => r === 'almacen' ? ['despacho', 'inventario', 'compras'] : r === 'admin' ? MODS.map(m => m[0]) : r === 'cajero' ? ['vender', 'ventas', 'despacho', 'cashea', 'caja', 'clientes'] : ['vender', 'ventas', 'despacho', 'clientes'];
const puede = k => k === 'ajustes' || rol() === 'dueno' || (db().usuario?.modulos || modsDef(rol())).includes(k);

// ---------- formato ----------
const fmt = (usd, cur = CUR) => cur === 'USD'
  ? '$' + (+usd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : 'Bs ' + (usd * db().tasa.valor).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const both = usd => `${fmt(usd, 'USD')} <small style="color:var(--mut)">· ${fmt(usd, 'VES')}</small>`;
const fdate = d => new Date(d + 'T12:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); };

// ---------- iconos ----------
const I = {
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  sell: '<path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M6 6L5 3H2"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  cashea: '<path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.8 7 7s2 3 5 3.6 5 1.6 5 3.9-2.2 3.9-5 3.9-5-1.2-5-3.2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.8.8 3 2.6 3.5 5.2"/>',
  truck: '<path d="M1 6h13v10H1zM14 10h4l3 3v3h-7"/><circle cx="5.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
  inbox: '<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
  wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20M16 15h2M6 6V4h12v2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
};
const ico = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;
const NAV = [['tablero', 'Tablero', 'home'], ['vender', 'Vender', 'sell'], ['ventas', 'Ventas', 'list'], ['despacho', 'Despacho', 'truck'], ['inventario', 'Inventario', 'box'], ['cashea', 'Por cobrar', 'cashea'], ['compras', 'Compras', 'inbox'], ['porpagar', 'Por pagar', 'wallet'], ['caja', 'Caja', 'cash'], ['clientes', 'Clientes', 'users'], ['reportes', 'Reportes', 'chart'], ['ajustes', 'Ajustes', 'cog']];

// ---------- cálculos ----------
const enRango = (v, n) => v.fecha >= daysAgo(n - 1);
const costoVenta = v => (v.items || []).reduce((a, i) => a + i.costo * i.cant, 0);
function metricas(n = 30) {
  const vs = db().ventas.filter(v => enRango(v, n));
  const prev = db().ventas.filter(v => v.fecha >= daysAgo(2 * n - 1) && v.fecha < daysAgo(n - 1));
  const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);
  const ventas = sum(vs, v => v.total), ventasPrev = sum(prev, v => v.total);
  const costo = sum(vs, costoVenta), comision = sum(vs, v => v.comision);
  const gastos = sum(db().gastos.filter(g => g.fecha >= daysAgo(n - 1)), g => g.monto);
  const porCobrar = sum(db().ventas.filter(v => v.tipo === 'cashea' && !v.liquidado), v => v.netoCashea);
  const vencido = [];
  const cashea = vs.filter(v => v.tipo === 'cashea');
  const porProd = {}, porVend = {};
  vs.forEach(v => { (v.items || []).forEach(i => { const p = porProd[i.nombre] ||= { n: 0, ing: 0, gan: 0 }; p.n += i.cant; p.ing += i.precio * i.cant; p.gan += (i.precio - i.costo) * i.cant; }); const k = v.vendedor || '—'; porVend[k] = (porVend[k] || 0) + v.total; });
  const dias = [...Array(n)].map((_, i) => { const d = daysAgo(n - 1 - i); return { d, v: sum(vs.filter(x => x.fecha === d), x => x.total) }; });
  const stockValor = sum(db().productos.filter(p => !p.varios), p => p.costo * p.stock);
  const bajos = db().productos.filter(p => !p.varios && p.stock <= p.min);
  const vendidos = new Set(db().ventas.filter(v => enRango(v, 45)).flatMap(v => (v.items || []).map(i => i.producto_id || i.productoId)));
  const dormidos = db().productos.filter(p => !p.varios && p.stock > 0 && !vendidos.has(p.id));
  return { vs, ventas, ventasPrev, costo, comision, gastos, utilidad: ventas - costo - comision - gastos, margen: ventas ? (ventas - costo) / ventas : 0, porCobrar, vencido, cashea, porProd, porVend, dias, stockValor, bajos, dormidos, ticket: vs.length ? ventas / vs.length : 0 };
}

// ---------- copiloto (insights) ----------
function insights(m) {
  const out = [];
  const delta = m.ventasPrev ? (m.ventas - m.ventasPrev) / m.ventasPrev : 0;
  if (m.ventasPrev) out.push([delta >= 0 ? '📈' : '📉', delta >= 0 ? 'rgba(52,211,153,.15)' : 'rgba(251,113,133,.15)', `Vendiste ${Math.abs(delta * 100).toFixed(0)}% ${delta >= 0 ? 'más' : 'menos'} que los 30 días anteriores.`, `${fmt(m.ventas)} contra ${fmt(m.ventasPrev)}`]);
  const top = Object.entries(m.porProd).sort((a, b) => b[1].gan - a[1].gan)[0];
  if (top) out.push(['🏆', 'rgba(245,165,36,.15)', `${top[0]} es tu producto más rentable.`, `Dejó ${fmt(top[1].gan)} de ganancia en ${top[1].n} ventas. Que nunca falte.`]);
  if (m.vencido.length) out.push(['⏰', 'rgba(251,113,133,.15)', `Cashea tiene ${m.vencido.length} liquidaciones atrasadas.`, `${fmt(m.vencido.reduce((a, v) => a + v.netoCashea, 0))} que ya deberían estar en tu cuenta.`]);
  if (m.bajos.length) out.push(['📦', 'rgba(96,165,250,.15)', `${m.bajos.length} productos están en stock mínimo.`, m.bajos.slice(0, 3).map(p => p.nombre).join(', ')]);
  if (m.dormidos.length) out.push(['😴', 'rgba(167,139,250,.15)', `${m.dormidos.length} productos no se venden hace 45 días.`, `Hay ${fmt(m.dormidos.reduce((a, p) => a + p.costo * p.stock, 0))} parados. Prueba una oferta.`]);
  const pc = m.vs.length ? m.cashea.length / m.vs.length : 0;
  if (m.vs.length) out.push(['💳', 'rgba(245,165,36,.12)', `${(pc * 100).toFixed(0)}% de tus ventas son con Cashea.`, `Te costó ${fmt(m.comision)} en comisiones este mes.`]);
  return out;
}

// ---------- gráficos SVG ----------
function areaChart(dias) {
  const W = 600, H = 190, max = Math.max(1, ...dias.map(d => d.v));
  const pts = dias.map((d, i) => [i * W / (dias.length - 1), H - 20 - (d.v / max) * (H - 40)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F5A524" stop-opacity=".45"/><stop offset="1" stop-color="#F5A524" stop-opacity="0"/></linearGradient></defs>
  <path d="${line} L${W} ${H} L0 ${H}Z" fill="url(#g)"/><path d="${line}" fill="none" stroke="#FFC861" stroke-width="2.5" stroke-linejoin="round"/>
  ${pts.map((p, i) => dias[i].v ? `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="#FFC861"><title>${fdate(dias[i].d)}: ${fmt(dias[i].v)}</title></circle>` : '').join('')}</svg>`;
}
function donut(parts) {
  const tot = parts.reduce((a, p) => a + p.v, 0) || 1; let acc = 0; const R = 50, C = 2 * Math.PI * R;
  return `<div class="donut"><svg width="130" height="130" viewBox="0 0 130 130"><g transform="rotate(-90 65 65)">${parts.map(p => { const l = p.v / tot * C; const s = `<circle cx="65" cy="65" r="${R}" fill="none" stroke="${p.c}" stroke-width="16" stroke-dasharray="${l} ${C - l}" stroke-dashoffset="${-acc}" stroke-linecap="butt"/>`; acc += l; return s; }).join('')}</g></svg>
  <div class="legend">${parts.map(p => `<div><i style="background:${p.c}"></i>${p.k} <b>${(p.v / tot * 100).toFixed(0)}%</b></div>`).join('')}</div></div>`;
}

// ---------- vistas ----------
const V = {};
V.tablero = () => {
  const m = metricas(30), d = m.ventasPrev ? (m.ventas - m.ventasPrev) / m.ventasPrev * 100 : 0;
  const cont = m.vs.filter(v => v.tipo === 'contado').reduce((a, v) => a + v.total, 0);
  const topV = Object.entries(m.porVend).sort((a, b) => b[1] - a[1]);
  const topP = Object.entries(m.porProd).sort((a, b) => b[1].ing - a[1].ing).slice(0, 5);
  const hoy = db().ventas.filter(v => v.fecha === today()), sum = l => l.reduce((a, v) => a + +v.total, 0);
  const hC = hoy.filter(v => v.tipo === 'contado'), hR = hoy.filter(v => v.tipo === 'credito'), abH = db().abonos.filter(x => x.fecha === today()), hK = hoy.filter(v => v.tipo === 'cashea'), iniK = hK.reduce((a, v) => a + +v.inicial, 0);
  return `<div class="grid">
  <div class="card hero c12 hoy"><h3>Ventas de hoy <span class="kbd">${fdate(today())}</span></h3><div class="hoy3 h5">
   <div><small>Contado</small><b>${fmt(sum(hC))}</b><span>${hC.length} ventas · ${fmt(sum(hC), 'VES')}</span></div>
   <div><small>Crédito Cashea</small><b>${fmt(sum(hK))}</b><span>${hK.length} ventas · inicial ${fmt(iniK)}</span></div>
   <div><small>Crédito propio</small><b>${fmt(sum(hR))}</b><span>${hR.length} ventas · inicial ${fmt(hR.reduce((s, v) => s + +v.inicial, 0))}</span></div>
   <div><small>Abonos del día</small><b class="up">${fmt(abH.reduce((s, x) => s + x.monto, 0))}</b><span>${abH.length} abonos · ${fmt(abH.reduce((s, x) => s + x.monto, 0), 'VES')}</span></div>
   <div class="tt"><small>Total del día</small><b>${fmt(sum(hoy))}</b><span>${hoy.length} ventas · entró a caja ${fmt(hoy.reduce((s, v) => s + +v.inicial, 0) + abH.reduce((s, x) => s + x.monto, 0))}</span></div></div></div>
  <div class="card kpi hero c6"><h3>Ventas últimos 30 días <span class="tag ${d >= 0 ? 't-ok' : 't-bad'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(0)}%</span></h3><div class="v">${fmt(m.ventas)}</div><div class="s">${m.vs.length} ventas · ticket promedio ${fmt(m.ticket)}</div></div>
  <div class="card kpi c3"><div class="glow" style="background:var(--ok)"></div><h3>Utilidad neta</h3><div class="v ${m.utilidad >= 0 ? 'up' : 'down'}">${fmt(m.utilidad)}</div><div class="s">Margen bruto ${(m.margen * 100).toFixed(0)}% · gastos ${fmt(m.gastos)}</div></div>
  <div class="card kpi c3"><div class="glow" style="background:var(--violet)"></div><h3>Por cobrar</h3><div class="v">${fmt(m.porCobrar + db().ventas.reduce((s, v) => s + (v.saldo || 0), 0))}</div><div class="s">Clientes ${fmt(db().ventas.reduce((s, v) => s + (v.saldo || 0), 0))} · Cashea ${fmt(m.porCobrar)}'}</div></div>
  <div class="card c8"><h3>Ventas por día <span class="kbd">30 días</span></h3>${areaChart(m.dias)}</div>
  <div class="card c4"><h3>Forma de venta</h3>${donut([{ k: 'Contado', v: cont, c: '#F5A524' }, { k: 'Cashea', v: m.ventas - cont, c: '#A78BFA' }])}<div class="s" style="margin-top:14px;color:var(--mut);font-size:13px">Inventario a costo: <b style="color:var(--txt)">${fmt(m.stockValor)}</b></div></div>
  <div class="card c7"><h3>✨ Copiloto gerencial</h3>${insights(m).map(([e, bg, t, s]) => `<div class="ins"><div class="dot" style="background:${bg}">${e}</div><div><p>${esc(t)}</p><small>${esc(s)}</small></div></div>`).join('') || '<div class="empty">Registra tus primeras ventas y aquí verás consejos.</div>'}</div>
  <div class="card c5"><h3>Top productos</h3><table class="tbl"><tbody>${topP.map(([n, p]) => `<tr><td>${esc(n)}<br><small style="color:var(--mut)">${p.n} vendidos</small></td><td style="text-align:right"><b>${fmt(p.ing)}</b><br><small class="up">+${fmt(p.gan)}</small></td></tr>`).join('')}</tbody></table>
  <h3 style="margin-top:18px">Vendedores</h3>${topV.map(([n, v], i) => `<div style="display:flex;justify-content:space-between;padding:6px 0"><span>${['🥇', '🥈', '🥉'][i] || '•'} ${esc(n)}</span><b>${fmt(v)}</b></div>`).join('')}</div>
  </div>`;
};

V.vender = () => {
  const q = (window._q || '').toLowerCase();
  const ps = db().productos.filter(p => !q || p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
  const tot = cart.reduce((a, i) => a + i.precio * i.cant, 0);
  return `<div class="grid"><div class="c8" style="grid-column:span 8">
  <input class="in" placeholder="🔎  Buscar producto…" value="${esc(window._q || '')}" oninput="window._q=this.value;App.go('vender',true)" style="margin-bottom:14px;padding:15px 18px;font-size:16px" ${window._q ? 'autofocus' : ''}>
  <div class="tiles">${ps.map((p, i) => `<div class="tile" style="animation-delay:${i * 25}ms;${p.stock <= 0 && !p.varios ? 'opacity:.4' : ''}" onclick="App.addCart('${p.id}')"><div class="ic">${p.icono}</div><b>${esc(p.nombre)}</b><small>${p.varios ? 'Precio libre' : esc(p.categoria) + ' · ' + p.stock + ' disp.'}</small><div class="row"><span class="pr">${p.varios ? '$ —' : fmt(p.precio)}${+p.precio2 ? `<small style="display:block;font-size:11px;color:var(--mut);font-weight:400">P2 ${fmt(p.precio2)}</small>` : ''}</span><span class="tag t-am">+ Agregar</span></div></div>`).join('')}</div></div>
  <div class="card c4" style="grid-column:span 4;align-self:start;position:sticky;top:20px"><h3>Venta actual <span>${cart.length ? `<button class="pill del" onclick="App.vaciar()">Vaciar</button> ` : ''}${cart.length}</span></h3>
  ${cart.length ? cart.map(i => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)"><div><b style="font-size:14px">${esc(i.nombre)}</b><br><small style="color:var(--mut)">${fmt(i.precio)}</small>${i.p2 ? ` <span class="pp"><button class="${i.nivel === 1 ? 'on' : ''}" onclick="App.nivel('${i.k}',1)">P1</button><button class="${i.nivel === 2 ? 'on' : ''}" onclick="App.nivel('${i.k}',2)">P2</button></span>` : ''}</div><div style="display:flex;gap:6px;align-items:center"><button class="pill" onclick="App.qty('${i.k}',-1)">−</button>${i.cant}<button class="pill" onclick="App.qty('${i.k}',1)">+</button><button class="pill del" title="Quitar" onclick="App.quitar('${i.k}')">🗑</button></div></div>`).join('') : '<div class="empty">Toca un producto para agregarlo</div>'}
  <div class="sum"><div class="tot"><span>Total</span><span>${fmt(tot, 'USD')}</span></div><div><span style="color:var(--mut)">En bolívares</span><span>${fmt(tot, 'VES')}</span></div></div>
  <button class="btn pri block" ${cart.length ? '' : 'disabled style="opacity:.4"'} onclick="App.checkout()">Cobrar →</button></div></div>`;
};

V.inventario = () => {
  const cats = [...new Set(db().productos.map(p => p.categoria))];
  return `${esJefe() ? '<div style="margin-bottom:16px"><button class="btn pri" onclick="App.prodForm()">+ Nuevo producto</button></div>' : ''}
  ${cats.map(c => `<h3 style="color:var(--mut);font-size:13px;letter-spacing:1.2px;text-transform:uppercase;margin:18px 0 10px">${esc(c)}</h3><div class="tiles">${db().productos.filter(p => p.categoria === c).map((p, i) => { if (p.varios) return `<div class="tile" style="animation-delay:${i * 25}ms"><div class="ic">${p.icono}</div><b>${esc(p.nombre)}</b><small>Precio libre al facturar · no maneja existencia</small><div class="row"><span class="pr">$ —</span><span class="tag t-am">Varios</span></div></div>`; const pct = Math.min(100, p.stock / Math.max(p.min * 3, 1) * 100); const mg = p.precio ? (p.precio - p.costo) / p.precio * 100 : 0; return `<div class="tile" style="animation-delay:${i * 25}ms" onclick="${esJefe() ? `App.prodForm('${p.id}')` : ''}"><div style="display:flex;justify-content:space-between"><div class="ic">${p.icono}</div>${p.stock <= p.min ? '<span class="tag t-bad" style="height:fit-content">Reponer</span>' : ''}</div><b>${esc(p.nombre)}</b><small>Costo ${fmt(p.costo)} · margen ${mg.toFixed(0)}% · garantía ${p.garantiaMeses || 0}m</small><div class="row"><span class="pr">${fmt(p.precio)}</span><b>${p.stock} <small>uds</small></b></div><div class="bar"><i style="width:${pct}%;${p.stock <= p.min ? 'background:var(--bad)' : ''}"></i></div></div>`; }).join('')}</div>`).join('') || '<div class="empty">Aún no hay productos.</div>'}`;
};

V._cashea = () => {
  const pend = db().ventas.filter(v => v.tipo === 'cashea' && !v.liquidado).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const liq = db().ventas.filter(v => v.tipo === 'cashea' && v.liquidado).slice(-8).reverse();
  const tot = pend.reduce((a, v) => a + v.netoCashea, 0), rec = db().ventas.filter(v => v.tipo === 'cashea' && v.liquidado && (v.fecha_liquidacion || v.fecha) >= today().slice(0, 8) + '01');
  const cli = id => db().clientes.find(c => c.id === id)?.nombre || '—';
  return `<div class="grid">
  <div class="card kpi hero c4"><h3>Por recibir de Cashea</h3><div class="v">${fmt(tot)}</div><div class="s">${pend.length} ventas pendientes</div></div>
  <div class="card kpi c4"><h3>Recibido este mes</h3><div class="v up">${fmt(rec.reduce((a, v) => a + v.netoCashea, 0))}</div><div class="s">${rec.length} liquidaciones marcadas</div></div>
  <div class="card kpi c4"><h3>Comisión Cashea</h3><div class="v">${db().config.comisionCashea}%</div><div class="s">Sobre lo financiado · cámbiala en Ajustes</div></div>
  <div class="card c12"><h3>Liquidaciones pendientes</h3><div style="overflow:auto"><table class="tbl"><thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Inicial cobrada</th><th>Financiado</th><th>Neto a recibir</th><th>Estado</th><th></th></tr></thead><tbody>
  ${pend.map(v => `<tr><td>${v.numero}</td><td>${fdate(v.fecha)}</td><td>${esc(cli(v.clienteId))}</td><td>${fmt(v.inicial)}</td><td>${fmt(v.financiado)}</td><td><b>${fmt(v.netoCashea)}</b></td><td><span class="tag t-in">Pendiente</span></td><td>${rol() !== 'vendedor' ? `<button class="pill" onclick="App.liquidar('${v.id}')">Marcar recibido</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="8" class="empty">Nada pendiente 🎉</td></tr>'}
  </tbody></table></div></div>
  <div class="card c12"><h3>Recibido recientemente</h3><table class="tbl"><tbody>${liq.map(v => `<tr><td>#${v.numero}</td><td>${esc(cli(v.clienteId))}</td><td>${fmt(v.netoCashea)}</td><td>${v.fechaLiquidacion||v.fecha_liquidacion?fdate(v.fecha_liquidacion):''}</td><td><span class="tag t-ok">Recibido</span></td></tr>`).join('')}</tbody></table></div></div>`;
};

V.caja = () => {
  const hoy = db().ventas.filter(v => v.fecha === today());
  const met = {}; hoy.forEach(v => (v.pagos?.length ? v.pagos.map(x => [x.metodo, x.usd]) : [[v.metodo || '—', v.inicial]]).forEach(([k, u]) => met[k] = (met[k] || 0) + +u));
  const abH = db().abonos.filter(x => x.fecha === today()); abH.forEach(x => (x.pagos?.length ? x.pagos.map(p => [p.metodo, p.usd]) : [[x.metodo || '—', x.monto]]).forEach(([k, u]) => met[k] = (met[k] || 0) + +u));
  const ing = hoy.reduce((a, v) => a + v.inicial, 0) + abH.reduce((a, x) => a + x.monto, 0);
  const gh = db().gastos.filter(g => g.fecha === today()), eg = gh.reduce((a, g) => a + g.monto, 0);
  const gm = db().gastos.slice().reverse().slice(0, 12);
  return `<div class="grid">
  <div class="card kpi hero c4"><h3>Entró hoy a caja</h3><div class="v">${fmt(ing)}</div><div class="s">${hoy.length} ventas + ${abH.length} abonos</div></div>
  <div class="card kpi c4"><h3>Gastos de hoy</h3><div class="v down">${fmt(eg)}</div><div class="s">${gh.length} movimientos</div></div>
  <div class="card kpi c4"><h3>Saldo del día</h3><div class="v ${ing - eg >= 0 ? 'up' : 'down'}">${fmt(ing - eg)}</div><div class="s">Tasa ${db().tasa.valor} Bs/$</div></div>
  <div class="card c5"><h3>Por método de pago</h3>${Object.entries(met).map(([k, v]) => `<div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--line)"><span>${esc(k)}</span><b>${both(v)}</b></div>`).join('') || '<div class="empty">Sin ventas hoy todavía</div>'}</div>
  <div class="card c7"><h3>Gastos ${esJefe() ? `<button class="pill" onclick="App.gastoForm()">+ Gasto</button>` : ''}</h3><table class="tbl"><tbody>${gm.map(g => `<tr><td>${fdate(g.fecha)}</td><td>${esc(g.concepto)}<br><small style="color:var(--mut)">${esc(g.categoria)}</small></td><td style="text-align:right" class="down">−${fmt(g.monto)}</td></tr>`).join('')}</tbody></table></div></div>`;
};

V.clientes = () => {
  const stats = id => { const vs = db().ventas.filter(v => v.clienteId === id); return { n: vs.length, t: vs.reduce((a, v) => a + v.total, 0), u: vs.at(-1)?.fecha }; };
  const q = (window._qc || '').toLowerCase(), dig = q.replace(/\D/g, '');
  const cs = db().clientes.filter(c => !q || c.nombre.toLowerCase().includes(q) || (c.direccion || '').toLowerCase().includes(q) || (dig && ((c.cedula || '').replace(/\D/g, '').includes(dig) || (c.telefono || '').replace(/\D/g, '').includes(dig))));
  const wa = t => '58' + t.replace(/\D/g, '').replace(/^0/, '');
  return `<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap"><input class="in" id="qc" placeholder="🔎 Buscar por nombre, cédula, teléfono o dirección…" value="${esc(window._qc || '')}" oninput="window._qc=this.value;App.go('clientes',true)" style="flex:1;min-width:220px"><button class="btn pri" onclick="App.clienteForm()">+ Nuevo cliente</button></div>
  <div class="tiles">${cs.map((c, i) => { const s = stats(c.id); return `<div class="tile" style="animation-delay:${i * 20}ms" onclick="App.clienteForm('${c.id}')"><div style="display:flex;justify-content:space-between;align-items:center"><div class="ic" style="font-size:20px;font-weight:700">${esc(c.nombre.trim()[0] || '?').toUpperCase()}</div>${c.telefono ? `<a class="tag t-ok" target="_blank" href="https://wa.me/${wa(c.telefono)}" onclick="event.stopPropagation()">WhatsApp</a>` : ''}</div><b>${esc(c.nombre)}</b><small>${esc(c.cedula || 'Sin cédula')} · ${esc(c.telefono || 'sin teléfono')}</small><small>📍 ${esc(c.direccion || 'Sin dirección')}</small>${(sd => sd > 0.009 ? `<span class="tag t-am" style="align-self:flex-start">Debe ${fmt(sd)}</span>` : '')(db().ventas.filter(v => v.clienteId === c.id && v.tipo === 'credito').reduce((s, v) => s + v.saldo, 0))}<div class="row"><span class="pr">${fmt(s.t)}</span><small>${s.n} compras${s.u ? ' · ' + fdate(s.u) : ''}</small></div></div>`; }).join('') || '<div class="empty">No hay clientes con ese filtro.</div>'}</div>`;
};

V.ajustes = () => `<div class="grid">
  <div class="card c6"><h3>Tasa del día</h3><div class="kpi"><div class="v">${db().tasa.valor} <small style="font-size:14px;color:var(--mut)">Bs por $</small></div><div class="s">${esc(db().tasa.fuente)} · ${db().tasa.fecha ? fdate(db().tasa.fecha) : ''}</div></div>
  ${esJefe() ? `<div class="row2" style="margin-top:16px"><input class="in" id="tasaIn" type="number" step="0.01" placeholder="Nueva tasa"><button class="btn gh" onclick="App.setTasa()">Guardar manual</button></div><button class="btn gh block" style="margin-top:10px" onclick="App.bcv(true)">⟳ Traer tasa BCV</button>` : ''}</div>
  ${esJefe() ? `<div class="card c6"><h3>Cashea</h3><div class="fld"><label>Comisión sobre lo financiado (%)</label><input class="in" id="comIn" type="number" step="0.1" value="${db().config.comisionCashea}"></div><button class="btn gh" onclick="App.setCom()">Guardar</button></div>` : ''}
  ${esJefe() ? `<div class="card c6"><h3>Ticket de venta</h3>${(t => `<div class="fld"><label>Nombre del negocio</label><input class="in" id="tkN" value="${esc(t.nombre)}"></div><div class="row2"><div class="fld"><label>RIF</label><input class="in" id="tkR" placeholder="J-" value="${esc(t.rif)}"></div><div class="fld"><label>Teléfono</label><input class="in" id="tkT" value="${esc(t.telefono)}"></div></div><div class="fld"><label>Dirección</label><input class="in" id="tkD" value="${esc(t.direccion)}"></div><div class="fld"><label>Instagram</label><input class="in" id="tkI" placeholder="@" value="${esc(t.instagram)}"></div><div class="fld"><label>WhatsApp del almacén</label><input class="in" id="tkA" placeholder="0414-0000000" value="${esc(t.almacen || '')}"></div><div class="fld"><label>Mensaje al pie</label><input class="in" id="tkP" value="${esc(t.pie)}"></div><div class="tkchk">${[['logo', 'Logo'], ['bs', 'Monto en Bs'], ['cliente', 'Datos del cliente'], ['pagos', 'Formas de pago'], ['garantia', 'Garantía'], ['vendedor', 'Vendedor']].map(([k, l]) => `<label><input type="checkbox" id="tk_${k}" ${t[k] ? 'checked' : ''}> ${l}</label>`).join('')}</div><div class="row2"><button class="btn gh" onclick="App.tkPrev()">Vista previa</button><button class="btn pri" onclick="App.tkSave()">Guardar</button></div>`)(TK())}</div>` : ''}
  ${esJefe() ? `<div class="card c6"><h3>Categorías</h3><div class="chips">${CATS().map((c, k) => `<span class="chip">${esc(c)}<button onclick="App.catDel(${k})" title="Quitar">×</button></span>`).join('')}</div><div class="row2" style="margin-top:12px"><input class="in" id="catIn" placeholder="Nueva categoría"><button class="btn pri" onclick="App.catAdd()">+ Agregar</button></div></div>` : ''}
  <div class="card c6"><h3>Respaldo</h3><p style="color:var(--mut);margin-bottom:14px">Descarga toda la base de datos en un Excel, una hoja por tabla.</p><button class="btn pri" onclick="App.respaldar()">⬇ Respaldar ahora</button></div>
  ${rol() === 'dueno' ? `<div class="card c6"><h3>Usuarios <button class="pill" onclick="App.userForm()">+ Nuevo usuario</button></h3>${db().perfiles.map(u => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);gap:8px"><span>${esc(u.nombre)}<br><small style="color:var(--mut)">${esc(u.email || '')}</small></span>${u.id === db().usuario.id ? '<span class="tag t-vi">Dueño (tú)</span>' : `<span style="display:flex;gap:6px;align-items:center"><span class="tag ${u.activo ? 't-in' : 't-bad'}">${u.activo ? u.rol : 'Bloqueado'}</span><button class="pill" onclick="App.userForm('${u.id}')">Editar</button></span>`}</div>`).join('')}<p style="color:var(--mut);font-size:12px;margin-top:10px">Solo tú creas usuarios y eliges a qué módulos entra cada uno.</p>
  <button class="btn gh block" style="margin-top:16px" onclick="App.borrarDemo()">🧹 Borrar datos de demostración</button></div>` : ''}
  <div class="card c6"><h3>Sesión</h3><p style="margin-bottom:12px">${esc(db().usuario.nombre)} · <span class="tag t-in">${rol()}</span></p><button class="btn gh" onclick="App.logout()">Cerrar sesión</button></div></div>`;

// ---------- cuentas por cobrar ----------
const CX = window.CX = { tab: 'credito', q: '', est: 'saldo', d: '', h: '' };
const cxData = () => {
  const cli = id => db().clientes.find(c => c.id === id), q = CX.q.trim().toLowerCase();
  const vs = db().ventas.filter(v => v.tipo === 'credito' && (CX.est === 'todas' || (CX.est === 'saldo' ? v.saldo > 0.009 : v.saldo <= 0.009)) && (!CX.d || v.fecha >= CX.d) && (!CX.h || v.fecha <= CX.h)
    && (!q || (c => c && (c.nombre.toLowerCase().includes(q) || (c.cedula || '').toLowerCase().includes(q) || (c.telefono || '').includes(q)))(cli(v.clienteId))));
  const S = f => vs.reduce((s, v) => s + (+f(v) || 0), 0), dias = v => Math.round((new Date(today()) - new Date(v.fecha)) / 864e5);
  return { vs, cli, dias, total: S(v => v.total), ini: S(v => v.inicial), abo: S(v => v.abonado), saldo: S(v => v.saldo) };
};
V.cashea = () => {
  const segm = `<div class="card c12" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div class="cur"><button class="${CX.tab === 'credito' ? 'on' : ''}" onclick="CX.tab='credito';App.go('cashea')">🤝 Clientes</button><button class="${CX.tab === 'cashea' ? 'on' : ''}" onclick="CX.tab='cashea';App.go('cashea')">💳 Cashea</button></div>${CX.tab === 'credito' ? `<input class="in" id="qx" placeholder="🔎 Buscar cliente…" value="${esc(CX.q)}" oninput="CX.q=this.value;App.go('cashea');setTimeout(()=>{const i=document.querySelector('#qx');i.focus();i.setSelectionRange(i.value.length,i.value.length)})" style="flex:1;min-width:180px;max-width:340px">` : ''}</div>`;
  if (CX.tab === 'cashea') return V._cashea().replace('<div class="grid">', '<div class="grid">' + segm);
  const cli = id => db().clientes.find(c => c.id === id), q = CX.q.trim().toLowerCase();
  const abiertas = db().ventas.filter(v => v.tipo === 'credito' && v.saldo > 0.009);
  const R = cxData(), lst = R.vs;
  const grupos = {}; lst.forEach(v => (grupos[v.clienteId] ||= []).push(v));
  const deuda = abiertas.reduce((s, v) => s + v.saldo, 0), mes = db().abonos.filter(x => x.fecha >= today().slice(0, 8) + '01');
  return `<div class="grid">${segm}
  <div class="card kpi hero c4"><h3>Clientes te deben</h3><div class="v">${fmt(deuda)}</div><div class="s">${abiertas.length} cuentas abiertas · ${fmt(deuda, 'VES')}</div></div>
  <div class="card kpi c4"><h3>Abonos este mes</h3><div class="v up">${fmt(mes.reduce((s, x) => s + x.monto, 0))}</div><div class="s">${mes.length} abonos registrados</div></div>
  <div class="card kpi c4"><h3>Clientes con saldo</h3><div class="v">${new Set(abiertas.map(v => v.clienteId)).size}</div><div class="s">Toca Abonar para registrar un pago</div></div>
  <div class="card c12"><h3>Reporte de cuentas por cobrar</h3><div class="cxf">
   <div class="fld"><label>Estado</label><select class="in" onchange="CX.est=this.value;App.go('cashea')">${[['saldo', 'Con saldo'], ['saldadas', 'Saldadas'], ['todas', 'Todas']].map(([k, t]) => `<option value="${k}" ${CX.est === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
   <div class="fld"><label>Venta desde</label><input class="in" type="date" value="${CX.d}" onchange="CX.d=this.value;App.go('cashea')"></div>
   <div class="fld"><label>Hasta</label><input class="in" type="date" value="${CX.h}" onchange="CX.h=this.value;App.go('cashea')"></div>
   <div class="fld" style="display:flex;gap:8px;align-items:flex-end"><button class="btn pri" onclick="App.cxPDF()">🖨 PDF</button><button class="btn gh" onclick="App.cxExcel()">Excel</button>${CX.d || CX.h || CX.est !== 'saldo' || CX.q ? `<button class="pill" onclick="Object.assign(CX,{est:'saldo',d:'',h:'',q:''});App.go('cashea')">Limpiar</button>` : ''}</div></div>
   <div class="cxb" style="font-size:13px;margin-top:6px"><span>${R.vs.length} cuentas</span><span>Total ${fmt(R.total)}</span><span>Inicial ${fmt(R.ini)}</span><span>Abonado ${fmt(R.abo)}</span><b style="color:var(--text)">Saldo ${fmt(R.saldo)}</b></div></div>
  ${Object.entries(grupos).sort((x, y) => y[1].reduce((s, v) => s + v.saldo, 0) - x[1].reduce((s, v) => s + v.saldo, 0)).map(([id, vs]) => { const c = cli(id) || { nombre: 'Sin cliente' }; return `<div class="card c6"><h3>${esc(c.nombre)} <span class="tag t-am">${fmt(vs.reduce((s, v) => s + v.saldo, 0))}</span></h3><small style="color:var(--mut)">${esc(c.cedula || '')} ${c.telefono ? '· ' + esc(c.telefono) : ''}</small>
   ${vs.map(v => `<div class="cx"><div><b>#${v.numero}</b> <small>${fdate(v.fecha)}</small><br><small>${esc((v.items || []).map(i => i.nombre).join(', '))}</small><div class="cxb"><span>Total ${fmt(v.total)}</span><span>Inicial ${fmt(v.inicial)}</span><span>Abonado ${fmt(v.abonado)}</span></div></div><div style="text-align:right"><div class="cxs">${fmt(v.saldo)}</div>${v.saldo > 0.009 ? `<button class="btn pri" style="padding:8px 14px;margin-top:6px" onclick="App.abonoForm('${v.id}')">Abonar</button>` : '<span class="tag t-ok">Saldada</span>'}<br><button class="pill" style="margin-top:6px" onclick="App.historial('${v.id}')">Historial</button></div></div>`).join('')}</div>`; }).join('') || `<div class="card c12"><div class="empty">${q || CX.d || CX.h || CX.est !== 'saldo' ? 'Ninguna cuenta coincide con el filtro.' : 'Ningún cliente te debe 🎉'}</div></div>`}</div>`;
};

// ---------- ventas ----------
const VF = window.VF = { modo: 'hoy', d: today(), h: today(), tipo: '', q: '', vend: '' };
const tipoTag = v => `<span class="tag ${v.tipo === 'cashea' ? 't-vi' : v.tipo === 'credito' ? 't-am' : 't-ok'}">${{ cashea: 'Cashea', credito: 'Crédito' }[v.tipo] || 'Contado'}</span>`;
const waNum = t => t ? '58' + String(t).replace(/\D/g, '').replace(/^58/, '').replace(/^0/, '') : '';
V.ventas = () => {
  const [d, h] = VF.modo === 'todas' ? ['0000', '9999'] : rango(VF), q = VF.q.trim().toLowerCase(), cli = id => db().clientes.find(c => c.id === id);
  const vends = [...new Set(db().ventas.map(v => v.vendedor).filter(Boolean))];
  const vs = db().ventas.filter(v => v.fecha >= d && v.fecha <= h && (!VF.tipo || v.tipo === VF.tipo) && (!VF.vend || v.vendedor === VF.vend) && (!q || String(v.numero) === q.replace('#', '') || (c => c && (c.nombre.toLowerCase().includes(q) || (c.cedula || '').toLowerCase().includes(q) || (c.telefono || '').includes(q)))(cli(v.clienteId)) || (v.items || []).some(i => i.nombre.toLowerCase().includes(q)))).slice().reverse();
  const tot = vs.reduce((s, v) => s + v.total, 0);
  const re = `onchange="App.go('ventas')"`;
  return `<div class="grid"><div class="card c12"><div class="chips">${[['hoy', 'Hoy'], ['semana', 'Esta semana'], ['mes', 'Este mes'], ['rango', 'Rango'], ['todas', 'Todas']].map(([m, l]) => `<button class="pill ${VF.modo === m ? 'on' : ''}" onclick="VF.modo='${m}';App.go('ventas')">${l}</button>`).join('')}</div>
  ${VF.modo === 'rango' ? `<div class="row2" style="margin-top:12px"><div class="fld"><label>Desde</label><input class="in" type="date" value="${VF.d}" onchange="VF.d=this.value;App.go('ventas')"></div><div class="fld"><label>Hasta</label><input class="in" type="date" value="${VF.h}" onchange="VF.h=this.value;App.go('ventas')"></div></div>` : ''}
  <div class="cxf" style="margin-top:12px"><div class="fld" style="grid-column:span 2"><label>Buscar</label><input class="in" id="vq" placeholder="🔎 Cliente, cédula, # nota o producto" value="${esc(VF.q)}" oninput="VF.q=this.value;App.go('ventas');setTimeout(()=>{const i=document.querySelector('#vq');i.focus();i.setSelectionRange(i.value.length,i.value.length)})"></div>
   <div class="fld"><label>Tipo</label><select class="in" onchange="VF.tipo=this.value;App.go('ventas')">${[['', 'Todas'], ['contado', 'Contado'], ['cashea', 'Cashea'], ['credito', 'Crédito']].map(([k, l]) => `<option value="${k}" ${VF.tipo === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
   <div class="fld"><label>Vendedor</label><select class="in" onchange="VF.vend=this.value;App.go('ventas')"><option value="">Todos</option>${vends.map(n => `<option ${VF.vend === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div></div>
  <div class="cxb" style="font-size:13px;margin-top:4px"><span>${vs.length} ventas</span><b style="color:var(--text)">Total ${fmt(tot)}</b><span>${fmt(tot, 'VES')}</span></div></div>
  <div class="card c12">${vs.map(v => `<div class="vrow" onclick="App.verVenta('${v.id}')"><div class="vn">#${v.numero}</div><div style="flex:1;min-width:0"><b>${esc(cli(v.clienteId)?.nombre || 'Cliente de mostrador')}</b> ${tipoTag(v)}<br><small>${fdate(v.fecha)} · ${esc((v.items || []).map(i => (i.cant > 1 ? i.cant + '× ' : '') + i.nombre).join(', '))}</small></div><div style="text-align:right"><b>${fmt(v.total)}</b>${v.saldo > 0.009 ? `<br><small class="down">debe ${fmt(v.saldo)}</small>` : ''}</div></div>`).join('') || '<div class="empty">No hay ventas con ese filtro</div>'}</div></div>`;
};

// ---------- despacho ----------
const DS = window.DS = { tab: 'pend', q: '', sel: {} };
const CP = window.CP = { tab: 'compras', q: '' };
const provN = id => db().proveedores.find(p => p.id === id)?.nombre || '—';
const docL = c => (c.doc_tipo === 'nota' ? 'Nota de entrega' : 'Factura') + (c.doc_numero ? ' ' + c.doc_numero : '');
const puedeComprar = () => ['dueno', 'admin', 'almacen'].includes(rol());
V.compras = () => {
  const q = CP.q.trim().toLowerCase();
  const segm = `<div class="card c12" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div class="cur"><button class="${CP.tab === 'compras' ? 'on' : ''}" onclick="CP.tab='compras';App.go('compras')">🧾 Compras</button><button class="${CP.tab === 'prov' ? 'on' : ''}" onclick="CP.tab='prov';App.go('compras')">🏭 Proveedores</button></div><input class="in" id="cpq" placeholder="🔎 Buscar…" value="${esc(CP.q)}" oninput="CP.q=this.value;App.go('compras');setTimeout(()=>{const i=document.querySelector('#cpq');i.focus();i.setSelectionRange(i.value.length,i.value.length)})" style="flex:1;min-width:180px;max-width:340px"></div>`;
  const btns = puedeComprar() ? `<div class="card c12" style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn pri" onclick="App.compraForm()">+ Nueva compra</button><button class="btn gh" onclick="App.provForm()">+ Proveedor</button></div>` : '';
  if (CP.tab === 'prov') {
    const ps = db().proveedores.filter(p => !q || [p.nombre, p.rif, p.telefono, p.contacto].join(' ').toLowerCase().includes(q));
    return `<div class="grid">${btns}${segm}${ps.map(p => { const cs = db().compras.filter(c => c.proveedorId === p.id), deb = cs.reduce((a, c) => a + c.saldo, 0); return `<div class="card c6"><div style="display:flex;justify-content:space-between;gap:10px"><div><b>${esc(p.nombre)}</b><br><small style="color:var(--mut)">${esc([p.rif, p.telefono, p.contacto].filter(Boolean).join(' · '))}</small></div><div style="text-align:right"><small style="color:var(--mut)">Le debes</small><div class="${deb > 0.009 ? 'down' : ''}"><b>${fmt(deb)}</b></div></div></div><div style="margin-top:8px;color:var(--mut);font-size:13px">${cs.length} compras · ${fmt(cs.reduce((a, c) => a + c.total, 0))} en total</div><div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">${puedeComprar() ? `<button class="pill" onclick="App.provForm('${p.id}')">Editar</button>` : ''}${p.telefono ? `<a class="pill" target="_blank" href="https://wa.me/${waNum(p.telefono)}">💬 WhatsApp</a>` : ''}</div></div>`; }).join('') || '<div class="card c12"><div class="empty">Aún no hay proveedores.</div></div>'}</div>`;
  }
  const mes = today().slice(0, 8) + '01', cm = db().compras.filter(c => c.fecha >= mes);
  const cs = db().compras.filter(c => !q || [provN(c.proveedorId), c.doc_numero, c.numero, ...(c.items || []).map(i => i.nombre)].join(' ').toLowerCase().includes(q)).slice().reverse().slice(0, 80);
  return `<div class="grid">
  <div class="card kpi hero c4"><h3>Compras del mes</h3><div class="v">${fmt(cm.reduce((a, c) => a + c.total, 0))}</div><div class="s">${cm.length} documentos</div></div>
  <div class="card kpi c4"><h3>Unidades cargadas</h3><div class="v">${cm.reduce((a, c) => a + (c.items || []).reduce((s, i) => s + i.cant, 0), 0)}</div><div class="s">este mes</div></div>
  <div class="card kpi c4"><h3>Por pagar</h3><div class="v down">${fmt(db().compras.reduce((a, c) => a + c.saldo, 0))}</div><div class="s">a proveedores</div></div>
  ${btns}${segm}
  <div class="card c12"><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>Fecha</th><th>Proveedor</th><th>Documento</th><th>Condición</th><th>Total</th><th>Saldo</th></tr></thead><tbody>
  ${cs.map(c => `<tr onclick="App.verCompra('${c.id}')" style="cursor:pointer"><td>${c.numero}</td><td>${fdate(c.fecha)}</td><td>${esc(provN(c.proveedorId))}</td><td>${esc(docL(c))}</td><td>${c.condicion === 'credito' ? '<span class="tag t-in">Crédito</span>' : '<span class="tag t-ok">Contado</span>'}</td><td><b>${fmt(c.total)}</b></td><td>${c.saldo > 0.009 ? `<span class="down">${fmt(c.saldo)}</span>` : '—'}</td></tr>`).join('') || '<tr><td colspan="7" class="empty">Aún no hay compras registradas.</td></tr>'}
  </tbody></table></div></div></div>`;
};
const PP = window.PP = { q: '' };
V.porpagar = () => {
  const q = PP.q.trim().toLowerCase(), ab = db().compras.filter(c => c.saldo > 0.009 && (!q || [provN(c.proveedorId), c.doc_numero].join(' ').toLowerCase().includes(q)));
  const tot = ab.reduce((a, c) => a + c.saldo, 0), venc = ab.filter(c => c.vence && c.vence < today()), mes = today().slice(0, 8) + '01';
  const pm = db().pagosProv.filter(x => x.fecha >= mes);
  const grupos = {}; ab.forEach(c => (grupos[c.proveedorId] ||= []).push(c));
  return `<div class="grid">
  <div class="card kpi hero c4"><h3>Total por pagar</h3><div class="v">${fmt(tot)}</div><div class="s">${ab.length} documentos · ${Object.keys(grupos).length} proveedores</div></div>
  <div class="card kpi c4"><h3>Vencido</h3><div class="v ${venc.length ? 'down' : ''}">${fmt(venc.reduce((a, c) => a + c.saldo, 0))}</div><div class="s">${venc.length} documentos vencidos</div></div>
  <div class="card kpi c4"><h3>Pagado este mes</h3><div class="v up">${fmt(pm.reduce((a, x) => a + x.monto, 0))}</div><div class="s">${pm.length} pagos</div></div>
  <div class="card c12"><input class="in" id="ppq" placeholder="🔎 Buscar proveedor o documento…" value="${esc(PP.q)}" oninput="PP.q=this.value;App.go('porpagar');setTimeout(()=>{const i=document.querySelector('#ppq');i.focus();i.setSelectionRange(i.value.length,i.value.length)})"></div>
  ${Object.entries(grupos).sort((a, b) => b[1].reduce((s, c) => s + c.saldo, 0) - a[1].reduce((s, c) => s + c.saldo, 0)).map(([pid, cs]) => `<div class="card c12"><h3 style="display:flex;justify-content:space-between"><span>🏭 ${esc(provN(pid))}</span><span class="down">${fmt(cs.reduce((s, c) => s + c.saldo, 0))}</span></h3>
   ${cs.sort((a, b) => (a.vence || a.fecha).localeCompare(b.vence || b.fecha)).map(c => `<div class="cx"><div><b>${esc(docL(c))}</b> <small>${fdate(c.fecha)}</small>${c.vence ? `<br><small class="${c.vence < today() ? 'down' : ''}">Vence ${fdate(c.vence)}${c.vence < today() ? ' · vencida' : ''}</small>` : ''}<div class="cxb"><span>Total ${fmt(c.total)}</span><span>Pagado ${fmt(c.pagado)}</span></div></div><div style="text-align:right"><div class="cxs">${fmt(c.saldo)}</div>${['dueno', 'admin', 'cajero'].includes(rol()) ? `<button class="btn pri" style="padding:8px 14px;margin-top:6px" onclick="App.pagoProvForm('${c.id}')">Pagar</button><br>` : ''}<button class="pill" style="margin-top:6px" onclick="App.verCompra('${c.id}')">Ver</button></div></div>`).join('')}</div>`).join('') || `<div class="card c12"><div class="empty">${q ? 'Nada coincide' : 'No le debes nada a ningún proveedor 🎉'}</div></div>`}</div>`;
};
V.despacho = () => {
  const cli = id => db().clientes.find(c => c.id === id), q = DS.q.trim().toLowerCase();
  const all = db().ventas.filter(v => (v.items || []).length), pend = all.filter(v => v.items.some(i => !i.despachado)), done = all.filter(v => v.items.every(i => i.despachado));
  const base = DS.tab === 'pend' ? pend.slice().sort((x, y) => x.numero - y.numero) : done.slice().reverse().slice(0, 60);
  const lst = base.filter(v => !q || String(v.numero) === q.replace('#', '') || (c => c && (c.nombre.toLowerCase().includes(q) || (c.cedula || '').toLowerCase().includes(q) || (c.telefono || '').includes(q)))(cli(v.clienteId)) || v.items.some(i => i.nombre.toLowerCase().includes(q)));
  const uds = pend.reduce((s, v) => s + v.items.filter(i => !i.despachado).reduce((t, i) => t + i.cant, 0), 0);
  return `<div class="grid">
  <div class="card kpi hero c4"><h3>Ventas por despachar</h3><div class="v">${pend.length}</div><div class="s">${uds} unidades pendientes</div></div>
  <div class="card kpi c4"><h3>Despachadas hoy</h3><div class="v up">${all.filter(v => v.items.some(i => i.despachado && (i.despachado_en || '').slice(0, 10) === today())).length}</div><div class="s">Ventas con algo despachado hoy</div></div>
  <div class="card kpi c4"><h3>La más antigua</h3><div class="v">${pend.length ? '#' + Math.min(...pend.map(v => v.numero)) : '—'}</div><div class="s">${pend.length ? fdate(pend.reduce((m, v) => v.fecha < m ? v.fecha : m, pend[0].fecha)) : 'Todo despachado 🎉'}</div></div>
  <div class="card c12" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div class="cur"><button class="${DS.tab === 'pend' ? 'on' : ''}" onclick="DS.tab='pend';App.go('despacho')">⏳ Pendientes (${pend.length})</button><button class="${DS.tab === 'done' ? 'on' : ''}" onclick="DS.tab='done';App.go('despacho')">✅ Despachadas</button></div><input class="in" id="dq" placeholder="🔎 Cliente, # nota o producto" value="${esc(DS.q)}" oninput="DS.q=this.value;App.go('despacho');setTimeout(()=>{const i=document.querySelector('#dq');i.focus();i.setSelectionRange(i.value.length,i.value.length)})" style="flex:1;min-width:180px;max-width:340px"></div>
  ${lst.map(v => { const c = cli(v.clienteId), n = v.items.filter(i => i.despachado).length; return `<div class="card c6"><h3><span>#${v.numero} · ${esc(c?.nombre || 'Mostrador')}</span><span class="tag ${n === v.items.length ? 't-ok' : n ? 't-am' : 't-bad'}">${n}/${v.items.length}</span></h3>
   <small style="color:var(--mut)">${fdate(v.fecha)}${c?.telefono ? ' · ' + esc(c.telefono) : ''}${c?.direccion ? '<br>📍 ' + esc(c.direccion) : ''}</small>
   <div style="margin-top:8px">${v.items.map(i => `<label class="dsp ${i.despachado ? 'ok' : ''}"><input type="checkbox" ${i.despachado || DS.sel[i.id] ? 'checked' : ''} ${i.despachado ? 'disabled' : ''} onchange="DS.sel['${i.id}']=this.checked;App.go('despacho')"><span><b>${i.cant} × ${esc(i.nombre)}</b>${i.despachado ? `<small>Despachado ${i.despachado_en ? new Date(i.despachado_en).toLocaleString('es-VE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : ''}${i.despachado_por ? ' · ' + esc(i.despachado_por) : ''}</small>` : ''}</span></label>`).join('')}</div>
   <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap" class="dspb">${(() => { const pi = v.items.filter(i => !i.despachado), ns = pi.filter(i => DS.sel[i.id]).length; return pi.length ? `<button class="btn pri" ${ns ? '' : 'disabled style="opacity:.45"'} onclick="App.despacharSel('${v.id}')">🚚 Despachado${ns ? ' (' + ns + ')' : ''}</button>${pi.length > 1 ? `<button class="btn gh" onclick="App.despacharTodo('${v.id}')">✓ Despachar todo</button>` : ''}` : ''; })()}<button class="btn gh" onclick="App.verVenta('${v.id}')">Ver venta</button></div></div>`; }).join('') || `<div class="card c12"><div class="empty">${DS.tab === 'pend' ? (q ? 'Nada coincide' : 'No hay nada por despachar 🎉') : 'Aún no hay ventas despachadas'}</div></div>`}</div>`;
};

// ---------- reportes ----------
const RP = window.RP = { modo: 'hoy', tab: 'ventas', d: today(), h: today() };
function rango(RP = window.RP) {
  const t = new Date(today() + 'T12:00'), f = d => d.toLocaleDateString('en-CA');
  if (RP.modo === 'hoy') return [today(), today()];
  if (RP.modo === 'semana') { const d = new Date(t); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return [f(d), today()]; }
  if (RP.modo === 'mes') return [today().slice(0, 8) + '01', today()];
  return RP.d <= RP.h ? [RP.d, RP.h] : [RP.h, RP.d];
}
function repData() {
  const [d, h] = rango(), vs = db().ventas.filter(v => v.fecha >= d && v.fecha <= h).sort((a, b) => a.fecha < b.fecha ? -1 : 1);
  const S = (l, f) => l.reduce((a, x) => a + (+f(x) || 0), 0), cont = vs.filter(v => v.tipo === 'contado'), cre = vs.filter(v => v.tipo === 'credito'), abP = db().abonos.filter(x => x.fecha >= d && x.fecha <= h), cas = vs.filter(v => v.tipo === 'cashea');
  const dias = {}; vs.forEach(v => { const x = dias[v.fecha] ||= { n: 0, c: 0, k: 0, t: 0 }; x.n++; x.t += v.total; v.tipo === 'cashea' ? x.k += v.total : v.tipo === 'credito' ? x.r = (x.r || 0) + v.total : x.c += v.total; });
  const met = {}; vs.forEach(v => (v.pagos?.length ? v.pagos : v.inicial > 0 ? [{ metodo: v.metodo || '—', usd: v.inicial }] : []).forEach(p => met[p.metodo] = (met[p.metodo] || 0) + (+p.usd || 0)));
  abP.forEach(x => (x.pagos?.length ? x.pagos : [{ metodo: x.metodo || '—', usd: x.monto }]).forEach(p => met[p.metodo] = (met[p.metodo] || 0) + (+p.usd || 0)));
  const prod = {}; vs.forEach(v => (v.items || []).forEach(i => { const x = prod[i.nombre] ||= { n: 0, t: 0, g: 0 }; x.n += i.cant; x.t += i.precio * i.cant; x.g += (i.precio - (i.costo || 0)) * i.cant; }));
  const costo = S(vs, costoVenta), gas = S(db().gastos.filter(g => g.fecha >= d && g.fecha <= h), g => g.monto);
  return { d, h, vs, cont, cre, abP, tr: S(cre, v => v.total), iniR: S(cre, v => v.inicial), tab: S(abP, x => x.monto), cas, dias, met, prod, total: S(vs, v => v.total), tc: S(cont, v => v.total), tk: S(cas, v => v.total), costo, gas, ini: S(cas, v => v.inicial), fin: S(cas, v => v.financiado), com: S(cas, v => v.comision), neto: S(cas, v => v.netoCashea), liq: S(cas.filter(v => v.liquidado), v => v.netoCashea), pend: S(cas.filter(v => !v.liquidado), v => v.netoCashea) };
}
V.reportes = () => {
  if (!esJefe()) return '<div class="empty">Solo el dueño o un admin ven los reportes.</div>';
  const r = repData(), cli = id => db().clientes.find(c => c.id === id)?.nombre || 'Sin cliente', k = (t, v, s = '') => `<div class="card kpi c3"><h3>${t}</h3><div class="v">${v}</div><div class="s">${s}</div></div>`;
  const per = `<div class="card c12"><div class="chips">${[['hoy', 'Hoy'], ['semana', 'Esta semana'], ['mes', 'Este mes'], ['rango', 'Rango']].map(([m, l]) => `<button class="pill ${RP.modo === m ? 'on' : ''}" onclick="RP.modo='${m}';App.go('reportes')">${l}</button>`).join('')}</div>
  ${RP.modo === 'rango' ? `<div class="row2" style="margin-top:12px"><div class="fld"><label>Desde</label><input class="in" type="date" value="${RP.d}" onchange="RP.d=this.value;App.go('reportes')"></div><div class="fld"><label>Hasta</label><input class="in" type="date" value="${RP.h}" onchange="RP.h=this.value;App.go('reportes')"></div></div>` : ''}
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px;flex-wrap:wrap"><div class="cur"><button class="${RP.tab === 'ventas' ? 'on' : ''}" onclick="RP.tab='ventas';App.go('reportes')">Ventas</button><button class="${RP.tab === 'cashea' ? 'on' : ''}" onclick="RP.tab='cashea';App.go('reportes')">Cashea</button></div><span class="sub" style="margin:0">${fdate(r.d)}${r.d !== r.h ? ' al ' + fdate(r.h) : ''} · ${r.vs.length} ventas</span><span style="display:flex;gap:8px"><button class="btn gh" onclick="App.repPDF()">🖨 PDF</button><button class="btn gh" onclick="App.repExcel()">⬇ Excel</button></span></div></div>`;
  if (RP.tab === 'cashea') return `<div class="grid">${per}
  ${k('Vendido con Cashea', fmt(r.tk), `${r.cas.length} ventas · ${fmt(r.tk, 'VES')}`).replace('c3', 'c4')}${k('Inicial cobrada', fmt(r.ini), 'Entró a tu caja').replace('c3', 'c4')}${k('Financiado', fmt(r.fin), 'Lo que paga Cashea').replace('c3', 'c4')}
  <div class="card kpi hero c6"><h3>Comisiones que te quita Cashea</h3><div class="v down">−${fmt(r.com)}</div><div class="s">${fmt(r.com, 'VES')} · ${r.fin ? (r.com / r.fin * 100).toFixed(1) : db().config.comisionCashea}% de lo financiado</div></div>${k('Neto a recibir', fmt(r.neto), `Recibido ${fmt(r.liq)} · pendiente ${fmt(r.pend)}`).replace('c3', 'c6')}
    <div class="card c12"><h3>Detalle Cashea</h3><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Inicial</th><th>Financiado</th><th>Comisión</th><th>Neto</th><th>Estado</th></tr></thead><tbody>${r.cas.map(v => `<tr><td>${v.numero}</td><td>${fdate(v.fecha)}</td><td>${esc(cli(v.clienteId))}</td><td>${fmt(v.total)}</td><td>${fmt(v.inicial)}</td><td>${fmt(v.financiado)}</td><td>${fmt(v.comision)}</td><td><b>${fmt(v.netoCashea)}</b></td><td>${v.liquidado ? '<span class="tag t-ok">Recibido</span>' : '<span class="tag t-in">Pendiente</span>'}</td></tr>`).join('') || '<tr><td colspan="9" class="empty">Sin ventas Cashea en este período</td></tr>'}</tbody>${r.cas.length ? `<tfoot><tr style="font-weight:700"><td colspan="3">Totales</td><td>${fmt(r.tk)}</td><td>${fmt(r.ini)}</td><td>${fmt(r.fin)}</td><td class="down">${fmt(r.com)}</td><td>${fmt(r.neto)}</td><td></td></tr></tfoot>` : ''}</table></div></div></div>`;
  const tp = Object.entries(r.prod).sort((a, b) => b[1].t - a[1].t).slice(0, 10);
  return `<div class="grid">${per}
  ${k('Total vendido', fmt(r.total), `${r.vs.length} ventas · ${fmt(r.total, 'VES')}`)}${k('Contado', fmt(r.tc), `${r.cont.length} ventas`)}${k('Crédito Cashea', fmt(r.tk), `${r.cas.length} ventas · inicial ${fmt(r.ini)}`)}${k('Crédito propio', fmt(r.tr), `${r.cre.length} ventas · abonos ${fmt(r.tab)}`)}${k('Utilidad bruta', fmt(r.total - r.costo - r.com), `Gastos ${fmt(r.gas)} · neta ${fmt(r.total - r.costo - r.com - r.gas)}`)}
  ${RP.modo !== 'hoy' ? `<div class="card c6"><h3>Por día</h3><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Día</th><th>Ventas</th><th>Contado</th><th>Cashea</th><th>Crédito</th><th>Total</th></tr></thead><tbody>${Object.entries(r.dias).map(([f, x]) => `<tr><td>${fdate(f)}</td><td>${x.n}</td><td>${fmt(x.c)}</td><td>${fmt(x.k)}</td><td>${fmt(x.r || 0)}</td><td><b>${fmt(x.t)}</b></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Sin ventas</td></tr>'}</tbody></table></div></div>` : ''}
  <div class="card c6"><h3>Cobrado por forma de pago</h3><table class="tbl"><tbody>${Object.entries(r.met).sort((a, b) => b[1] - a[1]).map(([m, t]) => `<tr><td>${esc(m)}</td><td style="text-align:right"><b>${fmt(t)}</b></td></tr>`).join('') || '<tr><td class="empty">Sin cobros</td></tr>'}</tbody></table></div>
  <div class="card c6"><h3>Productos más vendidos</h3><table class="tbl"><thead><tr><th>Producto</th><th>Unid.</th><th>Vendido</th><th>Ganancia</th></tr></thead><tbody>${tp.map(([n, x]) => `<tr><td>${esc(n)}</td><td>${x.n}</td><td>${fmt(x.t)}</td><td>${fmt(x.g)}</td></tr>`).join('') || '<tr><td colspan="4" class="empty">Sin ventas</td></tr>'}</tbody></table></div>
  <div class="card c12"><h3>Ventas del período</h3><div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Tipo</th><th>Pago</th><th>Total</th></tr></thead><tbody>${r.vs.slice().reverse().map(v => `<tr><td>${v.numero}</td><td>${fdate(v.fecha)}</td><td>${esc(cli(v.clienteId))}</td><td><span class="tag ${v.tipo === 'cashea' ? 't-vi' : v.tipo === 'credito' ? 't-am' : 't-ok'}">${{ cashea: 'Cashea', credito: 'Crédito' }[v.tipo] || 'Contado'}</span></td><td>${esc(v.metodo || '')}</td><td><b>${fmt(v.total)}</b></td></tr>`).join('') || '<tr><td colspan="6" class="empty">Sin ventas en este período</td></tr>'}</tbody></table></div></div></div>`;
};

// ---------- hojas (formularios) ----------
function sheet(html) { const o = document.createElement('div'); o.className = 'ov'; o.innerHTML = `<div class="sheet">${html}</div>`; o.onclick = e => { if (e.target === o) o.remove(); }; document.body.appendChild(o); return o; }
const closeSheet = () => document.querySelector('.ov')?.remove();

const CATS = extra => [...new Set([...(db().config.categorias || []), ...(extra ? [extra] : [])])];
const EMOJIS = ['🛋️', '🪑', '🛏️', '🚪', '🗄️', '🪞', '🖼️', '🪟', '🛁', '🚿', '🚽', '🧺', '🧻', '💡', '🕯️', '🪔', '🪴', '🏠', '📺', '🖥️', '💻', '⌨️', '🖱️', '📱', '☎️', '📞', '🎧', '🔊', '📻', '🎤', '📷', '📹', '🎮', '🕹️', '⌚', '⏰', '🖨️', '💾', '❄️', '🧊', '🌀', '🌬️', '🔥', '♨️', '🍳', '🥘', '🍲', '☕', '🫖', '🥤', '🍹', '🍞', '🥪', '🍕', '🧁', '🔪', '🍴', '🥄', '🧹', '🧼', '🧽', '🪣', '👕', '👖', '👗', '👟', '🧵', '🪡', '🔌', '🔋', '💡', '🔦', '🛠️', '🔧', '🔨', '🪛', '⚙️', '🧰', '🏍️', '🛵', '🚲', '🛴', '🛞', '🚗', '👶', '🍼', '🧸', '🎈', '⚽', '🏀', '🏋️', '🎸', '🎹', '💄', '💈', '🪒', '🧴', '💍', '👜', '🎒', '🧳', '☂️', '🏷️', '💳', '📦', '🎁', '⭐', '✅'].filter((e, i, s) => s.indexOf(e) === i);
// ---------- ticket como imagen ----------
const TK = () => ({ nombre: 'Muebles La Pascua', rif: '', direccion: 'Valle de la Pascua, Guárico', telefono: '', instagram: '', pie: '¡Gracias por su compra!', logo: true, bs: true, cliente: true, pagos: true, garantia: true, vendedor: true, ...(db().config.ticket || {}) });
let _logo; const logoImg = () => _logo ||= new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = 'logo.png'; });
async function ticketBlob(v, t = TK()) {
  const W = 600, P = 34, c = document.createElement('canvas'); c.width = W; c.height = 2600; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, W, c.height); let y = 30; const F = 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif';
  const txt = (s, o = {}) => { x.font = `${o.b ? 700 : 400} ${o.z || 22}px ${F}`; x.fillStyle = o.c || '#1b2430'; x.textAlign = o.a || 'left'; x.fillText(s, o.a === 'center' ? W / 2 : o.a === 'right' ? W - P : P, y); };
  const lr = (l, r, o = {}) => { txt(l, o); txt(r, { ...o, a: 'right' }); y += (o.z || 22) + 12; };
  const wrap = (s, max, z) => { x.font = `400 ${z}px ${F}`; const out = []; let cur = ''; for (const w of String(s).split(' ')) { const tst = cur ? cur + ' ' + w : w; if (x.measureText(tst).width > max && cur) { out.push(cur); cur = w; } else cur = tst; } out.push(cur); return out; };
  const hr = () => { x.strokeStyle = '#c9ced6'; x.setLineDash([6, 6]); x.beginPath(); x.moveTo(P, y); x.lineTo(W - P, y); x.stroke(); x.setLineDash([]); y += 28; };
  const lg = t.logo && await logoImg(); if (lg) { const w = 300, h = lg.height * w / lg.width; x.drawImage(lg, (W - w) / 2, y, w, h); y += h + 34; } else y += 20;
  txt(t.nombre, { b: 1, z: 30, a: 'center', c: '#0F2A47' }); y += 30;
  [t.rif && 'RIF ' + t.rif, t.direccion, t.telefono && 'Tel. ' + t.telefono, t.instagram].filter(Boolean).forEach(s => { txt(s, { z: 19, a: 'center', c: '#5b6573' }); y += 26; });
  y += 8; hr();
  lr(v.abono ? `Abono a nota #${v.numero ?? ''}` : `Nota de venta #${v.numero ?? ''}`, fdate(v.abono ? today() : (v.fecha || today())), { b: 1 });
  if (t.cliente) { const cl = db().clientes.find(c => c.id === v.clienteId); if (cl) { txt('Cliente: ' + cl.nombre, { z: 20 }); y += 28; if (cl.cedula) { txt('C.I./RIF: ' + cl.cedula, { z: 20, c: '#5b6573' }); y += 28; } } }
  if (t.vendedor && v.vendedor) { txt('Atendido por: ' + v.vendedor, { z: 20, c: '#5b6573' }); y += 28; }
  hr();
  for (const i of v.items || []) {
    const ls = wrap(`${i.cant} x ${i.nombre}`, W - P * 2 - 150, 22); ls.forEach((l, k) => { txt(l); if (!k) txt('$' + (i.precio * i.cant).toFixed(2), { a: 'right' }); y += 30; });
    if (t.garantia) { const p = db().productos.find(p => p.id === (i.producto_id || i.productoId)); if (p?.garantiaMeses) { txt(`Garantía ${p.garantiaMeses} meses`, { z: 17, c: '#7b8594' }); y += 26; } }
  }
  hr();
  lr('TOTAL', '$' + (+v.total).toFixed(2), { b: 1, z: 32, c: '#0F2A47' });
  if (t.bs) lr('En bolívares', 'Bs ' + (v.total * db().tasa.valor).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), { z: 20, c: '#5b6573' });
  if (t.bs) { txt(`Tasa BCV ${db().tasa.valor} Bs/$`, { z: 16, c: '#7b8594' }); y += 26; }
  if (v.tipo === 'credito' && !v.abono) { y += 6; lr('Inicial pagada', '$' + (+v.inicial).toFixed(2), { z: 21 }); lr('Saldo a crédito', '$' + (+(v.saldo ?? v.financiado)).toFixed(2), { z: 21, b: 1 }); }
  if (v.abono) { y += 6; lr('Abono recibido', '$' + (+v.abono).toFixed(2), { z: 22, b: 1 }); lr('Saldo pendiente', '$' + (+v.saldo).toFixed(2), { z: 21, c: '#5b6573' }); }
  if (v.tipo === 'cashea') { y += 6; lr('Inicial pagada', '$' + (+v.inicial).toFixed(2), { z: 21 }); lr('Financiado con Cashea', '$' + (v.total - v.inicial).toFixed(2), { z: 21, c: '#5b6573' }); }
  if (t.pagos && v.pagos?.length) { y += 6; txt('Forma de pago', { z: 18, b: 1, c: '#5b6573' }); y += 28; v.pagos.forEach(p => lr(p.metodo, `${p.moneda === 'Bs' ? 'Bs ' : '$'}${(+p.monto).toFixed(2)}`, { z: 19, c: '#5b6573' })); }
  y += 6; hr(); txt(t.pie, { b: 1, z: 22, a: 'center', c: '#F29F05' }); y += 40;
  const o = document.createElement('canvas'); o.width = W; o.height = y; const ox = o.getContext('2d'); ox.drawImage(c, 0, 0);
  ox.fillStyle = '#F29F05'; ox.fillRect(0, 0, W, 8);
  return new Promise(r => o.toBlob(r, 'image/png'));
}
async function shareTicket(blob, num) {
  const f = new File([blob], `ticket-${num}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: 'Ticket de compra' }); } catch (e) { } return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = f.name; a.click(); toast('Ticket descargado: adjúntalo en WhatsApp');
}

const App = window.App = {
  page: 'tablero',
  go(p, keep) { this.page = p; if (!keep) { window._q = ''; window._qc = ''; } location.hash = p; render(); },
  setCur(c) { CUR = c; localStorage.setItem('mlp_cur', c); render(); },
  addCart(id) { const p = db().productos.find(p => p.id === id); if (p?.varios) return this.variosForm(p); if (!p || p.stock <= 0) return toast('Sin existencia'); const it = cart.find(i => i.productoId === id); if (it) { if (it.cant < p.stock) it.cant++; } else cart.push({ k: id, productoId: id, nombre: p.nombre, precio: +p.precio, p1: +p.precio, p2: +p.precio2 || 0, nivel: 1, cant: 1 }); render(); },
  nivel(id, n) { const it = cart.find(i => i.k === id); it.nivel = n; it.precio = n === 2 ? it.p2 : it.p1; render(); },
  async catAdd() { const n = $('#catIn').value.trim(); if (!n) return; if (CATS().some(c => c.toLowerCase() === n.toLowerCase())) return toast('Ya existe'); try { await store.setCategorias([...CATS(), n]); render(); toast('Categoría agregada'); } catch (e) { toast('Error: ' + e.message); } },
  async catDel(k) { const l = CATS(), c = l[k], n = db().productos.filter(p => p.categoria === c).length; if (!confirm(n ? `${n} productos usan "${c}". Seguirán con ella, pero no aparecerá para nuevos. ¿Quitar?` : `¿Quitar "${c}"?`)) return; try { await store.setCategorias(l.filter((_, i) => i !== k)); render(); } catch (e) { toast('Error: ' + e.message); } },
  abonoForm(id) {
    const v = db().ventas.find(x => x.id === id), c = db().clientes.find(x => x.id === v.clienteId), T = db().tasa.valor, METS = ['Pago móvil', 'Efectivo $', 'Efectivo Bs', 'Punto de venta', 'Zelle', 'Binance', 'Transferencia'];
    const o = sheet(`<h2>Registrar abono</h2><div class="sub">${esc(c?.nombre || '')} · nota #${v.numero}</div>
    <div class="sum" style="margin-top:0"><div><span>Saldo actual</span><b>${fmt(v.saldo, 'USD')}</b></div><div><span style="color:var(--mut)">En bolívares</span><span>${fmt(v.saldo, 'VES')}</span></div></div>
    <div class="fld"><label>Método</label><select class="in" id="aM">${METS.map(m => `<option>${m}</option>`).join('')}</select></div>
    <div class="row2"><div class="fld"><label>Monto</label><input class="in" id="aV" type="number" step="0.01" inputmode="decimal" placeholder="0.00"></div><div class="fld"><label>Moneda</label><select class="in" id="aC"><option>$</option><option selected>Bs</option></select></div></div>
    <div id="aMsg" style="margin:-4px 0 12px;font-size:13px"></div><button class="pill" id="aTodo" style="margin-bottom:12px">Pagar todo el saldo</button>
    <div class="fld"><label>Nota (opcional)</label><input class="in" id="aN" placeholder="Ej. referencia del pago móvil"></div>
    <button class="btn pri block" id="aOk">Guardar abono</button>`);
    const usd = () => { const m = +o.querySelector('#aV').value || 0; return o.querySelector('#aC').value === 'Bs' ? m / T : m; };
    const msg = () => { const u = usd(), r = v.saldo - u; o.querySelector('#aMsg').innerHTML = !u ? '' : r < -0.01 ? `<span class="down">Pasa del saldo por ${fmt(-r, 'USD')}</span>` : `<span class="up">${fmt(u, 'USD')} · queda ${fmt(Math.max(0, r), 'USD')}${r <= 0.01 ? ' · ¡saldada!' : ''}</span>`; };
    o.querySelector('#aM').onchange = e => { o.querySelector('#aC').value = /\$|Zelle|Binance/.test(e.target.value) ? '$' : 'Bs'; msg(); };
    o.querySelector('#aV').oninput = msg; o.querySelector('#aC').onchange = msg;
    o.querySelector('#aTodo').onclick = () => { const bs = o.querySelector('#aC').value === 'Bs'; o.querySelector('#aV').value = (bs ? v.saldo * T : v.saldo).toFixed(2); msg(); };
    o.querySelector('#aOk').onclick = async e => {
      const u = +usd().toFixed(2); if (!(u > 0)) return toast('Escribe el monto'); if (u > v.saldo + 0.01) return toast('El abono pasa del saldo');
      e.target.disabled = true; e.target.textContent = 'Guardando…';
      try {
        const m = o.querySelector('#aM').value, mon = o.querySelector('#aC').value, monto = +(+o.querySelector('#aV').value).toFixed(2);
        await store.addAbono({ ventaId: v.id, clienteId: v.clienteId, monto: Math.min(u, v.saldo), metodo: m, pagos: [{ metodo: m, moneda: mon, monto, usd: Math.min(u, v.saldo) }], nota: o.querySelector('#aN').value.trim() });
        closeSheet(); render(); this.reciboAbono(v.id, Math.min(u, v.saldo), [{ metodo: m, moneda: mon, monto }]);
      } catch (err) { toast('Error: ' + err.message); e.target.disabled = false; e.target.textContent = 'Guardar abono'; }
    };
  },
  reciboAbono(id, monto, pagos) {
    const v = db().ventas.find(x => x.id === id), c = db().clientes.find(x => x.id === v.clienteId), tel = c?.telefono ? '58' + c.telefono.replace(/\D/g, '').replace(/^0/, '') : '';
    const txt = `*${TK().nombre}*\nAbono a la nota #${v.numero}\nAbono recibido: $${monto.toFixed(2)} (Bs ${(monto * db().tasa.valor).toFixed(2)})\nSaldo pendiente: $${v.saldo.toFixed(2)}${v.saldo <= 0.009 ? '\n¡Cuenta saldada! Gracias.' : '\n¡Gracias!'}`;
    sheet(`<div style="text-align:center;padding-top:20px"><div style="font-size:64px">✅</div><h2>Abono registrado</h2><div class="sub">${v.saldo <= 0.009 ? '¡Cuenta saldada!' : 'Saldo pendiente ' + fmt(v.saldo, 'USD')}</div></div>
    <img id="tkImg" class="tkprev" alt="Comprobante"><button class="btn pri block" id="tkSh" disabled>Preparando comprobante…</button>
    <a class="btn gh block" style="margin-top:10px" target="_blank" href="https://wa.me/${tel}?text=${encodeURIComponent(txt)}">Enviar como texto por WhatsApp</a>
    <button class="btn gh block" style="margin-top:10px" onclick="document.querySelector('.ov').remove()">Listo</button>`);
    ticketBlob({ ...v, abono: monto, pagos }).then(b => { const im = document.querySelector('#tkImg'), bt = document.querySelector('#tkSh'); if (!im) return; im.src = URL.createObjectURL(b); bt.disabled = false; bt.textContent = '🧾 Enviar comprobante (imagen)'; bt.onclick = () => shareTicket(b, 'abono-' + v.numero); });
  },
  historial(id) {
    const v = db().ventas.find(x => x.id === id), ab = db().abonos.filter(x => x.ventaId === id);
    sheet(`<h2>Historial nota #${v.numero}</h2><div class="sub">Total ${fmt(v.total)} · inicial ${fmt(v.inicial)} · saldo ${fmt(v.saldo)}</div>
    <table class="tbl"><tbody>${ab.map(x => `<tr><td>${fdate(x.fecha)}</td><td>${esc(x.metodo || '')}<br><small style="color:var(--mut)">${esc(x.usuario || '')}${x.nota ? ' · ' + esc(x.nota) : ''}</small></td><td style="text-align:right"><b class="up">${fmt(x.monto)}</b>${esJefe() ? `<br><button class="pill del" style="margin-top:4px" onclick="App.delAbono('${x.id}')">Borrar</button>` : ''}</td></tr>`).join('') || '<tr><td class="empty">Sin abonos todavía</td></tr>'}</tbody></table>
    <button class="btn gh block" style="margin-top:12px" onclick="document.querySelector('.ov').remove()">Cerrar</button>`);
  },
  async delAbono(id) { if (!confirm('¿Borrar este abono? El saldo vuelve a subir.')) return; try { await store.delAbono(id); closeSheet(); render(); toast('Abono borrado'); } catch (e) { toast('Error: ' + e.message); } },
  verVenta(id) {
    const v = db().ventas.find(x => x.id === id), c = db().clientes.find(x => x.id === v.clienteId), T = db().tasa.valor, tk = TK();
    const txtCli = `*${tk.nombre}*\nNota de venta #${v.numero} · ${fdate(v.fecha)}\n${(v.items || []).map(i => `${i.cant} x ${i.nombre}: $${(+i.precio).toFixed(2)}`).join('\n')}\nTotal: $${v.total.toFixed(2)} (Bs ${(v.total * T).toFixed(2)})${v.tipo === 'cashea' ? `\nInicial pagada: $${v.inicial.toFixed(2)}\nResto en cuotas con Cashea` : v.tipo === 'credito' ? `\nInicial: $${v.inicial.toFixed(2)}\nAbonado: $${(v.abonado || 0).toFixed(2)}\nSaldo: $${v.saldo.toFixed(2)}` : ''}\n${tk.pie || ''}`;
    const txtAlm = `📦 *DESPACHO · Nota #${v.numero}*\nFecha: ${fdate(v.fecha)}\n\n${(v.items || []).map(i => `• ${i.cant} x ${i.nombre}`).join('\n')}\n\n*Cliente:* ${c?.nombre || 'Mostrador'}${c?.cedula ? '\nCédula: ' + c.cedula : ''}${c?.telefono ? '\nTeléfono: ' + c.telefono : ''}${c?.direccion ? '\nDirección: ' + c.direccion : ''}\n*Venta:* ${{ cashea: 'Cashea', credito: 'Crédito' }[v.tipo] || 'Contado'}${v.vendedor ? '\nVendedor: ' + v.vendedor : ''}`;
    const o = sheet(`<h2>Venta #${v.numero} ${tipoTag(v)}</h2><div class="sub">${fdate(v.fecha)}${v.vendedor ? ' · ' + esc(v.vendedor) : ''}</div>
    <div class="sum" style="margin-top:0"><div><span>Cliente</span><b>${esc(c?.nombre || 'Mostrador')}</b></div>${c?.telefono ? `<div><span>Teléfono</span><span>${esc(c.telefono)}</span></div>` : ''}${c?.direccion ? `<div><span>Dirección</span><span style="text-align:right">${esc(c.direccion)}</span></div>` : ''}</div>
    <div class="sum">${(v.items || []).map(i => `<div><span>${i.despachado ? '✅' : '⏳'} ${i.cant} × ${esc(i.nombre)}</span><span>${fmt(i.precio * i.cant)}</span></div>`).join('')}
     <div class="tot"><span>Total</span><span>${fmt(v.total, 'USD')}</span></div><div><span style="color:var(--mut)">En bolívares (tasa ${v.tasa || T})</span><span>Bs ${(v.total * (+v.tasa || T)).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
     ${v.tipo !== 'contado' ? `<div><span>Inicial</span><span>${fmt(v.inicial)}</span></div>` : ''}${v.tipo === 'cashea' ? `<div><span>Financia Cashea</span><span>${fmt(v.financiado)}</span></div><div><span>Liquidación</span><span>${v.liquidado ? 'Recibida' : 'Pendiente'}</span></div>` : ''}${v.tipo === 'credito' ? `<div><span>Abonado</span><span class="up">${fmt(v.abonado)}</span></div><div><span>Saldo</span><b class="${v.saldo > 0.009 ? 'down' : 'up'}">${fmt(v.saldo)}</b></div>` : ''}
     ${(v.pagos || []).map(p => `<div><span style="color:var(--mut)">${esc(p.metodo)}</span><span>${p.moneda === 'Bs' ? 'Bs ' + (+p.monto).toFixed(2) : '$' + (+p.monto).toFixed(2)}</span></div>`).join('')}</div>
    <img id="tkImg" class="tkprev" alt="Ticket">
    <button class="btn pri block" id="tkSh" disabled>Preparando ticket…</button>
    <div class="row2" style="margin-top:10px"><a class="btn gh" target="_blank" href="https://wa.me/${waNum(c?.telefono)}?text=${encodeURIComponent(txtCli)}">💬 WhatsApp cliente</a><a class="btn gh" target="_blank" href="https://wa.me/${waNum(tk.almacen)}?text=${encodeURIComponent(txtAlm)}">📦 Enviar a almacén</a></div>
    ${v.tipo === 'credito' && v.saldo > 0.009 ? `<div class="row2" style="margin-top:10px"><button class="btn gh" onclick="document.querySelector('.ov').remove();App.abonoForm('${v.id}')">Abonar</button><button class="btn gh" onclick="document.querySelector('.ov').remove();App.historial('${v.id}')">Historial de abonos</button></div>` : ''}
    ${esJefe() ? `<button class="btn gh block del" style="margin-top:10px" onclick="App.anular('${v.id}')">Anular venta</button>` : ''}
    <button class="btn gh block" style="margin-top:10px" onclick="document.querySelector('.ov').remove()">Cerrar</button>`);
    ticketBlob(v).then(b => { const im = o.querySelector('#tkImg'), bt = o.querySelector('#tkSh'); if (!im) return; im.src = URL.createObjectURL(b); bt.disabled = false; bt.textContent = '🧾 Enviar ticket (imagen)'; bt.onclick = () => shareTicket(b, v.numero); });
  },
  async anular(id) {
    const v = db().ventas.find(x => x.id === id), m = prompt(`¿Anular la venta #${v.numero}? Los productos vuelven al inventario${v.tipo === 'credito' ? ' y se borran sus abonos' : ''}.\nEscribe el motivo:`);
    if (m === null) return; if (!m.trim()) return toast('Escribe el motivo');
    try { await store.anular(id, m.trim()); closeSheet(); render(); toast(`Venta #${v.numero} anulada`); } catch (e) { toast('Error: ' + e.message); }
  },
  async despachar(vid, iid, okk) {
    const v = db().ventas.find(x => x.id === vid), it = v.items.find(i => i.id === iid);
    Object.assign(it, { despachado: okk, despachado_en: okk ? new Date().toISOString() : null, despachado_por: okk ? db().usuario.nombre : null });
    render(); if (okk && v.items.every(i => i.despachado)) toast(`Venta #${v.numero} despachada completa ✅`);
    try { await store.despachar(iid, okk); } catch (e) { toast('Error: ' + e.message); await store.load(); render(); }
  },
  async despacharSel(vid) {
    const v = db().ventas.find(x => x.id === vid), sel = v.items.filter(i => !i.despachado && DS.sel[i.id]);
    if (!sel.length) return toast('Marca los productos que salieron');
    sel.forEach(it => { delete DS.sel[it.id]; Object.assign(it, { despachado: true, despachado_en: new Date().toISOString(), despachado_por: db().usuario.nombre }); });
    render(); toast(v.items.every(i => i.despachado) ? `Venta #${v.numero} despachada completa ✅` : `${sel.length} producto(s) despachado(s)`);
    try { await Promise.all(sel.map(i => store.despachar(i.id, true))); } catch (e) { toast('Error: ' + e.message); await store.load(); render(); }
  },
  async despacharTodo(vid) {
    const v = db().ventas.find(x => x.id === vid), pend = v.items.filter(i => !i.despachado);
    pend.forEach(it => Object.assign(it, { despachado: true, despachado_en: new Date().toISOString(), despachado_por: db().usuario.nombre })); render(); toast(`Venta #${v.numero} despachada ✅`);
    try { await Promise.all(pend.map(i => store.despachar(i.id, true))); } catch (e) { toast('Error: ' + e.message); await store.load(); render(); }
  },
  variosForm(p) {
    const T = db().tasa.valor, o = sheet(`<h2>${p.icono} Producto Varios</h2><div class="sub">Precio libre, no maneja existencia</div>
    <div class="fld"><label>Descripción</label><input class="in" id="xD" value="Producto Varios"></div>
    <div class="row3"><div class="fld"><label>Precio</label><input class="in" id="xP" type="number" step="0.01" inputmode="decimal" placeholder="0.00"></div><div class="fld"><label>Moneda</label><select class="in" id="xM"><option>$</option><option>Bs</option></select></div><div class="fld"><label>Cantidad</label><input class="in" id="xC" type="number" inputmode="numeric" value="1"></div></div>
    <div id="xMsg" style="margin:-4px 0 12px;font-size:13px;color:var(--mut)"></div><button class="btn pri block" id="xOk">Agregar a la venta</button>`);
    const usd = () => { const m = +o.querySelector('#xP').value || 0; return o.querySelector('#xM').value === 'Bs' ? m / T : m; };
    const msg = () => { const u = usd(); o.querySelector('#xMsg').textContent = u ? `${fmt(u, 'USD')} · ${fmt(u, 'VES')} c/u` : ''; };
    o.querySelector('#xP').oninput = msg; o.querySelector('#xM').onchange = msg; setTimeout(() => o.querySelector('#xP').focus(), 50);
    o.querySelector('#xOk').onclick = () => { const u = +usd().toFixed(2), c = Math.max(1, +o.querySelector('#xC').value || 1), d = o.querySelector('#xD').value.trim() || 'Producto Varios'; if (!(u > 0)) return toast('Escribe el precio'); cart.push({ k: 'v' + Date.now(), productoId: p.id, nombre: d, precio: u, p1: u, p2: 0, nivel: 1, cant: c, varios: true }); closeSheet(); render(); };
  },
  quitar(id) { cart = cart.filter(i => i.k !== id); render(); toast('Artículo quitado'); },
  vaciar() { if (!confirm('¿Vaciar toda la venta actual?')) return; cart = []; render(); },
  qty(id, d) { const it = cart.find(i => i.k === id); it.cant += d; if (it.cant <= 0) cart = cart.filter(i => i !== it); render(); },
  checkout() {
    const tot = cart.reduce((a, i) => a + i.precio * i.cant, 0);
    const st = { tipo: 'contado', pct: 60 }; const METS = ['Pago móvil', 'Efectivo $', 'Efectivo Bs', 'Punto de venta', 'Zelle', 'Binance', 'Transferencia']; let pagos = [{ metodo: 'Pago móvil', moneda: 'Bs', monto: '' }]; let cobrar = 0;
    const o = sheet(`<h2>Cobrar</h2><div class="sub">${cart.length} productos · ${fmt(tot, 'USD')}</div>
    <div class="fld"><label>Cliente</label><input class="in" id="cBus" placeholder="🔎 Buscar por nombre, cédula o teléfono…" autocomplete="off"><input type="hidden" id="cCli"><div id="cRes" style="margin-top:8px"></div></div>
    <div class="fld"><label>Forma de venta</label><div class="seg" id="sTipo"><button data-v="contado" class="on">💵 Contado</button><button data-v="cashea">💳 Cashea</button><button data-v="credito">🤝 Crédito</button></div></div>
    <div class="fld" id="fCred" style="display:none"><label>Inicial que paga hoy (opcional)</label><div class="row2"><input class="in" id="iniCred" type="number" step="0.01" inputmode="decimal" placeholder="0.00"><select class="in" id="iniMon"><option>$</option><option>Bs</option></select></div></div>
    <div class="fld" id="fPct" style="display:none"><label>Inicial según el nivel del cliente en Cashea</label><div class="seg" id="sPct">${[60, 50, 40].map(p => `<button data-v="${p}" class="${p === 60 ? 'on' : ''}">${p}%</button>`).join('')}<input class="in" id="pctOtro" type="number" placeholder="Otro %" style="flex:1;min-width:90px"></div></div>
    <div class="fld"><label id="lMet">Método de pago</label><div id="pagos"></div><button class="pill" id="addPago" style="margin-top:8px">+ Otro método</button><div id="pagoMsg" style="margin-top:8px;font-size:13px"></div></div>
    <div class="sum" id="resumen"></div><button class="btn pri block" id="bOk">Confirmar venta</button>`);
    const calc = () => {
      const cr = st.tipo === 'credito', iv = +o.querySelector('#iniCred').value || 0, iniC = Math.min(tot, o.querySelector('#iniMon').value === 'Bs' ? iv / db().tasa.valor : iv);
      const pct = st.tipo === 'cashea' ? st.pct : 100, ini = cr ? iniC : tot * pct / 100, fin = tot - ini, com = st.tipo === 'cashea' ? fin * db().config.comisionCashea / 100 : 0;
      cobrar = ini; drawPagos(); o.querySelector('#fPct').style.display = st.tipo === 'cashea' ? '' : 'none'; o.querySelector('#fCred').style.display = cr ? '' : 'none';
      o.querySelector('#lMet').parentElement.style.display = cr && ini <= 0 ? 'none' : '';
      o.querySelector('#lMet').textContent = st.tipo !== 'contado' ? 'Método con que paga la inicial' : 'Método de pago';
      o.querySelector('#resumen').innerHTML = `<div><span>Total</span><b>${fmt(tot, 'USD')}</b></div>` + (st.tipo === 'cashea' ? `<div><span>Inicial ${pct}% (cobras hoy)</span><b>${fmt(ini, 'USD')}</b></div><div><span>Financia Cashea</span><span>${fmt(fin, 'USD')}</span></div><div><span>Comisión ${db().config.comisionCashea}%</span><span class="down">−${fmt(com, 'USD')}</span></div><div><span>Cashea te deposita</span><span class="up">${fmt(fin - com, 'USD')}</span></div>` : cr ? `<div><span>Inicial (cobras hoy)</span><b>${fmt(ini, 'USD')}</b></div><div><span>Queda en cuentas por cobrar</span><span class="down">${fmt(fin, 'USD')} · ${fmt(fin, 'VES')}</span></div>` : '') + `<div class="tot"><span>Cobrar ahora</span><span>${fmt(ini, 'USD')}</span></div><div><span style="color:var(--mut)">En bolívares</span><b>${fmt(ini, 'VES')}</b></div>`;
    };
    const T = () => db().tasa.valor;
    const usdDe = x => x.moneda === 'Bs' ? (+x.monto || 0) / T() : (+x.monto || 0);
    const pagoMsg = () => { const pag = pagos.reduce((a, x) => a + usdDe(x), 0), f = cobrar - pag, m = o.querySelector('#pagoMsg');
      m.innerHTML = pagos.length === 1 && !pagos[0].monto ? `<span style="color:var(--mut)">Se cobra todo con ${pagos[0].metodo}</span>` : Math.abs(f) < 0.01 ? '<span class="up">✓ Pago completo</span>' : f > 0 ? `<span class="down">Faltan ${fmt(f, 'USD')} · ${fmt(f, 'VES')}</span>` : `<span class="down">Sobran ${fmt(-f, 'USD')} (vuelto)</span>`; };
    const autoFill = () => { const a = pagos.find(x => x.auto); if (!a) return; const resto = Math.max(0, cobrar - pagos.filter(x => x !== a).reduce((s, x) => s + usdDe(x), 0)); a.monto = (a.moneda === 'Bs' ? resto * T() : resto).toFixed(2); const el = o.querySelector(`#pagos input[data-i="${pagos.indexOf(a)}"]`); if (el) el.value = a.monto; };
    const drawPagos = () => {
      if (pagos.length > 1) autoFill();
      const box = o.querySelector('#pagos');
      box.innerHTML = pagos.map((x, i) => `<div style="display:flex;gap:6px;margin-bottom:6px"><select class="in" data-i="${i}" data-k="metodo" style="flex:1.4">${METS.map(m => `<option ${m === x.metodo ? 'selected' : ''}>${m}</option>`).join('')}</select><select class="in" data-i="${i}" data-k="moneda" style="width:70px"><option ${x.moneda === '$' ? 'selected' : ''}>$</option><option ${x.moneda === 'Bs' ? 'selected' : ''}>Bs</option></select><input class="in" data-i="${i}" data-k="monto" type="number" step="0.01" inputmode="decimal" placeholder="${pagos.length === 1 ? 'Todo' : 'Monto'}" value="${x.monto}" style="flex:1">${pagos.length > 1 ? `<button class="pill" data-del="${i}">✕</button>` : ''}</div>`).join('');
      box.querySelectorAll('[data-k]').forEach(el => el.oninput = el.onchange = () => { const x = pagos[el.dataset.i]; x[el.dataset.k] = el.value; if (el.dataset.k === 'monto') { x.auto = false; if (!pagos.some(y => y.auto)) { const last = pagos.at(-1); if (last !== x) last.auto = true; } autoFill(); } if (el.dataset.k === 'metodo') { x.moneda = /\$|Zelle|Binance/.test(el.value) ? '$' : 'Bs'; drawPagos(); } else if (el.dataset.k === 'moneda') drawPagos(); else pagoMsg(); });
      box.querySelectorAll('[data-del]').forEach(el => el.onclick = () => { pagos.splice(+el.dataset.del, 1); if (pagos.length > 1 && !pagos.some(y => y.auto)) pagos.at(-1).auto = true; if (pagos.length === 1) pagos[0].auto = false; drawPagos(); });
      pagoMsg();
    };
    o.querySelector('#addPago').onclick = () => {
      pagos.forEach(x => x.auto = false);
      const usados = pagos.map(x => x.metodo), m = METS.find(x => !usados.includes(x)) || 'Efectivo $';
      pagos.push({ metodo: m, moneda: /\$|Zelle|Binance/.test(m) ? '$' : 'Bs', monto: '', auto: true }); drawPagos();
      o.querySelector(`#pagos input[data-i="0"]`)?.focus();
    };
    const seg = (id, key, num) => o.querySelectorAll(`#${id} button`).forEach(b => b.onclick = () => { o.querySelectorAll(`#${id} button`).forEach(x => x.classList.remove('on')); b.classList.add('on'); st[key] = num ? +b.dataset.v : b.dataset.v; calc(); });
    seg('sTipo', 'tipo'); seg('sPct', 'pct', true);
    o.querySelector('#iniCred').oninput = calc; o.querySelector('#iniMon').onchange = calc;
    o.querySelector('#pctOtro').oninput = e => { const v = +e.target.value; if (v > 0 && v < 100) { st.pct = v; o.querySelectorAll('#sPct button').forEach(x => x.classList.remove('on')); calc(); } };
    const cliUI = () => {
      const q = o.querySelector('#cBus').value.trim().toLowerCase(), sel = o.querySelector('#cCli').value, res = o.querySelector('#cRes');
      if (sel) { const c = db().clientes.find(c => c.id === sel); res.innerHTML = `<div class="tag t-ok" style="display:inline-flex;gap:8px;padding:8px 12px">✓ ${esc(c.nombre)} ${c.cedula ? '· ' + esc(c.cedula) : ''} <a href="#" id="cQuit" style="color:inherit">✕</a></div>`; res.querySelector('#cQuit').onclick = e => { e.preventDefault(); o.querySelector('#cCli').value = ''; cliUI(); }; return; }
      if (!q) { res.innerHTML = '<small style="color:var(--mut)">Sin cliente = cliente de mostrador</small>'; return; }
      const dig = q.replace(/\D/g, '');
      const m = db().clientes.filter(c => c.nombre.toLowerCase().includes(q) || (dig && ((c.cedula || '').replace(/\D/g, '').includes(dig) || (c.telefono || '').replace(/\D/g, '').includes(dig)))).slice(0, 6);
      res.innerHTML = m.map(c => `<div class="it" data-id="${c.id}" style="padding:10px 12px;border:1px solid var(--line);border-radius:12px;margin-bottom:6px;cursor:pointer"><b>${esc(c.nombre)}</b> <small style="color:var(--mut)">${esc(c.cedula || '')} ${esc(c.telefono || '')}</small></div>`).join('') + `<button class="pill" id="cNew" style="margin-top:4px">+ Crear cliente "${esc(o.querySelector('#cBus').value.trim())}"</button>`;
      res.querySelectorAll('.it').forEach(d => d.onclick = () => { o.querySelector('#cCli').value = d.dataset.id; o.querySelector('#cBus').value = ''; cliUI(); });
      res.querySelector('#cNew').onclick = () => {
        const n = o.querySelector('#cBus').value.trim(), esNum = /^[\dVvEe-]+$/.test(n);
        res.innerHTML = `<div class="sum" style="margin-top:0"><div class="fld"><label>Nombre</label><input class="in" id="nN" value="${esNum ? '' : esc(n)}"></div><div class="row2"><div class="fld"><label>Cédula</label><input class="in" id="nC" placeholder="V-" value="${esNum ? esc(n) : ''}"></div><div class="fld"><label>Teléfono</label><input class="in" id="nT" placeholder="0414-"></div></div><div class="fld"><label>Dirección</label><input class="in" id="nD" placeholder="Sector, calle, referencia"></div><button class="btn pri block" id="nOk">Guardar y elegir</button></div>`;
        res.querySelector('#nOk').onclick = async e => { const g = s => res.querySelector(s).value.trim(); if (!g('#nN')) return toast('Falta el nombre'); e.target.disabled = true; try { const c = await store.addCliente({ nombre: g('#nN'), cedula: g('#nC'), telefono: g('#nT'), direccion: g('#nD') }); o.querySelector('#cCli').value = c.id; o.querySelector('#cBus').value = ''; toast('Cliente creado'); cliUI(); } catch (err) { toast(err.message); e.target.disabled = false; } };
      };
    };
    o.querySelector('#cBus').oninput = cliUI; cliUI();
    calc();
    o.querySelector('#bOk').onclick = async e => {
      e.target.disabled = true; e.target.textContent = 'Guardando…';
      try {
        if (st.tipo === 'credito' && !o.querySelector('#cCli').value) throw new Error('la venta a crédito necesita un cliente');
        let ps = cobrar > 0 ? pagos.filter(x => +x.monto > 0) : [];
        if (cobrar > 0 && pagos.length === 1 && !(+pagos[0].monto > 0)) ps = [{ metodo: pagos[0].metodo, moneda: '$', monto: cobrar }];
        const pag = ps.reduce((a, x) => a + usdDe(x), 0);
        if (pag + 0.01 < cobrar) throw new Error(`faltan ${fmt(cobrar - pag, 'USD')} por cobrar`);
        const lista = ps.map(x => ({ metodo: x.metodo, moneda: x.moneda, monto: +(+x.monto).toFixed(2), usd: +usdDe(x).toFixed(2) }));
        const v = await store.addVenta({ clienteId: o.querySelector('#cCli').value || null, items: cart, total: tot, tipo: st.tipo, inicialPct: st.tipo === 'cashea' ? st.pct : 100, inicial: st.tipo === 'credito' ? +cobrar.toFixed(2) : null, metodo: [...new Set(lista.map(x => x.metodo))].join(' + ') || 'Crédito', pagos: lista });
        cart = []; closeSheet(); this.recibo(v); render();
      } catch (err) { toast('Error: ' + err.message); e.target.disabled = false; e.target.textContent = 'Confirmar venta'; }
    };
  },
  recibo(v) {
    const cli = db().clientes.find(c => c.id === v.clienteId);
    const txt = `*Muebles La Pascua*\nNota de venta #${v.numero}\n${(v.items || []).map(i => `${i.cant} x ${i.nombre}: $${(+i.precio).toFixed(2)}`).join('\n')}\nTotal: $${(+v.total).toFixed(2)} (Bs ${(v.total * db().tasa.valor).toFixed(2)})${v.tipo === 'cashea' ? `\nInicial pagada: $${(+v.inicial).toFixed(2)}\nResto en cuotas con Cashea` : v.tipo === 'credito' ? `\nInicial: $${(+v.inicial).toFixed(2)}\nSaldo a crédito: $${(+v.saldo).toFixed(2)}` : ''}\n¡Gracias por su compra!`;
    const tel = cli?.telefono ? '58' + cli.telefono.replace(/\D/g, '').replace(/^0/, '') : '';
    sheet(`<div style="text-align:center;padding-top:20px"><div style="font-size:64px;animation:rise .5s">✅</div><h2>Venta #${v.numero} registrada</h2><div class="sub">${v.tipo === 'cashea' ? 'Cashea · inicial cobrada' : v.tipo === 'credito' ? `Crédito · saldo ${fmt(v.saldo, 'USD')} en cuentas por cobrar` : 'Contado'}</div></div>
    <div class="sum"><div class="tot"><span>Cobrado</span><span>${fmt(v.inicial, 'USD')}</span></div><div><span style="color:var(--mut)">En bolívares</span><b>${fmt(v.inicial, 'VES')}</b></div></div>
    <img id="tkImg" class="tkprev" alt="Ticket">
    <button class="btn pri block" id="tkSh" disabled>Preparando ticket…</button>
    <a class="btn gh block" style="margin-top:10px" target="_blank" href="https://wa.me/${tel}?text=${encodeURIComponent(txt)}">Enviar como texto por WhatsApp</a>
    <button class="btn gh block" style="margin-top:10px" onclick="document.querySelector('.ov').remove()">Listo</button>`);
    ticketBlob(v).then(b => { const im = document.querySelector('#tkImg'), bt = document.querySelector('#tkSh'); if (!im) return; im.src = URL.createObjectURL(b); bt.disabled = false; bt.textContent = '🧾 Enviar ticket (imagen)'; bt.onclick = () => shareTicket(b, v.numero); });
  },
  tkRead() { const g = k => $('#tk' + k).value.trim(), t = { nombre: g('N') || 'Muebles La Pascua', rif: g('R'), telefono: g('T'), direccion: g('D'), instagram: g('I'), pie: g('P'), almacen: g('A') }; ['logo', 'bs', 'cliente', 'pagos', 'garantia', 'vendedor'].forEach(k => t[k] = $('#tk_' + k).checked); return t; },
  async tkSave() { try { await store.setTicket(this.tkRead()); toast('Ticket guardado'); } catch (e) { toast('Error: ' + e.message); } },
  async tkPrev() {
    const p = db().productos[0], v = { numero: 1001, fecha: today(), clienteId: db().clientes[0]?.id, vendedor: db().usuario?.nombre, tipo: 'contado', total: p ? +p.precio : 250, inicial: p ? +p.precio : 250, items: [{ productoId: p?.id, nombre: p?.nombre || 'Nevera 14 pies', cant: 1, precio: p ? +p.precio : 250 }], pagos: [{ metodo: 'Pago móvil', moneda: '$', monto: p ? +p.precio : 250 }] };
    const b = await ticketBlob(v, this.tkRead()); sheet(`<h2>Vista previa</h2><div class="sub">Así lo recibe tu cliente</div><img class="tkprev" src="${URL.createObjectURL(b)}"><button class="btn gh block" onclick="document.querySelector('.ov').remove()">Cerrar</button>`);
  },
  prodForm(id) {
    const p = db().productos.find(p => p.id === id) || { nombre: '', categoria: 'Electrodomésticos', icono: '📦', costo: '', precio: '', stock: '', min: 2, garantiaMeses: 12 };
    const o = sheet(`<h2>${id ? 'Editar' : 'Nuevo'} producto</h2><div class="sub">Inventario por cantidad, sin seriales</div>
    <div class="row2"><div class="fld"><label>Ícono</label><button type="button" class="in emo-btn" id="pIb">${p.icono}</button><input type="hidden" id="pI" value="${p.icono}"></div><div class="fld"><label>Categoría</label><select class="in" id="pC">${CATS(p.categoria).map(c => `<option ${c === p.categoria ? 'selected' : ''}>${esc(c)}</option>`).join('')}${esJefe() ? '<option value="__new">+ Nueva categoría…</option>' : ''}</select></div></div>
    <div class="emo" id="pEmo" hidden>${EMOJIS.map(e => `<button type="button">${e}</button>`).join('')}<div class="emo-otro"><input class="in" id="pEo" placeholder="Otro emoji (toca 🌐 o 😀 en el teclado)"><button type="button" class="btn pri" id="pEok">Usar</button></div></div>
    <div class="fld"><label>Nombre</label><input class="in" id="pN" value="${esc(p.nombre)}"></div>
    <div class="row3"><div class="fld"><label>Costo $</label><input class="in" id="pCo" type="number" step="0.01" inputmode="decimal" value="${p.costo}"></div><div class="fld"><label>% utilidad 1</label><input class="in" id="pU" type="number" step="0.1" inputmode="decimal" placeholder="30" value="${+p.costo > 0 && +p.precio ? ((p.precio / p.costo - 1) * 100).toFixed(1) : ''}"></div><div class="fld"><label>Precio 1 $</label><input class="in" id="pP" type="number" step="0.01" inputmode="decimal" value="${p.precio}"></div></div><div class="row3"><div class="fld"><label>Precio 2</label><div class="in" style="opacity:.5;text-align:center">opcional</div></div><div class="fld"><label>% utilidad 2</label><input class="in" id="pU2" type="number" step="0.1" inputmode="decimal" placeholder="20" value="${+p.costo > 0 && +p.precio2 ? ((p.precio2 / p.costo - 1) * 100).toFixed(1) : ''}"></div><div class="fld"><label>Precio 2 $</label><input class="in" id="pP2" type="number" step="0.01" inputmode="decimal" value="${p.precio2 ?? ''}"></div></div><div class="sub" id="pGan" style="margin:-4px 0 12px"></div>
    <div class="row2"><div class="fld"><label>Existencia</label><input class="in" id="pS" type="number" value="${p.stock}"></div><div class="fld"><label>Stock mínimo</label><input class="in" id="pM" type="number" value="${p.min}"></div></div>
    <div class="fld"><label>Garantía (meses)</label><input class="in" id="pG" type="number" value="${p.garantiaMeses}"></div>
    <button class="btn pri block" id="pOk">Guardar</button>${id ? `<button class="btn gh block" style="margin-top:10px" id="pDel">Retirar del catálogo</button>` : ''}`);
    const g = s => o.querySelector(s).value;
    const setE = e => { o.querySelector('#pI').value = e; o.querySelector('#pIb').textContent = e; o.querySelector('#pEmo').hidden = true; };
    o.querySelector('#pIb').onclick = () => { const g = o.querySelector('#pEmo'); g.hidden = !g.hidden; };
    o.querySelectorAll('#pEmo>button').forEach(b => b.onclick = () => setE(b.textContent));
    o.querySelector('#pEok').onclick = () => { const i = o.querySelector('#pEo'), v = i.value.trim(); if (!v) return toast('Escribe o pega un emoji'); const seg = window.Intl?.Segmenter ? [...new Intl.Segmenter().segment(v)][0].segment : [...v][0]; setE(seg); i.value = ''; };
    o.querySelector('#pC').onchange = async e => { if (e.target.value !== '__new') return; const n = (prompt('Nombre de la nueva categoría') || '').trim(); if (!n) { e.target.selectedIndex = 0; return; } try { if (!db().config.categorias.includes(n)) await store.setCategorias([...db().config.categorias, n]); const op = new Option(n, n, true, true); e.target.add(op, e.target.options.length - 1); toast('Categoría agregada'); } catch (err) { toast('Error: ' + err.message); e.target.selectedIndex = 0; } };
    const co = o.querySelector('#pCo'), pu = o.querySelector('#pU'), pp = o.querySelector('#pP'), gan = () => { const c = +co.value, v = +pp.value; o.querySelector('#pGan').textContent = c > 0 && v > 0 ? `Ganancia por unidad: $${(v - c).toFixed(2)} · margen sobre venta ${((v - c) / v * 100).toFixed(1)}%` : ''; };
    const pu2 = o.querySelector('#pU2'), pp2 = o.querySelector('#pP2'), calc2 = () => { if (+co.value > 0 && pu2.value !== '') pp2.value = (+co.value * (1 + +pu2.value / 100)).toFixed(2); };
    pu2.oninput = calc2; pp2.oninput = () => { if (+co.value > 0 && pp2.value !== '') pu2.value = ((+pp2.value / +co.value - 1) * 100).toFixed(1); };
    const calcP = () => { if (+co.value > 0 && pu.value !== '') pp.value = (+co.value * (1 + +pu.value / 100)).toFixed(2); calc2(); gan(); };
    co.oninput = calcP; pu.oninput = calcP; pp.oninput = () => { if (+co.value > 0 && pp.value !== '') pu.value = ((+pp.value / +co.value - 1) * 100).toFixed(1); gan(); }; gan();
    o.querySelector('#pOk').onclick = async () => { const d = { nombre: g('#pN'), categoria: g('#pC'), icono: g('#pI') || '📦', costo: +g('#pCo'), precio: +g('#pP'), precio2: +g('#pP2') || null, stock: +g('#pS'), min: +g('#pM'), garantia_meses: +g('#pG') }; if (!d.nombre) return toast('Falta el nombre'); try { if (id) await store.updProducto(id, d); else await store.addProducto({ ...d, garantiaMeses: d.garantia_meses }); closeSheet(); toast('Guardado'); render(); } catch (e) { toast(e.message); } };
    if (id) o.querySelector('#pDel').onclick = async () => { await store.updProducto(id, { activo: false }); closeSheet(); render(); };
  },
  clienteForm(id) {
    const c = db().clientes.find(c => c.id === id) || {};
    const o = sheet(`<h2>${id ? 'Editar' : 'Nuevo'} cliente</h2><div class="sub">Para facturas, entregas y seguimiento</div><div class="fld"><label>Nombre completo</label><input class="in" id="cN" value="${esc(c.nombre || '')}"></div><div class="row2"><div class="fld"><label>Cédula / RIF</label><input class="in" id="cC" placeholder="V-" value="${esc(c.cedula || '')}"></div><div class="fld"><label>Teléfono</label><input class="in" id="cT" placeholder="0414-" inputmode="tel" value="${esc(c.telefono || '')}"></div></div><div class="fld"><label>Dirección</label><textarea class="in" id="cD" rows="3" placeholder="Sector, calle, casa, punto de referencia">${esc(c.direccion || '')}</textarea></div><button class="btn pri block" id="cOk">Guardar</button>`);
    o.querySelector('#cOk').onclick = async e => { const g = s => o.querySelector(s).value.trim(); if (!g('#cN')) return toast('Falta el nombre'); e.target.disabled = true; const d = { nombre: g('#cN'), cedula: g('#cC'), telefono: g('#cT'), direccion: g('#cD') }; try { if (id) await store.updCliente(id, d); else await store.addCliente(d); closeSheet(); toast('Cliente guardado'); render(); } catch (err) { toast(err.message); e.target.disabled = false; } };
  },
  provForm(id, after) {
    const p = db().proveedores.find(x => x.id === id) || {};
    const o = sheet(`<h2>${id ? 'Editar' : 'Nuevo'} proveedor</h2><div class="sub">Para compras y cuentas por pagar</div><div class="fld"><label>Nombre o razón social</label><input class="in" id="vN" value="${esc(p.nombre || '')}"></div><div class="row2"><div class="fld"><label>RIF</label><input class="in" id="vR" placeholder="J-" value="${esc(p.rif || '')}"></div><div class="fld"><label>Teléfono</label><input class="in" id="vT" inputmode="tel" value="${esc(p.telefono || '')}"></div></div><div class="fld"><label>Persona de contacto</label><input class="in" id="vC" value="${esc(p.contacto || '')}"></div><div class="fld"><label>Dirección</label><input class="in" id="vD" value="${esc(p.direccion || '')}"></div><button class="btn pri block" id="vOk">Guardar</button>`);
    o.querySelector('#vOk').onclick = async e => { const g = s => o.querySelector(s).value.trim(); if (!g('#vN')) return toast('Falta el nombre'); e.target.disabled = true; const d = { nombre: g('#vN'), rif: g('#vR'), telefono: g('#vT'), contacto: g('#vC'), direccion: g('#vD') }; try { let r; if (id) await store.updProveedor(id, d); else r = await store.addProveedor(d); closeSheet(); toast('Proveedor guardado'); if (after) after(r); else render(); } catch (err) { toast(err.message); e.target.disabled = false; } };
  },
  compraForm(st) {
    st = st || { prov: db().proveedores[0]?.id || '', doc: 'factura', num: '', fecha: today(), cond: 'contado', dias: 30, met: 'Transferencia', nota: '', upd: true, items: [{ pid: '', nombre: '', cat: CATS()[0], cant: 1, costo: '', pct: '', precio: '' }] };
    const METS = ['Transferencia', 'Pago móvil', 'Efectivo $', 'Efectivo Bs', 'Zelle', 'Binance', 'Punto de venta'];
    const total = () => st.items.reduce((a, i) => a + (+i.cant || 0) * (+i.costo || 0), 0);
    const o = sheet(`<h2>Nueva compra</h2><div class="sub">Los productos se suman al inventario al guardar</div>
    <div class="fld"><label>Proveedor</label><div style="display:flex;gap:6px"><select class="in" id="kP" style="flex:1">${db().proveedores.map(p => `<option value="${p.id}" ${p.id === st.prov ? 'selected' : ''}>${esc(p.nombre)}</option>`).join('') || '<option value="">— Crea un proveedor —</option>'}</select><button class="pill" id="kPn">+ Nuevo</button></div></div>
    <div class="row2"><div class="fld"><label>Documento</label><select class="in" id="kD"><option value="factura" ${st.doc === 'factura' ? 'selected' : ''}>Factura</option><option value="nota" ${st.doc === 'nota' ? 'selected' : ''}>Nota de entrega</option></select></div><div class="fld"><label>Número</label><input class="in" id="kN" value="${esc(st.num)}" placeholder="Ej. 000123"></div></div>
    <div class="row2"><div class="fld"><label>Fecha</label><input class="in" id="kF" type="date" value="${st.fecha}"></div><div class="fld"><label>Condición</label><select class="in" id="kC"><option value="contado" ${st.cond === 'contado' ? 'selected' : ''}>Contado</option><option value="credito" ${st.cond === 'credito' ? 'selected' : ''}>Crédito</option></select></div></div>
    <div class="fld" id="kCx">${st.cond === 'credito' ? `<label>Días de crédito</label><input class="in" id="kV" type="number" inputmode="numeric" value="${st.dias}">` : ''}</div>
    <datalist id="kL">${db().productos.filter(p => !p.varios).map(p => `<option value="${esc(p.nombre)}">`).join('')}</datalist>
    <h3 style="margin:16px 0 8px">Productos</h3><div id="kI"></div><button class="pill" id="kAdd" style="margin-bottom:14px">+ Agregar producto</button>
    <label style="display:flex;gap:8px;align-items:center;margin-bottom:12px;font-size:14px"><input type="checkbox" id="kU" ${st.upd ? 'checked' : ''}> Actualizar costo y precio de venta en el inventario</label>
    <div class="sum" style="margin-top:0"><div><span>Total compra</span><b id="kT">${fmt(total(), 'USD')}</b></div><div><span style="color:var(--mut)">En bolívares</span><span id="kTb">${fmt(total(), 'VES')}</span></div></div>
    <div class="fld"><label>Nota (opcional)</label><input class="in" id="kO" value="${esc(st.nota)}"></div>
    <button class="btn pri block" id="kOk">Guardar compra</button>`);
    const box = o.querySelector('#kI');
    const tot = () => { o.querySelector('#kT').textContent = fmt(total(), 'USD'); o.querySelector('#kTb').textContent = fmt(total(), 'VES'); };
    const pctDe = p => +p.costo > 0 && +p.precio ? ((p.precio / p.costo - 1) * 100).toFixed(1) : '';
    const draw = () => {
      box.innerHTML = st.items.map((it, i) => `<div class="card" style="padding:12px;margin-bottom:10px" data-r="${i}">
      <div style="display:flex;gap:6px"><input class="in" list="kL" data-k="nombre" value="${esc(it.nombre)}" placeholder="Producto (escribe o elige)" style="flex:1">${st.items.length > 1 ? `<button class="pill" data-del="${i}">✕</button>` : ''}</div>
      ${it.nombre && !it.pid ? `<div style="display:flex;gap:6px;align-items:center;margin-top:6px"><small class="up" style="white-space:nowrap">✨ Nuevo</small><select class="in" data-k="cat" style="flex:1">${CATS().map(c => `<option ${c === it.cat ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>` : it.pid ? `<small style="color:var(--mut)">En inventario: ${db().productos.find(p => p.id === it.pid)?.stock ?? 0} uds · costo actual ${fmt(db().productos.find(p => p.id === it.pid)?.costo || 0, 'USD')}</small>` : ''}
      <div style="display:grid;grid-template-columns:.7fr 1fr .8fr 1fr;gap:6px;margin-top:8px"><div><small>Cant.</small><input class="in" data-k="cant" type="number" inputmode="numeric" value="${it.cant}"></div><div><small>Costo $</small><input class="in" data-k="costo" type="number" step="0.01" inputmode="decimal" value="${it.costo}"></div><div><small>% util.</small><input class="in" data-k="pct" type="number" step="0.1" inputmode="decimal" value="${it.pct}" placeholder="30"></div><div><small>Precio venta $</small><input class="in" data-k="precio" type="number" step="0.01" inputmode="decimal" value="${it.precio}"></div></div>
      <small data-g style="color:var(--mut)"></small></div>`).join('');
      box.querySelectorAll('[data-r]').forEach(r => gan(r));
    };
    const gan = r => { const it = st.items[+r.dataset.r], c = +it.costo, v = +it.precio; r.querySelector('[data-g]').textContent = c > 0 && v > 0 ? `Gana $${(v - c).toFixed(2)} por unidad · subtotal ${fmt(c * (+it.cant || 0), 'USD')}` : ''; };
    box.oninput = e => {
      const r = e.target.closest('[data-r]'), k = e.target.dataset.k; if (!r || !k) return; const it = st.items[+r.dataset.r]; it[k] = e.target.value;
      const q = s => r.querySelector(`[data-k="${s}"]`);
      if (k === 'costo' || k === 'pct') { if (+it.costo > 0 && it.pct !== '') { it.precio = (+it.costo * (1 + +it.pct / 100)).toFixed(2); q('precio').value = it.precio; } }
      if (k === 'precio') { if (+it.costo > 0 && it.precio !== '') { it.pct = ((+it.precio / +it.costo - 1) * 100).toFixed(1); q('pct').value = it.pct; } }
      gan(r); tot();
    };
    box.onchange = e => {
      const r = e.target.closest('[data-r]'); if (!r || e.target.dataset.k !== 'nombre') return; const it = st.items[+r.dataset.r];
      const p = db().productos.find(p => !p.varios && p.nombre.toLowerCase() === it.nombre.trim().toLowerCase());
      if (p) { it.pid = p.id; it.nombre = p.nombre; if (it.costo === '') it.costo = p.costo; it.pct = pctDe({ costo: it.costo, precio: p.precio }) || it.pct; if (it.pct !== '' && +it.costo > 0) it.precio = (+it.costo * (1 + +it.pct / 100)).toFixed(2); else it.precio = p.precio; } else it.pid = '';
      draw(); tot();
    };
    box.onclick = e => { const d = e.target.dataset.del; if (d === undefined) return; st.items.splice(+d, 1); draw(); tot(); };
    o.querySelector('#kAdd').onclick = () => { st.items.push({ pid: '', nombre: '', cat: CATS()[0], cant: 1, costo: '', pct: '', precio: '' }); draw(); box.querySelector('[data-r]:last-child input').focus(); };
    const save = () => { st.prov = o.querySelector('#kP').value; st.doc = o.querySelector('#kD').value; st.num = o.querySelector('#kN').value; st.fecha = o.querySelector('#kF').value; st.nota = o.querySelector('#kO').value; st.upd = o.querySelector('#kU').checked; const v = o.querySelector('#kV'), m = o.querySelector('#kM'); if (v) st.dias = +v.value || 0; if (m) st.met = m.value; };
    o.querySelector('#kC').onchange = e => { save(); st.cond = e.target.value; closeSheet(); this.compraForm(st); };
    o.querySelector('#kPn').onclick = () => { save(); closeSheet(); this.provForm(null, r => { if (r) st.prov = r.id; this.compraForm(st); }); };
    o.querySelector('#kOk').onclick = async e => {
      save(); if (!st.prov) return toast('Elige o crea el proveedor');
      const its = st.items.filter(i => i.nombre.trim());
      if (!its.length) return toast('Agrega al menos un producto');
      if (its.some(i => !(+i.cant > 0) || !(+i.costo >= 0) || i.costo === '')) return toast('Revisa cantidad y costo de cada producto');
      const t = +total().toFixed(2), vence = st.cond === 'credito' ? new Date(new Date(st.fecha + 'T12:00').getTime() + st.dias * 864e5).toISOString().slice(0, 10) : null;
      e.target.disabled = true; e.target.textContent = 'Guardando…';
      try {
        const c = await store.addCompra({ proveedor_id: st.prov, doc_tipo: st.doc, doc_numero: st.num.trim() || null, fecha: st.fecha, condicion: st.cond, vence, metodo: null, nota: st.nota.trim() || null, actualizar_costo: st.upd, pagos: null, items: its.map(i => ({ producto_id: i.pid || null, nombre: i.nombre.trim(), categoria: i.cat, cant: +i.cant, costo: +i.costo, precio: i.precio === '' ? null : +i.precio })) });
        closeSheet(); render(); toast(`Compra #${c.numero} guardada · ${its.reduce((a, i) => a + +i.cant, 0)} uds al inventario ✅`);
      } catch (err) { toast('Error: ' + err.message); e.target.disabled = false; e.target.textContent = 'Guardar compra'; }
    };
    draw();
  },
  verCompra(id) {
    const c = db().compras.find(x => x.id === id), pg = db().pagosProv.filter(x => x.compraId === id);
    sheet(`<h2>Compra #${c.numero}</h2><div class="sub">${esc(provN(c.proveedorId))} · ${esc(docL(c))} · ${fdate(c.fecha)}${c.usuario ? ' · ' + esc(c.usuario) : ''}</div>
    <table class="tbl"><thead><tr><th>Producto</th><th>Cant.</th><th>Costo</th><th>Subtotal</th></tr></thead><tbody>${(c.items || []).map(i => `<tr><td>${esc(i.nombre)}</td><td>${i.cant}</td><td>${fmt(+i.costo)}</td><td>${fmt(i.cant * i.costo)}</td></tr>`).join('')}</tbody></table>
    <div class="sum"><div><span>Total</span><b>${fmt(c.total)}</b></div><div><span>${c.condicion === 'credito' ? 'Crédito' + (c.vence ? ', vence ' + fdate(c.vence) : '') : 'Contado'}</span><span>Pagado ${fmt(c.pagado)}</span></div>${c.saldo > 0.009 ? `<div><span>Saldo</span><b class="down">${fmt(c.saldo)}</b></div>` : ''}</div>
    ${pg.length ? `<h3 style="margin:14px 0 6px">Pagos</h3><table class="tbl"><tbody>${pg.map(x => `<tr><td>${fdate(x.fecha)}</td><td>${esc(x.metodo || '')}${x.nota ? `<br><small>${esc(x.nota)}</small>` : ''}</td><td style="text-align:right">${fmt(x.monto)}</td>${esJefe() && c.condicion === 'credito' ? `<td><button class="pill" onclick="App.delPagoProv('${x.id}','${c.id}')">✕</button></td>` : ''}</tr>`).join('')}</tbody></table>` : ''}
    ${c.nota ? `<p style="color:var(--mut)">${esc(c.nota)}</p>` : ''}
    <div class="row2" style="margin-top:12px">${c.saldo > 0.009 && ['dueno', 'admin', 'cajero'].includes(rol()) ? `<button class="btn pri" onclick="document.querySelector('.ov').remove();App.pagoProvForm('${c.id}')">Pagar</button>` : '<span></span>'}${esJefe() ? `<button class="btn gh" onclick="App.anularCompra('${c.id}')">Anular compra</button>` : ''}</div>`);
  },
  async delPagoProv(pid, cid) { if (!confirm('¿Borrar este pago?')) return; try { await store.delPagoProv(pid); closeSheet(); render(); this.verCompra(cid); } catch (e) { toast('Error: ' + e.message); } },
  async anularCompra(id) {
    const c = db().compras.find(x => x.id === id), m = prompt(`¿Anular la compra #${c.numero}? Se restan del inventario los productos que entraron y se borran sus pagos.\nEscribe el motivo:`);
    if (m === null) return; if (!m.trim()) return toast('Escribe el motivo');
    try { await store.anularCompra(id, m.trim()); closeSheet(); render(); toast(`Compra #${c.numero} anulada`); } catch (e) { toast('Error: ' + e.message); }
  },
  pagoProvForm(id) {
    const c = db().compras.find(x => x.id === id), T = db().tasa.valor, METS = ['Transferencia', 'Pago móvil', 'Efectivo $', 'Efectivo Bs', 'Zelle', 'Binance', 'Punto de venta'];
    const o = sheet(`<h2>Pago a proveedor</h2><div class="sub">${esc(provN(c.proveedorId))} · ${esc(docL(c))}</div>
    <div class="sum" style="margin-top:0"><div><span>Saldo</span><b>${fmt(c.saldo, 'USD')}</b></div><div><span style="color:var(--mut)">En bolívares</span><span>${fmt(c.saldo, 'VES')}</span></div></div>
    <div class="fld"><label>Método</label><select class="in" id="pM">${METS.map(m => `<option>${m}</option>`).join('')}</select></div>
    <div class="row2"><div class="fld"><label>Monto</label><input class="in" id="pV" type="number" step="0.01" inputmode="decimal" placeholder="0.00"></div><div class="fld"><label>Moneda</label><select class="in" id="pC"><option>$</option><option selected>Bs</option></select></div></div>
    <div id="pMsg" style="margin:-4px 0 12px;font-size:13px"></div><button class="pill" id="pTodo" style="margin-bottom:12px">Pagar todo el saldo</button>
    <div class="fld"><label>Nota (opcional)</label><input class="in" id="pN" placeholder="Ej. referencia"></div>
    <button class="btn pri block" id="pOk">Guardar pago</button>`);
    const usd = () => { const m = +o.querySelector('#pV').value || 0; return o.querySelector('#pC').value === 'Bs' ? m / T : m; };
    const msg = () => { const u = usd(), r = c.saldo - u; o.querySelector('#pMsg').innerHTML = !u ? '' : r < -0.01 ? `<span class="down">Pasa del saldo por ${fmt(-r, 'USD')}</span>` : `<span class="up">${fmt(u, 'USD')} · queda ${fmt(Math.max(0, r), 'USD')}</span>`; };
    o.querySelector('#pM').onchange = e => { o.querySelector('#pC').value = /\$|Zelle|Binance/.test(e.target.value) ? '$' : 'Bs'; msg(); };
    o.querySelector('#pV').oninput = msg; o.querySelector('#pC').onchange = msg;
    o.querySelector('#pTodo').onclick = () => { const bs = o.querySelector('#pC').value === 'Bs'; o.querySelector('#pV').value = (bs ? c.saldo * T : c.saldo).toFixed(2); msg(); };
    o.querySelector('#pOk').onclick = async e => {
      const u = +usd().toFixed(2); if (!(u > 0)) return toast('Escribe el monto'); if (u > c.saldo + 0.01) return toast('El pago pasa del saldo');
      e.target.disabled = true; e.target.textContent = 'Guardando…';
      try { const m = o.querySelector('#pM').value, mon = o.querySelector('#pC').value, mo = +(+o.querySelector('#pV').value).toFixed(2), x = Math.min(u, c.saldo); await store.addPagoProv({ compraId: c.id, proveedorId: c.proveedorId, monto: x, metodo: m, pagos: [{ metodo: m, moneda: mon, monto: mo, usd: x }], nota: o.querySelector('#pN').value.trim() }); closeSheet(); render(); toast('Pago registrado ✅'); }
      catch (err) { toast('Error: ' + err.message); e.target.disabled = false; e.target.textContent = 'Guardar pago'; }
    };
  },
  gastoForm() {
    const o = sheet(`<h2>Registrar gasto</h2><div class="sub">Sale de la caja de hoy</div><div class="fld"><label>Concepto</label><input class="in" id="gC"></div><div class="row2"><div class="fld"><label>Monto $</label><input class="in" id="gM" type="number" step="0.01"></div><div class="fld"><label>Categoría</label><select class="in" id="gK">${['Fijos', 'Nómina', 'Logística', 'Mercadeo', 'Servicios', 'Otros'].map(c => `<option>${c}</option>`).join('')}</select></div></div><button class="btn pri block" id="gOk">Guardar</button>`);
    o.querySelector('#gOk').onclick = async () => { const g = s => o.querySelector(s).value; if (!g('#gC') || !+g('#gM')) return toast('Completa concepto y monto'); await store.addGasto({ concepto: g('#gC'), monto: +g('#gM'), categoria: g('#gK') }); closeSheet(); render(); };
  },
  async liquidar(id) { await store.liquidar(id); toast('Liquidación marcada como recibida'); render(); },
  async setTasa() { const v = +$('#tasaIn').value; if (v > 0) { await store.setTasa(v); render(); toast('Tasa actualizada'); } },
  async setCom() { const v = +$('#comIn').value; const { sb } = await import('./store.js?v=28'); await sb.from('config').update({ comision_cashea: v }).eq('id', 1); await store.load(); render(); toast('Comisión guardada'); },
  async bcv(force) {
    if (!esJefe()) return; if (!force && db().tasa.fecha === today()) return;
    try { const r = await (await fetch('https://ve.dolarapi.com/v1/dolares/oficial')).json(); if (r.promedio) { await store.setTasa(+r.promedio.toFixed(2), 'BCV'); render(); if (force) toast('Tasa BCV: ' + r.promedio.toFixed(2)); } } catch { if (force) toast('No pude traer la tasa, colócala manual'); }
  },
  userForm(id) {
    const u = id ? db().perfiles.find(x => x.id === id) : { rol: 'vendedor', activo: true }, mods = u.modulos || modsDef(u.rol);
    const o = sheet(`<h2>${id ? 'Editar usuario' : 'Nuevo usuario'}</h2><div class="sub">${id ? esc(u.email || '') : 'Entrará con este correo y contraseña'}</div>
    <div class="fld"><label>Nombre</label><input class="in" id="uN" value="${esc(u.nombre || '')}"></div>
    ${id ? '' : '<div class="fld"><label>Correo</label><input class="in" id="uE" type="email" autocomplete="off" placeholder="empleado@gmail.com"></div>'}
    <div class="fld"><label>${id ? 'Nueva contraseña (déjala vacía para no cambiarla)' : 'Contraseña (mínimo 6)'}</label><input class="in" id="uP" type="text" autocomplete="new-password"></div>
    <div class="fld"><label>Perfil</label><div class="seg" id="uR">${[['vendedor', 'Vendedor'], ['cajero', 'Cajero'], ['almacen', 'Almacén'], ['admin', 'Administrador']].map(([k, l]) => `<button data-v="${k}" class="${u.rol === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    <div class="fld"><label>Módulos a los que puede entrar</label><div class="tkchk" id="uM">${MODS.map(([k, l]) => `<label><input type="checkbox" value="${k}" ${mods.includes(k) ? 'checked' : ''}> ${l}</label>`).join('')}</div><small style="color:var(--mut)">Ajustes siempre aparece para cerrar sesión. Los permisos de borrar, anular y configurar son solo de Administrador.</small></div>
    ${id ? `<label style="display:flex;gap:8px;align-items:center;margin-bottom:14px"><input type="checkbox" id="uA" ${u.activo ? 'checked' : ''}> Usuario activo (desmárcalo para bloquear la entrada)</label>` : ''}
    <button class="btn pri block" id="uOk">${id ? 'Guardar cambios' : 'Crear usuario'}</button>`);
    let r = u.rol;
    o.querySelectorAll('#uR button').forEach(b => b.onclick = () => { o.querySelectorAll('#uR button').forEach(x => x.classList.remove('on')); b.classList.add('on'); r = b.dataset.v; const d = modsDef(r); o.querySelectorAll('#uM input').forEach(c => c.checked = d.includes(c.value)); });
    o.querySelector('#uOk').onclick = async e => {
      const n = o.querySelector('#uN').value.trim(), p = o.querySelector('#uP').value, m = [...o.querySelectorAll('#uM input:checked')].map(c => c.value);
      if (!n) return toast('Falta el nombre'); if (!m.length) return toast('Elige al menos un módulo'); if ((!id || p) && p.length < 6) return toast('La contraseña necesita al menos 6 caracteres');
      e.target.disabled = true; e.target.textContent = 'Guardando…';
      try {
        if (id) { await store.setPerfil(id, { nombre: n, rol: r, modulos: m, activo: o.querySelector('#uA').checked }); if (p) await store.cambiarClave(id, p); }
        else { const em = o.querySelector('#uE').value.trim(); if (!/^\S+@\S+\.\S+$/.test(em)) throw new Error('correo inválido'); await store.crearUsuario({ email: em, pass: p, nombre: n, rol: r, modulos: m }); }
        closeSheet(); render(); toast(id ? 'Usuario actualizado' : 'Usuario creado. Ya puede entrar con su correo y contraseña');
      } catch (err) { toast('Error: ' + err.message); e.target.disabled = false; e.target.textContent = id ? 'Guardar cambios' : 'Crear usuario'; }
    };
  },
  async setRol(id, r) { await store.setPerfil(id, { rol: r }); toast('Rol actualizado'); },
  async toggleUser(id, a) { await store.setPerfil(id, { activo: a }); render(); },
  async borrarDemo() { if (!confirm('¿Borrar todos los datos de demostración? Tus datos reales se quedan.')) return; await store.borrarDemo(); render(); toast('Demo borrada'); },
  async repPDF() {
    toast('Generando PDF…');
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('https://esm.sh/jspdf@2.5.2'), import('https://esm.sh/jspdf-autotable@3.8.4')]);
      const r = repData(), tasa = db().tasa.valor, cli = id => db().clientes.find(c => c.id === id)?.nombre || 'Sin cliente', $f = n => '$' + (+n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), bs = n => 'Bs ' + ((+n || 0) * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const doc = new jsPDF({ unit: 'pt', format: 'letter' }), W = doc.internal.pageSize.getWidth(), nav = [15, 42, 71], amb = [242, 159, 5];
      const lg = await logoImg(); if (lg) { const c = document.createElement('canvas'); c.width = lg.width; c.height = lg.height; c.getContext('2d').drawImage(lg, 0, 0); doc.addImage(c.toDataURL('image/jpeg', .9), 'JPEG', 40, 28, 110, 110 * lg.height / lg.width); }
      const tk = TK(); doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(...nav); doc.text(RP.tab === 'cashea' ? 'Reporte Cashea' : 'Reporte de ventas', W - 40, 46, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(90);
      doc.text([`${tk.nombre}${tk.rif ? ' · RIF ' + tk.rif : ''}`, `Período: ${fdate(r.d)}${r.d !== r.h ? ' al ' + fdate(r.h) : ''} ${r.d.slice(0, 4)}`, `Tasa BCV: ${tasa} Bs/$ · Generado ${new Date().toLocaleString('es-VE')}`], W - 40, 64, { align: 'right' });
      let y = 110; const sec = t => { y = (doc.lastAutoTable?.finalY ?? y) + 24; if (y > 700) { doc.addPage(); y = 50; } doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...nav); doc.text(t, 40, y); y += 8; };
      const tb = (head, body, o = {}) => autoTable(doc, { startY: y, head: [head], body: body.length ? body : [[{ content: 'Sin datos', colSpan: head.length }]], theme: 'striped', headStyles: { fillColor: nav, textColor: 255 }, styles: { fontSize: 9, cellPadding: 5 }, margin: { left: 40, right: 40 }, ...o });
      doc.setDrawColor(...amb); doc.setLineWidth(2); doc.line(40, 100, W - 40, 100);
      if (RP.tab === 'cashea') {
        sec('Resumen'); tb(['Concepto', 'Monto $', 'Monto Bs'], [['Ventas con Cashea (' + r.cas.length + ')', $f(r.tk), bs(r.tk)], ['Inicial cobrada', $f(r.ini), bs(r.ini)], ['Financiado por Cashea', $f(r.fin), bs(r.fin)], [{ content: 'Comisiones que cobra Cashea', styles: { fontStyle: 'bold', textColor: [190, 40, 40] } }, { content: '-' + $f(r.com), styles: { fontStyle: 'bold', textColor: [190, 40, 40] } }, { content: '-' + bs(r.com), styles: { fontStyle: 'bold', textColor: [190, 40, 40] } }], ['Neto a recibir', $f(r.neto), bs(r.neto)], ['Recibido', $f(r.liq), bs(r.liq)], ['Pendiente', $f(r.pend), bs(r.pend)]]);
        sec('Detalle'); tb(['#', 'Fecha', 'Cliente', 'Total', 'Inicial', 'Financiado', 'Comisión', 'Neto', 'Estado'], r.cas.map(v => [v.numero, fdate(v.fecha), cli(v.clienteId), $f(v.total), $f(v.inicial), $f(v.financiado), $f(v.comision), $f(v.netoCashea), v.liquidado ? 'Recibido' : 'Pendiente']), { styles: { fontSize: 8, cellPadding: 4 }, foot: r.cas.length ? [['', '', 'Totales', $f(r.tk), $f(r.ini), $f(r.fin), $f(r.com), $f(r.neto), '']] : undefined, footStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' } });
      } else {
        const un = r.total - r.costo - r.com - r.gas;
        sec('Resumen'); tb(['Concepto', 'Monto $', 'Monto Bs'], [['Total vendido (' + r.vs.length + ' ventas)', $f(r.total), bs(r.total)], ['Contado (' + r.cont.length + ')', $f(r.tc), bs(r.tc)], ['Crédito Cashea (' + r.cas.length + ')', $f(r.tk), bs(r.tk)], ['Crédito propio (' + r.cre.length + ')', $f(r.tr), bs(r.tr)], ['Abonos cobrados (' + r.abP.length + ')', $f(r.tab), bs(r.tab)], ['Inicial Cashea cobrada', $f(r.ini), bs(r.ini)], ['Costo de mercancía', $f(r.costo), bs(r.costo)], ['Comisión Cashea', $f(r.com), bs(r.com)], ['Gastos', $f(r.gas), bs(r.gas)], [{ content: 'Utilidad neta', styles: { fontStyle: 'bold' } }, { content: $f(un), styles: { fontStyle: 'bold' } }, bs(un)]]);
        if (RP.modo !== 'hoy') { sec('Ventas por día'); tb(['Día', 'Ventas', 'Contado', 'Cashea', 'Crédito', 'Total'], Object.entries(r.dias).map(([f, x]) => [fdate(f), x.n, $f(x.c), $f(x.k), $f(x.r), $f(x.t)])); }
        sec('Cobrado por forma de pago'); tb(['Forma de pago', 'Monto $', 'Monto Bs'], Object.entries(r.met).sort((a, b) => b[1] - a[1]).map(([m, t]) => [m, $f(t), bs(t)]));
        sec('Productos vendidos'); tb(['Producto', 'Unidades', 'Vendido', 'Ganancia'], Object.entries(r.prod).sort((a, b) => b[1].t - a[1].t).map(([n, x]) => [n, x.n, $f(x.t), $f(x.g)]));
        sec('Detalle de ventas'); tb(['#', 'Fecha', 'Cliente', 'Tipo', 'Pago', 'Total'], r.vs.map(v => [v.numero, fdate(v.fecha), cli(v.clienteId), { cashea: 'Cashea', credito: 'Crédito' }[v.tipo] || 'Contado', v.metodo || '', $f(v.total)]));
      }
      const n = doc.getNumberOfPages(); for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(140); doc.text(`${tk.nombre} · Página ${i} de ${n}`, W / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' }); }
      const name = `Reporte ${RP.tab === 'cashea' ? 'Cashea' : 'ventas'} ${r.d}${r.d !== r.h ? ' a ' + r.h : ''}.pdf`, blob = doc.output('blob'), f = new File([blob], name, { type: 'application/pdf' });
      if (navigator.canShare?.({ files: [f] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) { try { await navigator.share({ files: [f], title: name }); } catch (e) { } } else doc.save(name);
    } catch (e) { toast('No pude generar el PDF: ' + e.message); }
  },
  async cxPDF() {
    toast('Generando PDF…');
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('https://esm.sh/jspdf@2.5.2'), import('https://esm.sh/jspdf-autotable@3.8.4')]);
      const r = cxData(), tasa = db().tasa.valor, nm = id => r.cli(id)?.nombre || 'Sin cliente', $f = n => '$' + (+n || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), bs = n => 'Bs ' + ((+n || 0) * tasa).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const doc = new jsPDF({ unit: 'pt', format: 'letter' }), W = doc.internal.pageSize.getWidth(), nav = [15, 42, 71], amb = [242, 159, 5], tk = TK();
      const lg = await logoImg(); if (lg) { const c = document.createElement('canvas'); c.width = lg.width; c.height = lg.height; c.getContext('2d').drawImage(lg, 0, 0); doc.addImage(c.toDataURL('image/jpeg', .9), 'JPEG', 40, 28, 110, 110 * lg.height / lg.width); }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(...nav); doc.text('Cuentas por cobrar', W - 40, 46, { align: 'right' });
      const est = { saldo: 'Con saldo', saldadas: 'Saldadas', todas: 'Todas' }[CX.est], per = CX.d || CX.h ? `Ventas ${CX.d ? 'desde ' + fdate(CX.d) : ''} ${CX.h ? 'hasta ' + fdate(CX.h) : ''}` : 'Todas las fechas';
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(90);
      doc.text([`${tk.nombre}${tk.rif ? ' · RIF ' + tk.rif : ''}`, `${est} · ${per}${CX.q ? ' · Cliente: ' + CX.q : ''}`, `Tasa BCV: ${tasa} Bs/$ · Generado ${new Date().toLocaleString('es-VE')}`], W - 40, 64, { align: 'right' });
      doc.setDrawColor(...amb); doc.setLineWidth(2); doc.line(40, 100, W - 40, 100);
      let y = 110; const sec = t => { y = (doc.lastAutoTable?.finalY ?? y) + 24; if (y > 700) { doc.addPage(); y = 50; } doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...nav); doc.text(t, 40, y); y += 8; };
      const tb = (head, body, o = {}) => autoTable(doc, { startY: y, head: [head], body: body.length ? body : [[{ content: 'Sin datos', colSpan: head.length }]], theme: 'striped', headStyles: { fillColor: nav, textColor: 255 }, styles: { fontSize: 9, cellPadding: 5 }, margin: { left: 40, right: 40 }, ...o });
      sec('Resumen'); tb(['Concepto', 'Monto $', 'Monto Bs'], [['Cuentas (' + r.vs.length + ')', $f(r.total), bs(r.total)], ['Inicial cobrada', $f(r.ini), bs(r.ini)], ['Abonado', $f(r.abo), bs(r.abo)], [{ content: 'Saldo por cobrar', styles: { fontStyle: 'bold' } }, { content: $f(r.saldo), styles: { fontStyle: 'bold' } }, { content: bs(r.saldo), styles: { fontStyle: 'bold' } }]]);
      const g = {}; r.vs.forEach(v => { const x = g[v.clienteId] ||= { n: 0, s: 0, a: 0, t: 0 }; x.n++; x.s += v.saldo; x.a += v.abonado + v.inicial; x.t += v.total; });
      sec('Por cliente'); tb(['Cliente', 'Cédula', 'Teléfono', 'Cuentas', 'Total', 'Pagado', 'Saldo'], Object.entries(g).sort((a, b) => b[1].s - a[1].s).map(([id, x]) => { const c = r.cli(id) || {}; return [c.nombre || 'Sin cliente', c.cedula || '', c.telefono || '', x.n, $f(x.t), $f(x.a), $f(x.s)]; }));
      sec('Detalle de cuentas'); tb(['#', 'Fecha', 'Días', 'Cliente', 'Total', 'Inicial', 'Abonado', 'Saldo'], r.vs.map(v => [v.numero, fdate(v.fecha), r.dias(v), nm(v.clienteId), $f(v.total), $f(v.inicial), $f(v.abonado), $f(v.saldo)]), { styles: { fontSize: 8, cellPadding: 4 } });
      const ids = new Set(r.vs.map(v => v.id)), ab = db().abonos.filter(x => ids.has(x.ventaId));
      sec('Abonos'); tb(['Fecha', 'Nota', 'Cliente', 'Método', 'Monto', 'Registró'], ab.map(x => [fdate(x.fecha), db().ventas.find(v => v.id === x.ventaId)?.numero, nm(x.clienteId), x.metodo || '', $f(x.monto), x.usuario || '']), { styles: { fontSize: 8, cellPadding: 4 } });
      const n = doc.getNumberOfPages(); for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(140); doc.text(`${tk.nombre} · Página ${i} de ${n}`, W / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' }); }
      const name = `Cuentas por cobrar ${today()}.pdf`, f = new File([doc.output('blob')], name, { type: 'application/pdf' });
      if (navigator.canShare?.({ files: [f] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) { try { await navigator.share({ files: [f], title: name }); } catch (e) { } } else doc.save(name);
    } catch (e) { toast('No pude generar el PDF: ' + e.message); }
  },
  async cxExcel() {
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs'), r = cxData(), wb = XLSX.utils.book_new(), nm = id => r.cli(id)?.nombre || '';
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(r.vs.map(v => ({ Numero: v.numero, Fecha: v.fecha, Dias: r.dias(v), Cliente: nm(v.clienteId), Cedula: r.cli(v.clienteId)?.cedula || '', Telefono: r.cli(v.clienteId)?.telefono || '', 'Total $': v.total, 'Inicial $': v.inicial, 'Abonado $': v.abonado, 'Saldo $': v.saldo }))), 'Cuentas');
    const ids = new Set(r.vs.map(v => v.id));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(db().abonos.filter(x => ids.has(x.ventaId)).map(x => ({ Fecha: x.fecha, Nota: db().ventas.find(v => v.id === x.ventaId)?.numero, Cliente: nm(x.clienteId), Metodo: x.metodo, 'Monto $': x.monto, Registro: x.usuario || '' }))), 'Abonos');
    XLSX.writeFile(wb, `Cuentas por cobrar ${today()}.xlsx`);
  },
  async repExcel() {
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs'), r = repData(), wb = XLSX.utils.book_new(), tasa = db().tasa.valor, cli = id => db().clientes.find(c => c.id === id)?.nombre || '';
    const add = (n, rows) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{ Nota: 'Sin datos' }]), n);
    add('Resumen', [{ Desde: r.d, Hasta: r.h, Ventas: r.vs.length, 'Total $': r.total, 'Contado $': r.tc, 'Cashea $': r.tk, 'Inicial Cashea $': r.ini, 'Costo $': r.costo, 'Comisión Cashea $': r.com, 'Gastos $': r.gas, 'Utilidad neta $': r.total - r.costo - r.com - r.gas, 'Tasa BCV': tasa, 'Total Bs': +(r.total * tasa).toFixed(2) }]);
    add('Ventas', r.vs.map(v => ({ Numero: v.numero, Fecha: v.fecha, Cliente: cli(v.clienteId), Tipo: v.tipo, Pago: v.metodo, 'Total $': v.total, 'Cobrado $': v.inicial, Vendedor: v.vendedor || '' })));
    add('Por día', Object.entries(r.dias).map(([f, x]) => ({ Fecha: f, Ventas: x.n, 'Contado $': x.c, 'Cashea $': x.k, 'Total $': x.t })));
    add('Productos', Object.entries(r.prod).map(([n, x]) => ({ Producto: n, Unidades: x.n, 'Vendido $': x.t, 'Ganancia $': x.g })));
    add('Abonos', r.abP.map(x => ({ Fecha: x.fecha, Nota: db().ventas.find(v => v.id === x.ventaId)?.numero, Cliente: cli(x.clienteId), 'Monto $': x.monto, Metodo: x.metodo, Usuario: x.usuario || '' })));
    add('Por cobrar', db().ventas.filter(v => v.tipo === 'credito' && v.saldo > 0.009).map(v => ({ Numero: v.numero, Fecha: v.fecha, Cliente: cli(v.clienteId), 'Total $': v.total, 'Inicial $': v.inicial, 'Abonado $': v.abonado, 'Saldo $': v.saldo })));
    add('Cashea', r.cas.map(v => ({ Numero: v.numero, Fecha: v.fecha, Cliente: cli(v.clienteId), 'Total $': v.total, 'Inicial $': v.inicial, 'Financiado $': v.financiado, 'Comisión $': v.comision, 'Neto $': v.netoCashea, Estado: v.liquidado ? 'Recibido' : 'Pendiente' })).concat(r.cas.length ? [{ Numero: '', Fecha: '', Cliente: 'TOTALES', 'Total $': r.tk, 'Inicial $': r.ini, 'Financiado $': r.fin, 'Comisión $': r.com, 'Neto $': r.neto, Estado: '' }] : []));
    XLSX.writeFile(wb, `Reporte ${r.d}${r.d !== r.h ? ' a ' + r.h : ''}.xlsx`);
  },
  async respaldar() {
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
    const wb = XLSX.utils.book_new(), d = db();
    const add = (n, rows) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), n);
    add('Ventas', d.ventas.map(({ venta_items, items, ...v }) => v));
    add('Detalle ventas', d.ventas.flatMap(v => (v.items || []).map(i => ({ venta: v.numero, fecha: v.fecha, ...i }))));
    add('Productos', d.productos); add('Clientes', d.clientes); add('Gastos', d.gastos); add('Usuarios', d.perfiles);
    XLSX.writeFile(wb, `Respaldo Muebles La Pascua ${today()}.xlsx`); toast('Respaldo descargado');
  },
  async logout() { await store.logout(); render(); },
  palette() {
    const acts = [...NAV.map(([k, l]) => ({ l: 'Ir a ' + l, f: () => App.go(k) })), { l: 'Nueva venta', f: () => App.go('vender') }, { l: 'Nuevo cliente', f: () => App.clienteForm() }, { l: 'Registrar gasto', f: () => App.gastoForm() }, { l: 'Cambiar a ' + (CUR === 'USD' ? 'bolívares' : 'dólares'), f: () => App.setCur(CUR === 'USD' ? 'VES' : 'USD') }, { l: 'Respaldar base de datos', f: () => App.respaldar() }, ...db().productos.map(p => ({ l: `${p.icono} ${p.nombre} · ${fmt(p.precio)} · ${p.stock} disp.`, f: () => { App.go('vender'); App.addCart(p.id); } }))];
    const o = document.createElement('div'); o.className = 'cmd'; o.innerHTML = `<div class="box"><input placeholder="¿Qué quieres hacer? Busca productos, acciones…"><div class="list" style="max-height:50vh;overflow:auto"></div></div>`;
    document.body.appendChild(o); const inp = o.querySelector('input'), list = o.querySelector('.list'); let sel = 0, cur = [];
    const draw = () => { const q = inp.value.toLowerCase(); cur = acts.filter(a => a.l.toLowerCase().includes(q)).slice(0, 9); sel = Math.min(sel, cur.length - 1); list.innerHTML = cur.map((a, i) => `<div class="it ${i === sel ? 'on' : ''}" data-i="${i}">${esc(a.l)}</div>`).join(''); };
    draw(); inp.focus(); inp.oninput = () => { sel = 0; draw(); };
    const run = i => { o.remove(); cur[i]?.f(); };
    list.onclick = e => { const i = e.target.closest('.it')?.dataset.i; if (i != null) run(+i); };
    inp.onkeydown = e => { if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, cur.length - 1); draw(); } else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); } else if (e.key === 'Enter') run(sel); else if (e.key === 'Escape') o.remove(); };
    o.onclick = e => { if (e.target === o) o.remove(); };
  },
};

// ---------- login ----------
function loginView(modo = 'entrar', msg = '') {
  $('#app').innerHTML = `<div class="login"><div class="card"><img src="logo.png" alt="Muebles La Pascua">
  ${msg ? `<div class="sum" style="margin-top:0">${msg}</div>` : ''}
  <form id="fL">${modo === 'registro' ? '<div class="fld"><label>Tu nombre</label><input class="in" id="lN" required></div>' : ''}
  <div class="fld"><label>Correo</label><input class="in" id="lE" type="email" required autocomplete="email"></div>
  <div class="fld"><label>Contraseña</label><input class="in" id="lP" type="password" required minlength="6" autocomplete="${modo === 'registro' ? 'new-password' : 'current-password'}"></div>
  <button class="btn pri block">${modo === 'registro' ? 'Crear mi usuario' : 'Entrar'}</button></form>
  <p style="text-align:center;margin-top:16px;color:var(--mut);font-size:13px">¿No tienes usuario? Pídeselo al dueño del negocio.</p></div></div>`;
  $('#fL').onsubmit = async e => {
    e.preventDefault(); const b = e.target.querySelector('button'); b.disabled = true; b.textContent = 'Un momento…';
    try { if (modo === 'registro') await store.registro($('#lN').value, $('#lE').value, $('#lP').value); else await store.login($('#lE').value, $('#lP').value); await boot(); }
    catch (err) { loginView(modo, err.message.includes('Invalid login') ? 'Correo o contraseña incorrectos.' : esc(err.message)); }
  };
}

// ---------- render ----------
const TITLES = { compras: ['Compras', 'Facturas y notas de entrega que cargan el inventario'], porpagar: ['Cuentas por pagar', 'Lo que le debes a tus proveedores'], despacho: ['Por despachar', 'Marca cada producto cuando sale del almacén'], ventas: ['Ventas', 'Todas las ventas, con filtros y tickets'], reportes: ['Reportes', 'Ventas y Cashea por período'], tablero: ['Tablero gerencial', 'Lo que pasa en tu negocio, en una mirada'], vender: ['Punto de venta', 'Contado o Cashea, en segundos'], inventario: ['Inventario', 'Existencias, costos y márgenes'], cashea: ['Cuentas por cobrar', 'Crédito propio y Cashea'], caja: ['Caja del día', 'Entradas, gastos y saldo'], clientes: ['Clientes', 'Tu cartera y su historial'], ajustes: ['Ajustes', 'Tasa, comisiones, usuarios y respaldo'] };
function render() {
  if (!db().usuario) return loginView();
  if (!db().usuario.activo) return loginView('entrar', `Hola ${esc(db().usuario.nombre)}, tu usuario está creado. El dueño debe activarlo en Ajustes → Usuarios. <br><br><a href="#" onclick="App.logout();return false" style="color:var(--amber2)">Cerrar sesión</a>`);
  const p = App.page, [t, s] = TITLES[p];
  const nav = NAV.filter(([k]) => puede(k));
  if (!puede(p)) { App.page = nav[0][0]; return render(); }
  $('#app').innerHTML = `<div class="shell"><aside class="side"><div class="brand"><img src="mark.png"><div><b>Muebles La Pascua</b><small>Gerencia</small></div></div>
  <nav class="nav">${nav.map(([k, l, i]) => `<a href="#${k}" class="${k === p ? 'on' : ''}" onclick="App.go('${k}');return false">${ico(i)}${l}</a>`).join('')}</nav>
  <div class="foot">Tasa BCV <b style="color:var(--amber2)">${db().tasa.valor}</b> Bs/$<br><span class="kbd">Ctrl K</span> búsqueda rápida</div></aside>
  <main class="main"><div class="top"><h1>${t}<small>${s}</small></h1><span class="pill hide-m" onclick="App.palette()">🔎 Buscar <span class="kbd">Ctrl K</span></span><div class="cur"><button class="${CUR === 'USD' ? 'on' : ''}" onclick="App.setCur('USD')">$</button><button class="${CUR === 'VES' ? 'on' : ''}" onclick="App.setCur('VES')">Bs</button></div></div>
  <div id="view">${V[p]()}</div></main></div>
  <nav class="dock">${nav.map(([k, l, i]) => `<a href="#${k}" class="${k === p ? 'on' : ''}" onclick="App.go('${k}');return false">${ico(i)}${l}</a>`).join('')}</nav>
  ${p !== 'vender' && puede('vender') ? `<button class="fab" title="Nueva venta" onclick="App.go('vender')">+</button>` : ''}`;
  if (p === 'clientes' && window._qc) { const i = document.querySelector('#qc'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  if (p === 'vender' && window._q) { const i = document.querySelector('#view input'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
}

async function boot() {
  $('#app').innerHTML = '<div class="login"><img src="mark.png" style="width:90px;animation:float 1.5s infinite alternate"></div>';
  await store.session();
  if (db().usuario?.activo) { await store.load(); App.bcv(); store.live(async () => { await store.load(); if (!document.querySelector('.ov,.cmd')) render(); }); }
  const h = location.hash.slice(1); if (TITLES[h]) App.page = h;
  render();
}
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (db().usuario?.activo) App.palette(); } });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
boot();
