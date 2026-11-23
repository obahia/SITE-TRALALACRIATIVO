import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Loader2,
  XCircle,
  FileText,
  Mail,
  MessageCircle,
  Trash2,
  Save,
  CalendarDays,
  AlertCircle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { QUOTE_OCCASION_OPTIONS, PARTY_KITS } from '../../data/occasions';

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo', cls: 'bg-pink-100 text-pink-800' },
  { value: 'em-analise', label: 'Em análise', cls: 'bg-yellow-100 text-yellow-800' },
  { value: 'respondido', label: 'Respondido', cls: 'bg-blue-100 text-blue-800' },
  { value: 'aceite', label: 'Aceite', cls: 'bg-green-100 text-green-800' },
  { value: 'recusado', label: 'Recusado', cls: 'bg-gray-100 text-gray-700' },
];
const STATUS_BY_VALUE = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s]));

const OCCASION_LABEL = Object.fromEntries(QUOTE_OCCASION_OPTIONS.map((o) => [o.value, o.label]));
const KIT_LABEL = Object.fromEntries(PARTY_KITS.map((k) => [k.id, k.name]));

const DELIVERY_LABEL = {
  'envio-ctt': 'Envio CTT',
  'levantamento-leiria': 'Levantamento em Leiria',
  'a-combinar': 'A combinar',
};

// Produção leva 2 a 4 semanas: eventos a menos de 14 dias ficam assinalados.
const URGENT_DAYS = 14;

const occasionLabel = (value) => OCCASION_LABEL[value] || value || '—';
const kitLabel = (value) => (value ? KIT_LABEL[value] || value : '—');

const formatDateTime = (date) =>
  new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

// event_date vem como 'YYYY-MM-DD'; interpretar como data local evita saltos de fuso.
const parseLocalDate = (value) => {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatEventDate = (value) => {
  const date = parseLocalDate(value);
  return date
    ? date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';
};

const daysUntil = (value) => {
  const date = parseLocalDate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date - today) / 86400000);
};

const eventUrgency = (value) => {
  const days = daysUntil(value);
  if (days === null) return { cls: 'text-gray-500', note: null };
  if (days < 0) return { cls: 'text-gray-400', note: 'já passou' };
  if (days < URGENT_DAYS) {
    return {
      cls: 'text-amber-700 font-semibold',
      note: days === 0 ? 'é hoje' : `daqui a ${days} dia${days === 1 ? '' : 's'}`,
    };
  }
  return { cls: 'text-gray-700', note: null };
};

// Normaliza números PT para wa.me: só dígitos, sem 00, prefixo 351 se tiver 9 dígitos.
const toWhatsappNumber = (phone) => {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 9) digits = `351${digits}`;
  return digits.length >= 9 ? digits : null;
};

const buildMailto = (quote) => {
  const occasion = occasionLabel(quote.occasion);
  const firstName = (quote.name || '').trim().split(/\s+/)[0] || '';
  const subject = `Orçamento Tralalá Criativo – ${occasion}`;
  const body = [
    `Olá ${firstName},`,
    '',
    `Recebemos o seu pedido de orçamento para ${occasion.toLowerCase()}${quote.theme ? ` com o tema "${quote.theme}"` : ''}.`,
    '',
    '',
    'Com carinho,',
    'Tralalá Criativo',
  ].join('\n');
  return `mailto:${quote.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const loadQuotes = () =>
  supabase.from('quote_requests').select('*').order('created_at', { ascending: false });

const describeError = (error) => {
  if (!error) return null;
  if (error.code === '42P01' || error.code === 'PGRST205') {
    return 'A tabela de orçamentos ainda não existe. Aplica a migração 020 no Supabase.';
  }
  return 'Não foi possível carregar os pedidos de orçamento.';
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_BY_VALUE[status];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${meta?.cls || 'bg-gray-100 text-gray-700'}`}>
      {meta?.label || status}
    </span>
  );
};

const Field = ({ label, children, full = false }) => (
  <div className={full ? 'col-span-full' : ''}>
    <p className="text-gray-500">{label}</p>
    <div className="font-medium text-gray-800 break-words">{children || '—'}</div>
  </div>
);

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [draftStatus, setDraftStatus] = useState('novo');
  const [draftNotes, setDraftNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [panelMessage, setPanelMessage] = useState(null);

  const applyResult = ({ data, error }) => {
    setQuotes(error ? [] : data || []);
    setLoadError(describeError(error));
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    loadQuotes().then((result) => {
      if (active) applyResult(result);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const refresh = async () => {
    setLoading(true);
    applyResult(await loadQuotes());
  };

  const openQuote = (quote) => {
    setSelected(quote);
    setDraftStatus(quote.status);
    setDraftNotes(quote.admin_notes || '');
    setPanelMessage(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setPanelMessage(null);
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .update({ status: draftStatus, admin_notes: draftNotes.trim() || null })
        .eq('id', selected.id)
        .select()
        .single();
      if (error) throw error;
      setQuotes((prev) => prev.map((q) => (q.id === data.id ? data : q)));
      setSelected(data);
      setPanelMessage({ type: 'ok', text: 'Alterações guardadas.' });
    } catch {
      setPanelMessage({ type: 'error', text: 'Erro ao guardar. Tenta outra vez.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm(`Eliminar o pedido de ${selected.name}? Esta ação não pode ser desfeita.`)) return;
    setDeleting(true);
    setPanelMessage(null);
    try {
      const { error } = await supabase.from('quote_requests').delete().eq('id', selected.id);
      if (error) throw error;
      setQuotes((prev) => prev.filter((q) => q.id !== selected.id));
      setSelected(null);
    } catch {
      setPanelMessage({ type: 'error', text: 'Erro ao eliminar o pedido.' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredQuotes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return quotes.filter((q) => {
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      const matchesSearch =
        !term ||
        [q.name, q.email, q.theme].some((v) => v && v.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [quotes, searchTerm, statusFilter]);

  const newCount = quotes.filter((q) => q.status === 'novo').length;
  const whatsappNumber = selected ? toWhatsappNumber(selected.phone) : null;
  const isDirty = selected && (draftStatus !== selected.status || (draftNotes.trim() || null) !== (selected.admin_notes || null));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="A carregar">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orçamentos</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {newCount > 0 ? `${newCount} pedido${newCount === 1 ? '' : 's'} por responder` : 'Sem pedidos novos'}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <RefreshCw size={15} /> Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
          <input
            type="search"
            placeholder="Pesquisar por nome, email ou tema..."
            aria-label="Pesquisar pedidos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrar por estado"
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
        >
          <option value="all">Todos os estados</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {loadError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <AlertCircle className="text-red-500 shrink-0" size={24} />
          <p className="text-sm text-red-800 flex-1">{loadError}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100"
          >
            Tentar novamente
          </button>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <FileText className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">
            {quotes.length === 0 ? 'Ainda não chegou nenhum pedido de orçamento.' : 'Nenhum pedido corresponde aos filtros.'}
          </p>
        </div>
      ) : (
        <>
          {/* Tabela (desktop) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Recebido</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Cliente</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Ocasião</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Data do evento</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Kit</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Estado</th>
                    <th className="py-4 px-6"><span className="sr-only">Abrir</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotes.map((q) => {
                    const urgency = eventUrgency(q.event_date);
                    return (
                      <tr
                        key={q.id}
                        onClick={() => openQuote(q)}
                        className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(q.created_at)}</td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-800">{q.name}</p>
                          <p className="text-sm text-gray-500">{q.email}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">{occasionLabel(q.occasion)}</td>
                        <td className="py-4 px-6 text-sm whitespace-nowrap">
                          <span className={urgency.cls}>{formatEventDate(q.event_date)}</span>
                          {urgency.note && <span className={`block text-xs ${urgency.cls}`}>{urgency.note}</span>}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-700">{kitLabel(q.kit)}</td>
                        <td className="py-4 px-6"><StatusBadge status={q.status} /></td>
                        <td className="py-4 px-6">
                          <button
                            onClick={(e) => { e.stopPropagation(); openQuote(q); }}
                            aria-label={`Abrir pedido de ${q.name}`}
                            className="p-2 text-gray-500 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cartões (mobile) */}
          <ul className="md:hidden space-y-3">
            {filteredQuotes.map((q) => {
              const urgency = eventUrgency(q.event_date);
              return (
                <li key={q.id}>
                  <button
                    onClick={() => openQuote(q)}
                    className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2 active:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{q.name}</p>
                        <p className="text-xs text-gray-400">{formatDateTime(q.created_at)}</p>
                      </div>
                      <StatusBadge status={q.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                      <span>{occasionLabel(q.occasion)}</span>
                      {q.kit && <span>{kitLabel(q.kit)}</span>}
                      <span className={`flex items-center gap-1 ${urgency.cls}`}>
                        <CalendarDays size={14} aria-hidden="true" />
                        {formatEventDate(q.event_date)}
                        {urgency.note && ` (${urgency.note})`}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Detalhe do pedido */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-detail-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto"
          >
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="min-w-0">
                <h2 id="quote-detail-title" className="text-xl font-bold truncate">{selected.name}</h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                  <StatusBadge status={selected.status} />
                  <span>{formatDateTime(selected.created_at)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Fechar"
                className="p-2 hover:bg-gray-100 rounded-lg shrink-0"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {/* Ações rápidas */}
              <div className="flex flex-wrap gap-2">
                <a
                  href={buildMailto(selected)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Mail size={16} /> Responder por email
                </a>
                {whatsappNumber ? (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                ) : (
                  <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed" title="Sem telefone válido">
                    <MessageCircle size={16} /> WhatsApp
                  </span>
                )}
              </div>

              {/* Contacto */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold mb-3">Contacto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <Field label="Nome">{selected.name}</Field>
                  <Field label="Email">
                    <a href={`mailto:${selected.email}`} className="text-brand-blue hover:underline">{selected.email}</a>
                  </Field>
                  <Field label="Telefone">{selected.phone}</Field>
                  <Field label="Empresa">{selected.company}</Field>
                  <Field label="NIF">{selected.vat_number}</Field>
                  <Field label="Código postal">{selected.postal_code}</Field>
                </div>
              </div>

              {/* Evento */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold mb-3">Evento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <Field label="Ocasião">{occasionLabel(selected.occasion)}</Field>
                  <Field label="Data do evento">
                    {(() => {
                      const urgency = eventUrgency(selected.event_date);
                      return (
                        <span className={urgency.cls}>
                          {formatEventDate(selected.event_date)}
                          {urgency.note && ` (${urgency.note})`}
                        </span>
                      );
                    })()}
                  </Field>
                  <Field label="Convidados">{selected.guests}</Field>
                  <Field label="Tema">{selected.theme}</Field>
                  <Field label="Kit">{selected.kit ? kitLabel(selected.kit) : null}</Field>
                  <Field label="Orçamento previsto">{selected.budget}</Field>
                  <Field label="Entrega">{DELIVERY_LABEL[selected.delivery] || selected.delivery}</Field>
                  <Field label="Produtos" full>
                    {selected.products?.length > 0 && (
                      <ul className="flex flex-wrap gap-2 mt-1">
                        {selected.products.map((p) => (
                          <li key={p} className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs font-normal">{p}</li>
                        ))}
                      </ul>
                    )}
                  </Field>
                </div>
                {eventUrgency(selected.event_date).cls.includes('amber') && (
                  <p className="mt-4 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    Faltam menos de 2 semanas para o evento. A produção costuma levar 2 a 4 semanas.
                  </p>
                )}
              </div>

              {/* Mensagem */}
              <div>
                <h3 className="font-semibold mb-2">Mensagem</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-xl p-4">{selected.message}</p>
              </div>

              {/* Gestão interna */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                <div>
                  <label htmlFor="quote-status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    id="quote-status"
                    value={draftStatus}
                    onChange={(e) => setDraftStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="quote-notes" className="block text-sm font-medium text-gray-700 mb-1">Notas internas</label>
                  <textarea
                    id="quote-notes"
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    rows={4}
                    placeholder="Valor proposto, prazos, o que ficou combinado..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue text-sm"
                  />
                </div>
                {panelMessage && (
                  <p
                    role={panelMessage.type === 'error' ? 'alert' : 'status'}
                    className={`text-sm ${panelMessage.type === 'error' ? 'text-red-600' : 'text-green-700'}`}
                  >
                    {panelMessage.text}
                  </p>
                )}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={deleting || saving}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    Eliminar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || deleting || !isDirty}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-blue text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuotes;
