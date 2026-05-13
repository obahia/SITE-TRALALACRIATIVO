import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ShoppingBag, Package, Users, Euro, ArrowRight, TrendingUp,
  TrendingDown, AlertTriangle, Clock, CheckCircle, XCircle,
  Truck, RefreshCw,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { LoadingSpinner } from '../../components/ui';

const fmt = (v) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(v || 0);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });

const STATUS_META = {
  pendente:  { label: 'Pendente',  color: '#f59e0b', icon: Clock },
  pago:      { label: 'Pago',      color: '#10b981', icon: CheckCircle },
  enviado:   { label: 'Enviado',   color: '#3b82f6', icon: Truck },
  entregue:  { label: 'Entregue', color: '#6366f1', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: '#ef4444', icon: XCircle },
};

const PIE_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#ef4444'];

const KpiCard = ({ icon: Icon, label, value, sub, trend, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {Math.abs(trend).toFixed(1)}% vs mês anterior
      </div>
    )}
  </div>
);

const CustomTooltipRevenue = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-brand-blue font-bold">{fmt(payload[0]?.value)}</p>
      <p className="text-gray-500">{payload[1]?.value} pedidos</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});
  const [revenueChart, setRevenueChart] = useState([]);
  const [statusChart, setStatusChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [
        { data: orders },
        { data: profiles },
        { count: totalProducts },
        { data: orderItems },
        { data: products },
      ] = await Promise.all([
        supabase.from('orders').select('id, total_amount, status, created_at, user_id'),
        supabase.from('profiles').select('id, created_at'),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('order_items').select('name, quantity, price'),
        supabase.from('products').select('id, name, stock_quantity, image_url').eq('is_active', true),
      ]);

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const paid = (orders || []).filter(o => ['pago', 'entregue'].includes(o.status));
      const thisMonthPaid = paid.filter(o => new Date(o.created_at) >= thisMonthStart);
      const lastMonthPaid = paid.filter(
        o => new Date(o.created_at) >= lastMonthStart && new Date(o.created_at) < thisMonthStart
      );

      const totalRevenue = paid.reduce((s, o) => s + (o.total_amount || 0), 0);
      const thisMonthRevenue = thisMonthPaid.reduce((s, o) => s + (o.total_amount || 0), 0);
      const lastMonthRevenue = lastMonthPaid.reduce((s, o) => s + (o.total_amount || 0), 0);
      const revenueTrend = lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : null;

      const thisMonthOrders = (orders || []).filter(o => new Date(o.created_at) >= thisMonthStart);
      const lastMonthOrders = (orders || []).filter(
        o => new Date(o.created_at) >= lastMonthStart && new Date(o.created_at) < thisMonthStart
      );
      const ordersTrend = lastMonthOrders.length > 0
        ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
        : null;

      const avgTicket = paid.length > 0 ? totalRevenue / paid.length : 0;
      const pendingCount = (orders || []).filter(o => o.status === 'pendente').length;

      const newUsersThisMonth = (profiles || []).filter(
        p => p.created_at && new Date(p.created_at) >= thisMonthStart
      ).length;

      setKpis({
        totalRevenue,
        thisMonthRevenue,
        revenueTrend,
        totalOrders: (orders || []).length,
        thisMonthOrders: thisMonthOrders.length,
        ordersTrend,
        avgTicket,
        pendingCount,
        totalUsers: (profiles || []).length,
        newUsersThisMonth,
        totalProducts: totalProducts || 0,
      });

      // Receita dos últimos 30 dias agrupada por dia
      const last30 = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toISOString().split('T')[0];
      });
      const revenueByDay = last30.map(day => {
        const dayOrders = (orders || []).filter(
          o => o.created_at?.startsWith(day) && ['pago', 'entregue'].includes(o.status)
        );
        return {
          day: fmtDate(day),
          receita: dayOrders.reduce((s, o) => s + (o.total_amount || 0), 0),
          pedidos: dayOrders.length,
        };
      });
      setRevenueChart(revenueByDay);

      // Distribuição por status
      const statusMap = {};
      (orders || []).forEach(o => {
        statusMap[o.status] = (statusMap[o.status] || 0) + 1;
      });
      setStatusChart(
        Object.entries(statusMap).map(([status, count]) => ({
          name: STATUS_META[status]?.label || status,
          value: count,
          color: STATUS_META[status]?.color || '#94a3b8',
        }))
      );

      // Top 5 produtos mais vendidos
      const productSales = {};
      (orderItems || []).forEach(item => {
        if (!productSales[item.name]) productSales[item.name] = { qty: 0, revenue: 0 };
        productSales[item.name].qty += item.quantity || 1;
        productSales[item.name].revenue += (item.price || 0) * (item.quantity || 1);
      });
      setTopProducts(
        Object.entries(productSales)
          .sort((a, b) => b[1].qty - a[1].qty)
          .slice(0, 5)
          .map(([name, data]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, ...data }))
      );

      // Pedidos recentes com perfil
      const { data: recent } = await supabase
        .from('orders')
        .select('*, profiles(first_name, last_name, email)')
        .order('created_at', { ascending: false })
        .limit(7);
      setRecentOrders(recent || []);

      // Alertas de stock
      setStockAlerts(
        (products || [])
          .filter(p => p.stock_quantity !== null && p.stock_quantity <= 5)
          .sort((a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0))
      );
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchAll(); }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <RefreshCw size={15} /> Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          icon={Euro}
          label="Receita Total"
          value={fmt(kpis.totalRevenue)}
          sub={`Este mês: ${fmt(kpis.thisMonthRevenue)}`}
          trend={kpis.revenueTrend}
          color="bg-emerald-500"
        />
        <KpiCard
          icon={ShoppingBag}
          label="Pedidos"
          value={kpis.totalOrders}
          sub={`Este mês: ${kpis.thisMonthOrders}`}
          trend={kpis.ordersTrend}
          color="bg-blue-500"
        />
        <KpiCard
          icon={TrendingUp}
          label="Ticket Médio"
          value={fmt(kpis.avgTicket)}
          sub="pedidos pagos"
          color="bg-violet-500"
        />
        <KpiCard
          icon={Clock}
          label="Pendentes"
          value={kpis.pendingCount}
          sub="a aguardar pagamento"
          color={kpis.pendingCount > 0 ? 'bg-amber-500' : 'bg-gray-400'}
        />
        <KpiCard
          icon={Users}
          label="Utilizadores"
          value={kpis.totalUsers}
          sub={`+${kpis.newUsersThisMonth} este mês`}
          color="bg-pink-500"
        />
        <KpiCard
          icon={Package}
          label="Produtos Ativos"
          value={kpis.totalProducts}
          sub={stockAlerts.length > 0 ? `${stockAlerts.length} com stock baixo` : 'stock ok'}
          color="bg-orange-500"
        />
      </div>

      {/* Alertas de stock */}
      {stockAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600" />
            <h3 className="font-semibold text-amber-800">Alertas de Stock</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {stockAlerts.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2">
                {p.image_url && (
                  <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{p.name}</p>
                  <p className={`text-xs font-bold ${p.stock_quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {p.stock_quantity === 0 ? 'Esgotado' : `${p.stock_quantity} restantes`}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/admin/produtos" className="text-xs text-amber-700 font-medium hover:underline mt-2 inline-block">
            Gerir produtos →
          </Link>
        </div>
      )}

      {/* Gráfico Receita + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área — Receita 30 dias */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">Receita — últimos 30 dias</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChart} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={v => `${v}€`} width={45} />
              <Tooltip content={<CustomTooltipRevenue />} />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut — Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-800 mb-4">Pedidos por Status</h2>
          {statusChart.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">Sem pedidos</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChart.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + ' pedidos', n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {statusChart.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-gray-600">{s.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Produtos + Pedidos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Produtos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Top Produtos Vendidos</h2>
            <Link to="/admin/produtos" className="text-xs text-brand-blue hover:underline">Ver todos</Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">Sem dados de vendas</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} width={90} />
                <Tooltip formatter={(v) => [v + ' un.', 'Vendidos']} />
                <Bar dataKey="qty" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pedidos Recentes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Pedidos Recentes</h2>
            <Link to="/admin/pedidos" className="flex items-center gap-1 text-xs text-brand-blue hover:underline">
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">Nenhum pedido</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => {
                const meta = STATUS_META[order.status] || {};
                return (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {order.profiles?.first_name || order.profiles?.email?.split('@')[0] || 'Cliente'}
                        {order.profiles?.last_name ? ` ${order.profiles.last_name}` : ''}
                      </p>
                      <p className="text-xs text-gray-400">
                        #{order.id.slice(0, 8)} · {fmtDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <span className="text-sm font-bold text-gray-800">{fmt(order.total_amount)}</span>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: `${meta.color}20`, color: meta.color }}
                      >
                        {meta.label || order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
