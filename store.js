// Capa de datos: Supabase (nube, multiusuario, tiempo real)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export const SB_URL = 'https://thtsdsjddnwzbtsdyzcx.supabase.co';
export const SB_KEY = 'sb_publishable_XIrB0pwkF3Vq-yGvzargeA_q6MG9yJi';
export const sb = createClient(SB_URL, SB_KEY);
export const today = () => new Date().toLocaleDateString('en-CA');
export const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toLocaleDateString('en-CA'); };

const db = { productos: [], clientes: [], ventas: [], gastos: [], perfiles: [], tasa: { valor: 0, fecha: '', fuente: 'BCV' }, config: { comisionCashea: 4 }, usuario: null };
const ok = ({ data, error }) => { if (error) throw new Error(error.message); return data; };

export const store = {
  get db() { return db; },
  async session() {
    const { data } = await sb.auth.getSession();
    if (!data.session) { db.usuario = null; return null; }
    const p = ok(await sb.from('perfiles').select('*').eq('id', data.session.user.id).maybeSingle());
    db.usuario = p ? { id: p.id, nombre: p.nombre, rol: p.rol, activo: p.activo, email: data.session.user.email } : null;
    return db.usuario;
  },
  async login(email, password) { ok(await sb.auth.signInWithPassword({ email, password })); return this.session(); },
  async registro(nombre, email, password) { ok(await sb.auth.signUp({ email, password, options: { data: { nombre } } })); return this.session(); },
  async logout() { await sb.auth.signOut(); db.usuario = null; },
  async load() {
    const [pr, cl, ve, ga, cf, pe] = await Promise.all([
      sb.from('productos').select('*').eq('activo', true).order('nombre'),
      sb.from('clientes').select('*').order('nombre'),
      sb.from('ventas').select('*, venta_items(*)').eq('anulada', false).order('numero'),
      sb.from('gastos').select('*').order('fecha'),
      sb.from('config').select('*').eq('id', 1).single(),
      sb.from('perfiles').select('*').order('creado'),
    ]);
    db.productos = ok(pr).map(p => ({ ...p, min: p.minimo, garantiaMeses: p.garantia_meses }));
    db.clientes = ok(cl);
    db.ventas = ok(ve).map(v => ({ ...v, clienteId: v.cliente_id, items: v.venta_items, netoCashea: +v.neto_cashea, liquidaEstimada: v.liquida_estimada, total: +v.total, inicial: +v.inicial, financiado: +v.financiado, comision: +v.comision }));
    db.gastos = ok(ga).map(g => ({ ...g, monto: +g.monto }));
    const c = ok(cf); db.config = { comisionCashea: +c.comision_cashea, negocio: c.negocio }; db.tasa = { valor: +c.tasa, fecha: c.tasa_fecha, fuente: c.tasa_fuente };
    db.perfiles = ok(pe);
    return db;
  },
  async addVenta(v) {
    const r = ok(await sb.rpc('registrar_venta', { p: { cliente_id: v.clienteId, tipo: v.tipo, metodo: v.metodo, total: v.total, inicial_pct: v.inicialPct, pagos: v.pagos || null, items: v.items.map(i => ({ producto_id: i.productoId, nombre: i.nombre, cant: i.cant, precio: i.precio })) } }));
    await this.load(); return db.ventas.find(x => x.id === r.id) || r;
  },
  async addProducto(p) { ok(await sb.from('productos').insert({ nombre: p.nombre, categoria: p.categoria, icono: p.icono, costo: p.costo, precio: p.precio, stock: p.stock, minimo: p.min, garantia_meses: p.garantiaMeses })); await this.load(); },
  async updProducto(id, ch) { const m = { ...ch }; if ('min' in m) { m.minimo = m.min; delete m.min; } ok(await sb.from('productos').update(m).eq('id', id)); await this.load(); },
  async addCliente(c) { const r = ok(await sb.from('clientes').insert(c).select().single()); await this.load(); return r; },
  async addGasto(g) { ok(await sb.from('gastos').insert({ ...g, usuario_id: db.usuario?.id })); await this.load(); },
  async liquidar(id) { ok(await sb.from('ventas').update({ liquidado: true, fecha_liquidacion: today() }).eq('id', id)); await this.load(); },
  async setTasa(valor, fuente = 'Manual') { ok(await sb.from('config').update({ tasa: +valor, tasa_fecha: today(), tasa_fuente: fuente }).eq('id', 1)); db.tasa = { valor: +valor, fecha: today(), fuente }; },
  async setPerfil(id, ch) { ok(await sb.from('perfiles').update(ch).eq('id', id)); await this.load(); },
  async borrarDemo() { ok(await sb.from('ventas').delete().eq('demo', true)); ok(await sb.from('gastos').delete().eq('demo', true)); ok(await sb.from('productos').delete().eq('demo', true)); ok(await sb.from('clientes').delete().eq('demo', true)); await this.load(); },
  live(cb) { sb.channel('cambios').on('postgres_changes', { event: '*', schema: 'public', table: 'ventas' }, cb).on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, cb).subscribe(); },
};
