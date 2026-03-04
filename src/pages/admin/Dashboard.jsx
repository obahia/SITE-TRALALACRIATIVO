import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Users, Euro, ArrowRight } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { StatCard, LoadingSpinner } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_COLORS, DEFAULT_STATUS_COLOR } from '../../constants';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch orders for stats
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, status, created_at');

        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch users count (from auth)
        const { data: users } = await supabase
          .from('profiles')
          .select('id');

        // Calculate stats
        const totalSales = orders
          ?.filter(o => o.status === 'pago' || o.status === 'entregue')
          .reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

        const totalOrders = orders?.length || 0;

        setStats({
          totalSales,
          totalOrders,
          totalProducts: productsCount || 0,
          totalUsers: users?.length || 0,
        });

        // Fetch recent orders with user info
        const { data: recentData } = await supabase
          .from('orders')
          .select('*, profiles(first_name, last_name, email)')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders(recentData || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatusColor = (status) => {
    return ORDER_STATUS_COLORS[status] || DEFAULT_STATUS_COLOR;
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo ao painel de administração</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Euro}
          label="Vendas Totais"
          value={formatCurrency(stats.totalSales)}
          color="bg-green-500"
        />
        <StatCard 
          icon={ShoppingBag}
          label="Pedidos"
          value={stats.totalOrders}
          color="bg-blue-500"
        />
        <StatCard 
          icon={Package}
          label="Produtos"
          value={stats.totalProducts}
          color="bg-purple-500"
        />
        <StatCard 
          icon={Users}
          label="Utilizadores"
          value={stats.totalUsers}
          color="bg-pink-500"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Pedidos Recentes</h2>
          <Link 
            to="/admin/pedidos" 
            className="flex items-center gap-1 text-brand-blue font-medium text-sm hover:underline"
          >
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhum pedido encontrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Data</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 text-sm">
                      {order.profiles?.first_name} {order.profiles?.last_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
