import { store, today, daysAgo } from './store.js?v=5';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let CUR = localStorage.getItem('mlp_cur') || 'USD';
let cart = [];
const db = () => store.db;
const rol = () => db().usuario?.rol;
const esJefe = () => ['dueno', 'admin'].includes(rol());

// ---------- formato ----------
const fmt = (usd, cur = CUR) => cur === 'USD'
  ? '$' + (+usd).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : 'Bs ' + (usd * db().tasa.valor).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const both = usd => `${fmt(usd, 'USD')} <small style="color:var(--mut)">· ${fmt(usd, 'VES')}</small>`;
const fdate = d => new Date(d + 'T12:00').toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
const toast = m => { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); };

// ---------- iconos ----------
const I = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  sell: '<path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M6 6L5 3H2"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  cashea: '<path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.8 7 7s2 3 5 3.6 5 1.6 5 3.9-2.2 3.9-5 3.9-5-1.2-5-3.2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.8.8 3 2.6 3.5 5.2"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
};
const ico = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;
const NAV = [['tablero', 'Tablero', 'home'], ['vender', 'Vender', 'sell'], ['inventario', 'Inventario', 'box'], ['cashea', 'Cashea', 'cashea'], ['caja', 'Caja', 'cash'], ['clientes', 'Clientes', 'users'], ['ajustes', 'Ajustes', 'cog']];

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
  const vencido = db().ventas.filter(v => v.tipo === 'cashea' && !v.liquidado && v.liquidaEstimada < today());
  const cashea = vs.filter(v => v.tipo === 'cashea');
  const porProd = {}, porVend = {};
  vs.forEach(v => { (v.items || []).forEach(i => { const p = porProd[i.nombre] ||= { n: 0, ing: 0, gan: 0 }; p.n += i.cant; p.ing += i.precio * i.cant; p.gan += (i.precio - i.costo) * i.cant; }); const k = v.vendedor || '—'; porVend[k] = (porVend[k] || 0) + v.total; });
  const dias = [...Array(n)].map((_, i) => { const d = daysAgo(n - 1 - i); return { d, v: sum(vs.filter(x => x.fecha === d), x => x.total) }; });
  const stockValor = sum(db().productos, p => p.costo * p.stock);
  const bajos = db().productos.filter(p => p.stock <= p.min);
  const vendidos = new Set(db().ventas.filter(v => enRango(v, 45)).flatMap(v => (v.items || []).map(i => i.producto_id || i.productoId)));
  const dormidos = db().productos.filter(p => p.stock > 0 && !vendidos.has(p.id));
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
  return `<div class="grid">
  <div class="card kpi hero c6"><h3>Ventas últimos 30 días <span class="tag ${d >= 0 ? 't-ok' : 't-bad'}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(0)}%</span></h3><div class="v">${fmt(m.ventas)}</div><div class="s">${m.vs.length} ventas · ticket promedio ${fmt(m.ticket)}</div></div>
  <div class="card kpi c3"><div class="glow" style="background:var(--ok)"></div><h3>Utilidad neta</h3><div class="v ${m.utilidad >= 0 ? 'up' : 'down'}">${fmt(m.utilidad)}</div><div class="s">Margen bruto ${(m.margen * 100).toFixed(0)}% · gastos ${fmt(m.gastos)}</div></div>
  <div class="card kpi c3"><div class="glow" style="background:var(--violet)"></div><h3>Cashea te debe</h3><div class="v">${fmt(m.porCobrar)}</div><div class="s">${m.vencido.length ? `<span class="down">${m.vencido.length} atrasadas</span>` : 'Todo al día'}</div></div>
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
  <div class="tiles">${ps.map((p, i) => `<div class="tile" style="animation-delay:${i * 25}ms;${p.stock <= 0 ? 'opacity:.4' : ''}" onclick="App.addCart('${p.id}')"><div class="ic">${p.icono}</div><b>${esc(p.nombre)}</b><small>${esc(p.categoria)} · ${p.stock} disp.</small><div class="row"><span class="pr">${fmt(p.precio)}</span><span class="tag t-am">+ Agregar</span></div></div>`).join('')}</div></div>
  <div class="card c4" style="grid-column:span 4;align-self:start;position:sticky;top:20px"><h3>Venta actual <span>${cart.length}</span></h3>
  ${cart.length ? cart.map(i => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)"><div><b style="font-size:14px">${esc(i.nombre)}</b><br><small style="color:var(--mut)">${fmt(i.precio)}</small></div><div style="display:flex;gap:6px;align-items:center"><button class="pill" onclick="App.qty('${i.productoId}',-1)">−</button>${i.cant}<button class="pill" onclick="App.qty('${i.productoId}',1)">+</button></div></div>`).join('') : '<div class="empty">Toca un producto para agregarlo</div>'}
  <div class="sum"><div class="tot"><span>Total</span><span>${fmt(tot, 'USD')}</span></div><div><span style="color:var(--mut)">En bolívares</span><span>${fmt(tot, 'VES')}</span></div></div>
  <button class="btn pri block" ${cart.length ? '' : 'disabled style="opacity:.4"'} onclick="App.checkout()">Cobrar →</button></div></div>`;
};

V.inventario = () => {
  const cats = [...new Set(db().productos.map(p => p.categoria))];
  return `${esJefe() ? '<div style="margin-bottom:16px"><button class="btn pri" onclick="App.prodForm()">+ Nuevo producto</button></div>' : ''}
  ${cats.map(c => `<h3 style="color:var(--mut);font-size:13px;letter-spacing:1.2px;text-transform:uppercase;margin:18px 0 10px">${esc(c)}</h3><div class="tiles">${db().productos.filter(p => p.categoria === c).map((p, i) => { const pct = Math.min(100, p.stock / Math.max(p.min * 3, 1) * 100); const mg = p.precio ? (p.precio - p.costo) / p.precio * 100 : 0; return `<div class="tile" style="animation-delay:${i * 25}ms" onclick="${esJefe() ? `App.prodForm('${p.id}')` : ''}"><div style="display:flex;justify-content:space-between"><div class="ic">${p.icono}</div>${p.stock <= p.min ? '<span class="tag t-bad" style="height:fit-content">Reponer</span>' : ''}</div><b>${esc(p.nombre)}</b><small>Costo ${fmt(p.costo)} · margen ${mg.toFixed(0)}% · garantía ${p.garantiaMeses || 0}m</small><div class="row"><span class="pr">${fmt(p.precio)}</span><b>${p.stock} <small>uds</small></b></div><div class="bar"><i style="width:${pct}%;${p.stock <= p.min ? 'background:var(--bad)' : ''}"></i></div></div>`; }).join('')}</div>`).join('') || '<div class="empty">Aún no hay productos.</div>'}`;
};

V.cashea = () => {
  const pend = db().ventas.filter(v => v.tipo === 'cashea' && !v.liquidado).sort((a, b) => a.liquidaEstimada.localeCompare(b.liquidaEstimada));
  const liq = db().ventas.filter(v => v.tipo === 'cashea' && v.liquidado).slice(-8).reverse();
  const tot = pend.reduce((a, v) => a + v.netoCashea, 0), venc = pend.filter(v => v.liquidaEstimada < today());
  const cli = id => db().clientes.find(c => c.id === id)?.nombre || '—';
  return `<div class="grid">
  <div class="card kpi hero c4"><h3>Por recibir de Cashea</h3><div class="v">${fmt(tot)}</div><div class="s">${pend.length} ventas pendientes</div></div>
  <div class="card kpi c4"><h3>Atrasado</h3><div class="v ${venc.length ? 'down' : 'up'}">${fmt(venc.reduce((a, v) => a + v.netoCashea, 0))}</div><div class="s">${venc.length} pasaron la fecha estimada</div></div>
  <div class="card kpi c4"><h3>Comisión Cashea</h3><div class="v">${db().config.comisionCashea}%</div><div class="s">Sobre lo financiado · cámbiala en Ajustes</div></div>
  <div class="card c12"><h3>Liquidaciones pendientes</h3><div style="overflow:auto"><table class="tbl"><thead><tr><th>#</th><th>Fecha</th><th>Cliente</th><th>Inicial cobrada</th><th>Financiado</th><th>Neto a recibir</th><th>Estimado</th><th></th></tr></thead><tbody>
  ${pend.map(v => `<tr><td>${v.numero}</td><td>${fdate(v.fecha)}</td><td>${esc(cli(v.clienteId))}</td><td>${fmt(v.inicial)}</td><td>${fmt(v.financiado)}</td><td><b>${fmt(v.netoCashea)}</b></td><td><span class="tag ${v.liquidaEstimada < today() ? 't-bad' : 't-in'}">${fdate(v.liquidaEstimada)}</span></td><td>${rol() !== 'vendedor' ? `<button class="pill" onclick="App.liquidar('${v.id}')">Marcar recibido</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="8" class="empty">Nada pendiente 🎉</td></tr>'}
  </tbody></table></div></div>
  <div class="card c12"><h3>Recibido recientemente</h3><table class="tbl"><tbody>${liq.map(v => `<tr><td>#${v.numero}</td><td>${esc(cli(v.clienteId))}</td><td>${fmt(v.netoCashea)}</td><td>${v.fechaLiquidacion||v.fecha_liquidacion?fdate(v.fecha_liquidacion):''}</td><td><span class="tag t-ok">Recibido</span></td></tr>`).join('')}</tbody></table></div></div>`;
};

V.caja = () => {
  const hoy = db().ventas.filter(v => v.fecha === today());
  const met = {}; hoy.forEach(v => (v.pagos?.length ? v.pagos.map(x => [x.metodo, x.usd]) : [[v.metodo || '—', v.inicial]]).forEach(([k, u]) => met[k] = (met[k] || 0) + +u));
  const ing = hoy.reduce((a, v) => a + v.inicial, 0);
  const gh = db().gastos.filter(g => g.fecha === today()), eg = gh.reduce((a, g) => a + g.monto, 0);
  const gm = db().gastos.slice().reverse().slice(0, 12);
  return `<div class="grid">
  <div class="card kpi hero c4"><h3>Entró hoy a caja</h3><div class="v">${fmt(ing)}</div><div class="s">${hoy.length} ventas (contado + iniciales Cashea)</div></div>
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
  <div class="tiles">${cs.map((c, i) => { const s = stats(c.id); return `<div class="tile" style="animation-delay:${i * 20}ms" onclick="App.clienteForm('${c.id}')"><div style="display:flex;justify-content:space-between;align-items:center"><div class="ic" style="font-size:20px;font-weight:700">${esc(c.nombre.trim()[0] || '?').toUpperCase()}</div>${c.telefono ? `<a class="tag t-ok" target="_blank" href="https://wa.me/${wa(c.telefono)}" onclick="event.stopPropagation()">WhatsApp</a>` : ''}</div><b>${esc(c.nombre)}</b><small>${esc(c.cedula || 'Sin cédula')} · ${esc(c.telefono || 'sin teléfono')}</small><small>📍 ${esc(c.direccion || 'Sin dirección')}</small><div class="row"><span class="pr">${fmt(s.t)}</span><small>${s.n} compras${s.u ? ' · ' + fdate(s.u) : ''}</small></div></div>`; }).join('') || '<div class="empty">No hay clientes con ese filtro.</div>'}</div>`;
};

V.ajustes = () => `<div class="grid">
  <div class="card c6"><h3>Tasa del día</h3><div class="kpi"><div class="v">${db().tasa.valor} <small style="font-size:14px;color:var(--mut)">Bs por $</small></div><div class="s">${esc(db().tasa.fuente)} · ${db().tasa.fecha ? fdate(db().tasa.fecha) : ''}</div></div>
  ${esJefe() ? `<div class="row2" style="margin-top:16px"><input class="in" id="tasaIn" type="number" step="0.01" placeholder="Nueva tasa"><button class="btn gh" onclick="App.setTasa()">Guardar manual</button></div><button class="btn gh block" style="margin-top:10px" onclick="App.bcv(true)">⟳ Traer tasa BCV</button>` : ''}</div>
  ${esJefe() ? `<div class="card c6"><h3>Cashea</h3><div class="fld"><label>Comisión sobre lo financiado (%)</label><input class="in" id="comIn" type="number" step="0.1" value="${db().config.comisionCashea}"></div><button class="btn gh" onclick="App.setCom()">Guardar</button></div>` : ''}
  <div class="card c6"><h3>Respaldo</h3><p style="color:var(--mut);margin-bottom:14px">Descarga toda la base de datos en un Excel, una hoja por tabla.</p><button class="btn pri" onclick="App.respaldar()">⬇ Respaldar ahora</button></div>
  ${rol() === 'dueno' ? `<div class="card c6"><h3>Usuarios</h3>${db().perfiles.map(u => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--line);gap:8px"><span>${esc(u.nombre)} ${u.activo ? '' : '<span class="tag t-am">Pendiente</span>'}</span>${u.id === db().usuario.id ? '<span class="tag t-vi">Dueño (tú)</span>' : `<span style="display:flex;gap:6px"><select class="in" style="padding:6px 8px;width:auto" onchange="App.setRol('${u.id}',this.value)">${['vendedor', 'cajero', 'admin'].map(r => `<option ${u.rol === r ? 'selected' : ''}>${r}</option>`).join('')}</select><button class="pill" onclick="App.toggleUser('${u.id}',${!u.activo})">${u.activo ? 'Bloquear' : 'Activar'}</button></span>`}</div>`).join('')}<p style="color:var(--mut);font-size:12px;margin-top:10px">Tus empleados se registran en la app y aquí los activas.</p>
  <button class="btn gh block" style="margin-top:16px" onclick="App.borrarDemo()">🧹 Borrar datos de demostración</button></div>` : ''}
  <div class="card c6"><h3>Sesión</h3><p style="margin-bottom:12px">${esc(db().usuario.nombre)} · <span class="tag t-in">${rol()}</span></p><button class="btn gh" onclick="App.logout()">Cerrar sesión</button></div></div>`;

// ---------- hojas (formularios) ----------
function sheet(html) { const o = document.createElement('div'); o.className = 'ov'; o.innerHTML = `<div class="sheet">${html}</div>`; o.onclick = e => { if (e.target === o) o.remove(); }; document.body.appendChild(o); return o; }
const closeSheet = () => document.querySelector('.ov')?.remove();

const App = window.App = {
  page: 'tablero',
  go(p, keep) { this.page = p; if (!keep) { window._q = ''; window._qc = ''; } location.hash = p; render(); },
  setCur(c) { CUR = c; localStorage.setItem('mlp_cur', c); render(); },
  addCart(id) { const p = db().productos.find(p => p.id === id); if (!p || p.stock <= 0) return toast('Sin existencia'); const it = cart.find(i => i.productoId === id); if (it) { if (it.cant < p.stock) it.cant++; } else cart.push({ productoId: id, nombre: p.nombre, precio: +p.precio, cant: 1 }); render(); },
  qty(id, d) { const it = cart.find(i => i.productoId === id); it.cant += d; if (it.cant <= 0) cart = cart.filter(i => i !== it); render(); },
  checkout() {
    const tot = cart.reduce((a, i) => a + i.precio * i.cant, 0);
    const st = { tipo: 'contado', pct: 60 }; const METS = ['Pago móvil', 'Efectivo $', 'Efectivo Bs', 'Punto de venta', 'Zelle', 'Binance', 'Transferencia']; let pagos = [{ metodo: 'Pago móvil', moneda: 'Bs', monto: '' }]; let cobrar = 0;
    const o = sheet(`<h2>Cobrar</h2><div class="sub">${cart.length} productos · ${fmt(tot, 'USD')}</div>
    <div class="fld"><label>Cliente</label><input class="in" id="cBus" placeholder="🔎 Buscar por nombre, cédula o teléfono…" autocomplete="off"><input type="hidden" id="cCli"><div id="cRes" style="margin-top:8px"></div></div>
    <div class="fld"><label>Forma de venta</label><div class="seg" id="sTipo"><button data-v="contado" class="on">💵 Contado</button><button data-v="cashea">💳 Cashea</button></div></div>
    <div class="fld" id="fPct" style="display:none"><label>Inicial según el nivel del cliente en Cashea</label><div class="seg" id="sPct">${[60, 50, 40].map(p => `<button data-v="${p}" class="${p === 60 ? 'on' : ''}">${p}%</button>`).join('')}<input class="in" id="pctOtro" type="number" placeholder="Otro %" style="flex:1;min-width:90px"></div></div>
    <div class="fld"><label id="lMet">Método de pago</label><div id="pagos"></div><button class="pill" id="addPago" style="margin-top:8px">+ Otro método</button><div id="pagoMsg" style="margin-top:8px;font-size:13px"></div></div>
    <div class="sum" id="resumen"></div><button class="btn pri block" id="bOk">Confirmar venta</button>`);
    const calc = () => {
      const pct = st.tipo === 'cashea' ? st.pct : 100, ini = tot * pct / 100, fin = tot - ini, com = st.tipo === 'cashea' ? fin * db().config.comisionCashea / 100 : 0;
      cobrar = ini; drawPagos(); o.querySelector('#fPct').style.display = st.tipo === 'cashea' ? '' : 'none';
      o.querySelector('#lMet').textContent = st.tipo === 'cashea' ? 'Método con que paga la inicial' : 'Método de pago';
      o.querySelector('#resumen').innerHTML = `<div><span>Total</span><b>${fmt(tot, 'USD')}</b></div>` + (st.tipo === 'cashea' ? `<div><span>Inicial ${pct}% (cobras hoy)</span><b>${fmt(ini, 'USD')}</b></div><div><span>Financia Cashea</span><span>${fmt(fin, 'USD')}</span></div><div><span>Comisión ${db().config.comisionCashea}%</span><span class="down">−${fmt(com, 'USD')}</span></div><div><span>Cashea te deposita</span><span class="up">${fmt(fin - com, 'USD')}</span></div>` : '') + `<div class="tot"><span>Cobrar ahora</span><span>${fmt(ini, 'USD')}</span></div><div><span style="color:var(--mut)">En bolívares</span><b>${fmt(ini, 'VES')}</b></div>`;
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
        let ps = pagos.filter(x => +x.monto > 0);
        if (pagos.length === 1 && !(+pagos[0].monto > 0)) ps = [{ metodo: pagos[0].metodo, moneda: '$', monto: cobrar }];
        const pag = ps.reduce((a, x) => a + usdDe(x), 0);
        if (pag + 0.01 < cobrar) throw new Error(`faltan ${fmt(cobrar - pag, 'USD')} por cobrar`);
        const lista = ps.map(x => ({ metodo: x.metodo, moneda: x.moneda, monto: +(+x.monto).toFixed(2), usd: +usdDe(x).toFixed(2) }));
        const v = await store.addVenta({ clienteId: o.querySelector('#cCli').value || null, items: cart, total: tot, tipo: st.tipo, inicialPct: st.tipo === 'cashea' ? st.pct : 100, metodo: [...new Set(lista.map(x => x.metodo))].join(' + '), pagos: lista });
        cart = []; closeSheet(); this.recibo(v); render();
      } catch (err) { toast('Error: ' + err.message); e.target.disabled = false; e.target.textContent = 'Confirmar venta'; }
    };
  },
  recibo(v) {
    const cli = db().clientes.find(c => c.id === v.clienteId);
    const txt = `*Muebles La Pascua*\nNota de venta #${v.numero}\n${(v.items || []).map(i => `${i.cant} x ${i.nombre}: $${(+i.precio).toFixed(2)}`).join('\n')}\nTotal: $${(+v.total).toFixed(2)} (Bs ${(v.total * db().tasa.valor).toFixed(2)})${v.tipo === 'cashea' ? `\nInicial pagada: $${(+v.inicial).toFixed(2)}\nResto en cuotas con Cashea` : ''}\n¡Gracias por su compra!`;
    const tel = cli?.telefono ? '58' + cli.telefono.replace(/\D/g, '').replace(/^0/, '') : '';
    sheet(`<div style="text-align:center;padding-top:20px"><div style="font-size:64px;animation:rise .5s">✅</div><h2>Venta #${v.numero} registrada</h2><div class="sub">${v.tipo === 'cashea' ? 'Cashea · inicial cobrada' : 'Contado'}</div></div>
    <div class="sum"><div class="tot"><span>Cobrado</span><span>${fmt(v.inicial, 'USD')}</span></div><div><span style="color:var(--mut)">En bolívares</span><b>${fmt(v.inicial, 'VES')}</b></div></div>
    <a class="btn pri block" target="_blank" href="https://wa.me/${tel}?text=${encodeURIComponent(txt)}">Enviar nota por WhatsApp</a>
    <button class="btn gh block" style="margin-top:10px" onclick="document.querySelector('.ov').remove()">Listo</button>`);
  },
  prodForm(id) {
    const p = db().productos.find(p => p.id === id) || { nombre: '', categoria: 'Electrodomésticos', icono: '📦', costo: '', precio: '', stock: '', min: 2, garantiaMeses: 12 };
    const o = sheet(`<h2>${id ? 'Editar' : 'Nuevo'} producto</h2><div class="sub">Inventario por cantidad, sin seriales</div>
    <div class="row2"><div class="fld"><label>Ícono</label><input class="in" id="pI" value="${p.icono}"></div><div class="fld"><label>Categoría</label><select class="in" id="pC">${['Electrodomésticos', 'Muebles', 'Colchones', 'Tecnología', 'Otros'].map(c => `<option ${c === p.categoria ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div>
    <div class="fld"><label>Nombre</label><input class="in" id="pN" value="${esc(p.nombre)}"></div>
    <div class="row2"><div class="fld"><label>Costo $</label><input class="in" id="pCo" type="number" step="0.01" value="${p.costo}"></div><div class="fld"><label>Precio de venta $</label><input class="in" id="pP" type="number" step="0.01" value="${p.precio}"></div></div>
    <div class="row2"><div class="fld"><label>Existencia</label><input class="in" id="pS" type="number" value="${p.stock}"></div><div class="fld"><label>Stock mínimo</label><input class="in" id="pM" type="number" value="${p.min}"></div></div>
    <div class="fld"><label>Garantía (meses)</label><input class="in" id="pG" type="number" value="${p.garantiaMeses}"></div>
    <button class="btn pri block" id="pOk">Guardar</button>${id ? `<button class="btn gh block" style="margin-top:10px" id="pDel">Retirar del catálogo</button>` : ''}`);
    const g = s => o.querySelector(s).value;
    o.querySelector('#pOk').onclick = async () => { const d = { nombre: g('#pN'), categoria: g('#pC'), icono: g('#pI') || '📦', costo: +g('#pCo'), precio: +g('#pP'), stock: +g('#pS'), min: +g('#pM'), garantia_meses: +g('#pG') }; if (!d.nombre) return toast('Falta el nombre'); try { if (id) await store.updProducto(id, d); else await store.addProducto({ ...d, garantiaMeses: d.garantia_meses }); closeSheet(); toast('Guardado'); render(); } catch (e) { toast(e.message); } };
    if (id) o.querySelector('#pDel').onclick = async () => { await store.updProducto(id, { activo: false }); closeSheet(); render(); };
  },
  clienteForm(id) {
    const c = db().clientes.find(c => c.id === id) || {};
    const o = sheet(`<h2>${id ? 'Editar' : 'Nuevo'} cliente</h2><div class="sub">Para facturas, entregas y seguimiento</div><div class="fld"><label>Nombre completo</label><input class="in" id="cN" value="${esc(c.nombre || '')}"></div><div class="row2"><div class="fld"><label>Cédula / RIF</label><input class="in" id="cC" placeholder="V-" value="${esc(c.cedula || '')}"></div><div class="fld"><label>Teléfono</label><input class="in" id="cT" placeholder="0414-" inputmode="tel" value="${esc(c.telefono || '')}"></div></div><div class="fld"><label>Dirección</label><textarea class="in" id="cD" rows="3" placeholder="Sector, calle, casa, punto de referencia">${esc(c.direccion || '')}</textarea></div><button class="btn pri block" id="cOk">Guardar</button>`);
    o.querySelector('#cOk').onclick = async e => { const g = s => o.querySelector(s).value.trim(); if (!g('#cN')) return toast('Falta el nombre'); e.target.disabled = true; const d = { nombre: g('#cN'), cedula: g('#cC'), telefono: g('#cT'), direccion: g('#cD') }; try { if (id) await store.updCliente(id, d); else await store.addCliente(d); closeSheet(); toast('Cliente guardado'); render(); } catch (err) { toast(err.message); e.target.disabled = false; } };
  },
  gastoForm() {
    const o = sheet(`<h2>Registrar gasto</h2><div class="sub">Sale de la caja de hoy</div><div class="fld"><label>Concepto</label><input class="in" id="gC"></div><div class="row2"><div class="fld"><label>Monto $</label><input class="in" id="gM" type="number" step="0.01"></div><div class="fld"><label>Categoría</label><select class="in" id="gK">${['Fijos', 'Nómina', 'Logística', 'Mercadeo', 'Servicios', 'Otros'].map(c => `<option>${c}</option>`).join('')}</select></div></div><button class="btn pri block" id="gOk">Guardar</button>`);
    o.querySelector('#gOk').onclick = async () => { const g = s => o.querySelector(s).value; if (!g('#gC') || !+g('#gM')) return toast('Completa concepto y monto'); await store.addGasto({ concepto: g('#gC'), monto: +g('#gM'), categoria: g('#gK') }); closeSheet(); render(); };
  },
  async liquidar(id) { await store.liquidar(id); toast('Liquidación marcada como recibida'); render(); },
  async setTasa() { const v = +$('#tasaIn').value; if (v > 0) { await store.setTasa(v); render(); toast('Tasa actualizada'); } },
  async setCom() { const v = +$('#comIn').value; const { sb } = await import('./store.js?v=5'); await sb.from('config').update({ comision_cashea: v }).eq('id', 1); await store.load(); render(); toast('Comisión guardada'); },
  async bcv(force) {
    if (!esJefe()) return; if (!force && db().tasa.fecha === today()) return;
    try { const r = await (await fetch('https://ve.dolarapi.com/v1/dolares/oficial')).json(); if (r.promedio) { await store.setTasa(+r.promedio.toFixed(2), 'BCV'); render(); if (force) toast('Tasa BCV: ' + r.promedio.toFixed(2)); } } catch { if (force) toast('No pude traer la tasa, colócala manual'); }
  },
  async setRol(id, r) { await store.setPerfil(id, { rol: r }); toast('Rol actualizado'); },
  async toggleUser(id, a) { await store.setPerfil(id, { activo: a }); render(); },
  async borrarDemo() { if (!confirm('¿Borrar todos los datos de demostración? Tus datos reales se quedan.')) return; await store.borrarDemo(); render(); toast('Demo borrada'); },
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
  <p style="text-align:center;margin-top:16px;color:var(--mut);font-size:13px">${modo === 'registro' ? '¿Ya tienes usuario? <a href="#" id="sw" style="color:var(--amber2)">Entrar</a>' : '¿Eres nuevo? <a href="#" id="sw" style="color:var(--amber2)">Crear usuario</a>'}</p></div></div>`;
  $('#sw').onclick = e => { e.preventDefault(); loginView(modo === 'registro' ? 'entrar' : 'registro'); };
  $('#fL').onsubmit = async e => {
    e.preventDefault(); const b = e.target.querySelector('button'); b.disabled = true; b.textContent = 'Un momento…';
    try { if (modo === 'registro') await store.registro($('#lN').value, $('#lE').value, $('#lP').value); else await store.login($('#lE').value, $('#lP').value); await boot(); }
    catch (err) { loginView(modo, err.message.includes('Invalid login') ? 'Correo o contraseña incorrectos.' : esc(err.message)); }
  };
}

// ---------- render ----------
const TITLES = { tablero: ['Tablero gerencial', 'Lo que pasa en tu negocio, en una mirada'], vender: ['Punto de venta', 'Contado o Cashea, en segundos'], inventario: ['Inventario', 'Existencias, costos y márgenes'], cashea: ['Cashea', 'Lo que Cashea te debe liquidar'], caja: ['Caja del día', 'Entradas, gastos y saldo'], clientes: ['Clientes', 'Tu cartera y su historial'], ajustes: ['Ajustes', 'Tasa, comisiones, usuarios y respaldo'] };
function render() {
  if (!db().usuario) return loginView();
  if (!db().usuario.activo) return loginView('entrar', `Hola ${esc(db().usuario.nombre)}, tu usuario está creado. El dueño debe activarlo en Ajustes → Usuarios. <br><br><a href="#" onclick="App.logout();return false" style="color:var(--amber2)">Cerrar sesión</a>`);
  const p = App.page, [t, s] = TITLES[p];
  const nav = NAV.filter(([k]) => k !== 'ajustes' || true);
  $('#app').innerHTML = `<div class="shell"><aside class="side"><div class="brand"><img src="mark.png"><div><b>Muebles La Pascua</b><small>Gerencia</small></div></div>
  <nav class="nav">${nav.map(([k, l, i]) => `<a href="#${k}" class="${k === p ? 'on' : ''}" onclick="App.go('${k}');return false">${ico(i)}${l}</a>`).join('')}</nav>
  <div class="foot">Tasa BCV <b style="color:var(--amber2)">${db().tasa.valor}</b> Bs/$<br><span class="kbd">Ctrl K</span> búsqueda rápida</div></aside>
  <main class="main"><div class="top"><h1>${t}<small>${s}</small></h1><span class="pill hide-m" onclick="App.palette()">🔎 Buscar <span class="kbd">Ctrl K</span></span><div class="cur"><button class="${CUR === 'USD' ? 'on' : ''}" onclick="App.setCur('USD')">$</button><button class="${CUR === 'VES' ? 'on' : ''}" onclick="App.setCur('VES')">Bs</button></div></div>
  <div id="view">${V[p]()}</div></main></div>
  <nav class="dock">${NAV.map(([k, l, i]) => `<a href="#${k}" class="${k === p ? 'on' : ''}" onclick="App.go('${k}');return false">${ico(i)}${l}</a>`).join('')}</nav>
  ${p !== 'vender' ? `<button class="fab" title="Nueva venta" onclick="App.go('vender')">+</button>` : ''}`;
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
