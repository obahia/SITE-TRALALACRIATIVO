import React, { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Package,
  Truck,
  XCircle,
  Loader2,
  FileText,
  MapPin,
  Tag,
  ExternalLink,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  // Shippo state
  const [shippoLoading, setShippoLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [buyingLabel, setBuyingLabel] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [parcel, setParcel] = useState({ length: '20', width: '15', height: '10', weight: '0.5' });
  const [showParcelEdit, setShowParcelEdit] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, profiles(first_name, last_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (_error) {
      // handled by state
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      if (error) throw error;
      setOrderItems(data || []);
    } catch (_error) {
      // handled
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Erro ao atualizar status', error);
    }
  };

  const openOrderDetails = async (order) => {
    setSelectedOrder(order);
    setShipment(null);
    setSelectedRate(null);
    setTrackingInfo(null);
    await fetchOrderItems(order.id);
  };

  // --- Shippo helpers ---

  const callShippo = async (body) => {
    const { data, error } = await supabase.functions.invoke('shippo', { body });
    if (error) throw new Error(error.message || 'Erro Shippo');
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const getRates = async () => {
    if (!selectedOrder?.shipping_address) return;
    setShippoLoading(true);
    setShipment(null);
    setSelectedRate(null);
    try {
      const { shipment: s } = await callShippo({
        action: 'get_rates',
        orderId: selectedOrder.id,
        parcel: {
          length: parcel.length,
          width: parcel.width,
          height: parcel.height,
          distance_unit: 'cm',
          weight: parcel.weight,
          mass_unit: 'kg',
        },
      });
      setShipment(s);
    } catch (err) {
      alert(`Erro ao obter tarifas: ${err.message}`);
    } finally {
      setShippoLoading(false);
    }
  };

  const buyLabel = async () => {
    if (!selectedRate) return;
    setBuyingLabel(true);
    try {
      const { transaction } = await callShippo({
        action: 'buy_label',
        orderId: selectedOrder.id,
        rateId: selectedRate.object_id,
      });

      const updated = {
        ...selectedOrder,
        tracking_code: transaction.tracking_number,
        tracking_url: transaction.tracking_url_provider,
        label_url: transaction.label_url,
        shippo_transaction_id: transaction.object_id,
        status: 'enviado',
      };
      setSelectedOrder(updated);
      setOrders(orders.map(o => o.id === updated.id ? updated : o));
      setShipment(null);
      setSelectedRate(null);
    } catch (err) {
      alert(`Erro ao comprar etiqueta: ${err.message}`);
    } finally {
      setBuyingLabel(false);
    }
  };

  const loadTracking = async () => {
    setTrackingLoading(true);
    setTrackingInfo(null);
    try {
      const { tracking } = await callShippo({
        action: 'track',
        orderId: selectedOrder.id,
      });
      setTrackingInfo(tracking);
    } catch (err) {
      alert(`Erro ao rastrear: ${err.message}`);
    } finally {
      setTrackingLoading(false);
    }
  };

  // --- Formatters ---

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getStatusColor = (status) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      pago: 'bg-green-100 text-green-800',
      enviado: 'bg-blue-100 text-blue-800',
      entregue: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  const getTrackingStatusColor = (status) => {
    if (!status) return 'text-gray-500';
    const s = status.toLowerCase();
    if (s.includes('delivered')) return 'text-green-600';
    if (s.includes('transit') || s.includes('in_transit')) return 'text-blue-600';
    if (s.includes('failure') || s.includes('returned')) return 'text-red-600';
    return 'text-yellow-600';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.profiles?.first_name} ${order.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['pendente', 'pago', 'enviado', 'entregue', 'cancelado'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Gerenciar Pedidos</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por ID, email ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
        >
          <option value="all">Todos os status</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{capitalize(s)}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Cliente</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Data</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Total</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Envio</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-mono">#{order.id.slice(0, 8)}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-800">
                          {order.profiles?.first_name} {order.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{order.profiles?.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="py-4 px-6 font-bold text-gray-800">{formatCurrency(order.total_amount)}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {capitalize(order.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {order.label_url ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle size={14} /> Etiqueta criada
                        </span>
                      ) : order.shipping_address ? (
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                          <MapPin size={14} /> Morada disponível
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="p-2 text-gray-500 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold">Pedido #{selectedOrder.id.slice(0, 8)}</h2>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {capitalize(selectedOrder.status)}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText size={18} /> Dados do Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nome</p>
                    <p className="font-medium">
                      {selectedOrder.profiles?.first_name} {selectedOrder.profiles?.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrder.profiles?.email}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                    <MapPin size={18} /> Morada de Envio
                  </h3>
                  <div className="text-sm text-blue-900 space-y-1">
                    <p className="font-medium">{selectedOrder.shipping_address.name}</p>
                    <p>{selectedOrder.shipping_address.line1}</p>
                    {selectedOrder.shipping_address.line2 && <p>{selectedOrder.shipping_address.line2}</p>}
                    <p>
                      {selectedOrder.shipping_address.postal_code} {selectedOrder.shipping_address.city}
                      {selectedOrder.shipping_address.state ? `, ${selectedOrder.shipping_address.state}` : ''}
                    </p>
                    <p className="font-medium">{selectedOrder.shipping_address.country}</p>
                  </div>
                </div>
              )}

              {!selectedOrder.shipping_address && (
                <div className="bg-yellow-50 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-yellow-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Sem morada de envio</p>
                    <p className="text-xs mt-1 text-yellow-700">
                      A morada é recolhida automaticamente pelo Stripe no checkout. Pedidos anteriores à integração de envio não a têm.
                    </p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package size={18} /> Itens do Pedido
                </h3>
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                          {item.customization?.instructions && (
                            <p className="text-xs text-gray-500 italic mt-1">
                              "{item.customization.instructions}"
                            </p>
                          )}
                        </div>
                        <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-brand-blue">
                    {formatCurrency(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Shippo Section */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 flex items-center gap-2">
                  <Truck size={18} className="text-brand-blue" />
                  <h3 className="font-semibold">Envio com Shippo</h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Label already bought */}
                  {selectedOrder.label_url && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-green-700 font-semibold mb-3">
                        <CheckCircle size={18} /> Etiqueta de envio criada
                      </div>
                      <div className="space-y-2 text-sm">
                        {selectedOrder.tracking_code && (
                          <div className="flex items-center gap-2">
                            <Tag size={14} className="text-gray-400" />
                            <span className="font-mono font-medium">{selectedOrder.tracking_code}</span>
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <a
                            href={selectedOrder.label_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            <Download size={16} /> Descarregar Etiqueta
                          </a>
                          {selectedOrder.tracking_url && (
                            <a
                              href={selectedOrder.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                              <ExternalLink size={16} /> Ver Rastreio
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tracking live status */}
                  {selectedOrder.tracking_code && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Estado do Rastreio (Shippo)</p>
                        <button
                          onClick={loadTracking}
                          disabled={trackingLoading}
                          className="flex items-center gap-1 text-xs text-brand-blue hover:underline"
                        >
                          {trackingLoading
                            ? <Loader2 size={12} className="animate-spin" />
                            : <RefreshCw size={12} />}
                          Atualizar
                        </button>
                      </div>
                      {trackingInfo && (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2">
                          <p className={`font-semibold ${getTrackingStatusColor(trackingInfo.tracking_status?.status)}`}>
                            {trackingInfo.tracking_status?.status_details || trackingInfo.tracking_status?.status || 'Sem informação'}
                          </p>
                          {trackingInfo.tracking_status?.location?.city && (
                            <p className="text-gray-500 text-xs">
                              {trackingInfo.tracking_status.location.city}, {trackingInfo.tracking_status.location.country}
                            </p>
                          )}
                          {trackingInfo.tracking_history?.slice(0, 4).map((event, i) => (
                            <div key={i} className="text-xs text-gray-500 border-t border-gray-100 pt-2">
                              <span className="font-medium text-gray-700">{event.status_details}</span>
                              {event.location?.city && ` — ${event.location.city}`}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Create label flow */}
                  {!selectedOrder.label_url && selectedOrder.shipping_address && (
                    <>
                      {/* Parcel dimensions */}
                      <div>
                        <button
                          onClick={() => setShowParcelEdit(!showParcelEdit)}
                          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          <ChevronDown size={16} className={`transition-transform ${showParcelEdit ? 'rotate-180' : ''}`} />
                          Dimensões da embalagem
                        </button>
                        {showParcelEdit && (
                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            {[
                              { label: 'Comprimento (cm)', key: 'length' },
                              { label: 'Largura (cm)', key: 'width' },
                              { label: 'Altura (cm)', key: 'height' },
                              { label: 'Peso (kg)', key: 'weight' },
                            ].map(({ label, key }) => (
                              <div key={key}>
                                <label className="block text-xs text-gray-500 mb-1">{label}</label>
                                <input
                                  type="number"
                                  value={parcel[key]}
                                  onChange={(e) => setParcel({ ...parcel, [key]: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
                                  min="0"
                                  step="0.1"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={getRates}
                        disabled={shippoLoading}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-blue text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {shippoLoading
                          ? <><Loader2 size={16} className="animate-spin" /> A obter tarifas...</>
                          : <><Truck size={16} /> Obter Tarifas de Envio</>}
                      </button>

                      {/* Rates list */}
                      {shipment?.rates && shipment.rates.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Escolher tarifa:</p>
                          {shipment.rates
                            .filter(r => r.available)
                            .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
                            .map((rate) => (
                              <button
                                key={rate.object_id}
                                onClick={() => setSelectedRate(rate)}
                                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                                  selectedRate?.object_id === rate.object_id
                                    ? 'border-brand-blue bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-sm">{rate.provider} — {rate.servicelevel?.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {rate.estimated_days
                                        ? `${rate.estimated_days} dia${rate.estimated_days !== 1 ? 's' : ''} úteis`
                                        : 'Prazo não disponível'}
                                    </p>
                                  </div>
                                  <span className="font-bold text-brand-blue text-lg">
                                    {rate.amount} {rate.currency}
                                  </span>
                                </div>
                              </button>
                            ))}

                          {selectedRate && (
                            <button
                              onClick={buyLabel}
                              disabled={buyingLabel}
                              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 mt-2"
                            >
                              {buyingLabel
                                ? <><Loader2 size={16} className="animate-spin" /> A comprar etiqueta...</>
                                : <><Download size={16} /> Comprar Etiqueta — {selectedRate.amount} {selectedRate.currency}</>}
                            </button>
                          )}
                        </div>
                      )}

                      {shipment?.rates?.length === 0 && (
                        <p className="text-sm text-yellow-700 bg-yellow-50 rounded-lg p-3">
                          Nenhuma tarifa disponível para este destino.
                        </p>
                      )}
                    </>
                  )}

                  {!selectedOrder.shipping_address && !selectedOrder.label_url && (
                    <p className="text-sm text-gray-500">
                      Não é possível criar etiqueta sem morada de envio.
                    </p>
                  )}
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="font-semibold mb-3">Atualizar Status</h3>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      disabled={selectedOrder.status === status}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        selectedOrder.status === status
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : `${getStatusColor(status)} hover:opacity-80`
                      }`}
                    >
                      {capitalize(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
