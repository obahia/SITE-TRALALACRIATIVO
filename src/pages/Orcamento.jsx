import React, { useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Check, AlertTriangle, MessageCircle, Mail, Phone } from 'lucide-react';

import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { QUOTE_OCCASION_OPTIONS, PARTY_KITS, OCCASION_BY_SLUG, CONTACT } from '../data/occasions';
import { CONTAINER_CLASS } from '../constants';
import { isValidEmail } from '../utils/validation';
import { logger } from '../utils/logger';

const PRODUCT_INTERESTS = [
  'Caixinhas e tubetes',
  'Topo de bolo e docinhos',
  'Convites',
  'Lembranças em MDF',
  'Rótulos e autocolantes',
  'Display ou placard',
  'Kit de decoração',
  'Brindes com logótipo',
  'Presente personalizado',
];

const BUDGETS = ['Até 100 €', '100 € a 250 €', '250 € a 500 €', 'Mais de 500 €', 'Ainda não sei'];

const DELIVERY = [
  { value: 'envio-ctt', label: 'Envio por CTT' },
  { value: 'levantamento-leiria', label: 'Levantamento em Leiria' },
  { value: 'a-combinar', label: 'A combinar' },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const daysUntil = (iso) => {
  if (!iso) return null;
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date(`${todayISO()}T00:00:00`);
  return Math.round((target - today) / 86400000);
};

const inputClass =
  'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 ' +
  'focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 transition';

const Label = ({ htmlFor, children, optional }) => (
  <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-800 mb-1.5">
    {children}
    {optional && <span className="font-medium text-gray-500"> (opcional)</span>}
  </label>
);

const Orcamento = () => {
  const uid = useId();
  const { user } = useAuth();
  const [params] = useSearchParams();

  const initialKit = PARTY_KITS.find((k) => k.id === params.get('kit'));
  const initialOccasion = OCCASION_BY_SLUG[params.get('ocasiao')] ? params.get('ocasiao') : (initialKit ? 'festas-infantis' : '');
  const initialProduct = params.get('produto');

  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    occasion: initialOccasion,
    event_date: '',
    guests: '',
    theme: '',
    products: initialKit ? ['Kit de decoração'] : [],
    kit: initialKit?.id || '',
    budget: '',
    delivery: '',
    postal_code: '',
    company: '',
    vat_number: '',
    message: initialProduct ? `Tenho interesse em: ${initialProduct.slice(0, 120)}.\n` : '',
    website: '', // honeypot: pessoas não veem este campo
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const toggleProduct = (item) => {
    setForm((f) => ({
      ...f,
      products: f.products.includes(item) ? f.products.filter((p) => p !== item) : [...f.products, item],
    }));
  };

  const days = daysUntil(form.event_date);
  const tightDeadline = days !== null && days >= 0 && days < 14;
  const isCompany = form.occasion === 'empresas';

  const whatsappText = useMemo(() => {
    const occasionLabel = QUOTE_OCCASION_OPTIONS.find((o) => o.value === form.occasion)?.label || '';
    return encodeURIComponent(
      `Olá! Acabei de pedir um orçamento no site (${occasionLabel}${form.event_date ? `, ${form.event_date}` : ''}). Nome: ${form.name}.`
    );
  }, [form.occasion, form.event_date, form.name]);

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Escreva o seu nome.';
    if (!isValidEmail(form.email.trim())) e.email = 'Escreva um email válido para lhe respondermos.';
    if (!form.occasion) e.occasion = 'Escolha a ocasião.';
    if (form.event_date && days < 0) e.event_date = 'A data já passou.';
    if (form.guests && (!/^\d+$/.test(form.guests) || Number(form.guests) < 1 || Number(form.guests) > 5000)) {
      e.guests = 'Indique um número entre 1 e 5000.';
    }
    if (form.message.trim().length < 5) e.message = 'Conte-nos um pouco do que imagina.';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (form.website) return; // bot

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      const firstKey = Object.keys(found)[0];
      document.getElementById(`${uid}-${firstKey}`)?.focus();
      return;
    }

    setStatus('sending');
    const payload = {
      user_id: user?.id ?? null,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      occasion: form.occasion,
      event_date: form.event_date || null,
      guests: form.guests ? Number(form.guests) : null,
      theme: form.theme.trim() || null,
      products: form.products,
      kit: form.kit || null,
      budget: form.budget || null,
      delivery: form.delivery || null,
      postal_code: form.postal_code.trim() || null,
      company: isCompany ? form.company.trim() || null : null,
      vat_number: isCompany ? form.vat_number.trim() || null : null,
      message: form.message.trim(),
    };

    // Sem .select(): visitantes não têm permissão de leitura na tabela.
    const { error } = await supabase.from('quote_requests').insert(payload);
    if (error) {
      logger.error('Quote request failed', { code: error.code, error: error.message });
      setStatus('error');
      return;
    }
    setStatus('sent');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (status === 'sent') {
    return (
      <div className={`${CONTAINER_CLASS} py-16 md:py-24`}>
        <div className="max-w-xl mx-auto text-center" aria-live="polite">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-6">
            <Check size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Pedido recebido</h1>
          <p className="mt-4 text-lg text-gray-700">
            Obrigado, {form.name.split(' ')[0]}. Vamos analisar e responder para <strong>{form.email}</strong> com ideias e
            preços. Se tiver pressa, fale connosco pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#1f9e55] text-white rounded-2xl h-13 px-7 py-3.5 font-bold hover:brightness-110 transition"
            >
              <MessageCircle size={20} /> Falar no WhatsApp
            </a>
            <Link to="/produtos" className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 font-bold text-gray-900 bg-white border-2 border-gray-200 hover:border-gray-400 transition-colors">
              Continuar na loja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CONTAINER_CLASS} py-10 md:py-16`}>
      <div className="grid lg:grid-cols-[1fr_20rem] gap-10 lg:gap-16 items-start">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-[-0.02em] text-balance">Pedir orçamento</h1>
          <p className="mt-4 text-lg text-gray-700">
            Para kits de decoração, casamentos, batizados, empresas e encomendas grandes. Quanto mais nos contar, mais certo
            sai o orçamento.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-10">
            {/* honeypot */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor={`${uid}-website`}>Website</label>
              <input id={`${uid}-website`} tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
            </div>

            <fieldset className="space-y-5">
              <legend className="text-xl font-bold text-gray-900 mb-4">A festa</legend>

              <div>
                <p id={`${uid}-occasion-label`} className="block text-sm font-bold text-gray-800 mb-1.5">Ocasião</p>
                <div id={`${uid}-occasion`} tabIndex={-1} role="radiogroup" aria-labelledby={`${uid}-occasion-label`} aria-describedby={errors.occasion ? `${uid}-occasion-err` : undefined} className="flex flex-wrap gap-2">
                  {QUOTE_OCCASION_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={form.occasion === o.value}
                      onClick={() => { setForm((f) => ({ ...f, occasion: o.value })); setErrors((er) => ({ ...er, occasion: undefined })); }}
                      className={`px-4 py-2.5 rounded-full border-2 font-semibold transition-colors cursor-pointer ${
                        form.occasion === o.value
                          ? 'bg-brand-blue border-brand-blue text-white'
                          : 'bg-white border-gray-200 text-gray-800 hover:border-brand-blue'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {errors.occasion && <p id={`${uid}-occasion-err`} className="mt-1.5 text-sm font-semibold text-red-700">{errors.occasion}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor={`${uid}-event_date`} optional>Data do evento</Label>
                  <input id={`${uid}-event_date`} type="date" min={todayISO()} className={inputClass} value={form.event_date} onChange={set('event_date')} aria-invalid={!!errors.event_date} />
                  {errors.event_date && <p className="mt-1.5 text-sm font-semibold text-red-700">{errors.event_date}</p>}
                </div>
                <div>
                  <Label htmlFor={`${uid}-guests`} optional>Número de convidados</Label>
                  <input id={`${uid}-guests`} type="text" inputMode="numeric" className={inputClass} value={form.guests} onChange={set('guests')} placeholder="ex.: 40" aria-invalid={!!errors.guests} />
                  {errors.guests && <p className="mt-1.5 text-sm font-semibold text-red-700">{errors.guests}</p>}
                </div>
              </div>

              {tightDeadline && (
                <p className="flex gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                  Faltam {days} {days === 1 ? 'dia' : 'dias'}. Normalmente pedimos 2 a 4 semanas; envie na mesma e dizemos-lhe já se conseguimos.
                </p>
              )}

              <div>
                <Label htmlFor={`${uid}-theme`} optional>Tema e cores</Label>
                <input id={`${uid}-theme`} type="text" className={inputClass} value={form.theme} onChange={set('theme')} placeholder="ex.: Safari em tons de verde, nome Leonor, 3 anos" maxLength={200} />
              </div>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="text-xl font-bold text-gray-900 mb-4">O que precisa</legend>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_INTERESTS.map((item) => {
                  const checked = form.products.includes(item);
                  return (
                    <label
                      key={item}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 font-semibold cursor-pointer transition-colors focus-within:ring-4 focus-within:ring-brand-blue/30 ${
                        checked ? 'bg-brand-pink/10 border-brand-pink text-brand-pink' : 'bg-white border-gray-200 text-gray-800 hover:border-brand-pink/60'
                      }`}
                    >
                      <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleProduct(item)} />
                      {checked && <Check size={16} aria-hidden="true" />}
                      {item}
                    </label>
                  );
                })}
              </div>

              {form.products.includes('Kit de decoração') && (
                <div>
                  <Label htmlFor={`${uid}-kit`} optional>Kit</Label>
                  <select id={`${uid}-kit`} className={inputClass} value={form.kit} onChange={set('kit')}>
                    <option value="">Ainda não sei</option>
                    {PARTY_KITS.map((k) => (
                      <option key={k.id} value={k.id}>{k.name} ({k.price} €)</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor={`${uid}-budget`} optional>Orçamento previsto</Label>
                  <select id={`${uid}-budget`} className={inputClass} value={form.budget} onChange={set('budget')}>
                    <option value="">Escolher</option>
                    {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor={`${uid}-delivery`} optional>Entrega</Label>
                  <select id={`${uid}-delivery`} className={inputClass} value={form.delivery} onChange={set('delivery')}>
                    <option value="">Escolher</option>
                    {DELIVERY.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor={`${uid}-message`}>Descreva o que imagina</Label>
                <textarea
                  id={`${uid}-message`}
                  rows={5}
                  maxLength={4000}
                  className={`${inputClass} resize-y leading-relaxed`}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Quantidades, ideias, inspirações do Instagram, o que for útil."
                  aria-invalid={!!errors.message}
                />
                {errors.message && <p className="mt-1.5 text-sm font-semibold text-red-700">{errors.message}</p>}
              </div>
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="text-xl font-bold text-gray-900 mb-4">Os seus contactos</legend>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor={`${uid}-name`}>Nome</Label>
                  <input id={`${uid}-name`} type="text" autoComplete="name" className={inputClass} value={form.name} onChange={set('name')} maxLength={120} aria-invalid={!!errors.name} />
                  {errors.name && <p className="mt-1.5 text-sm font-semibold text-red-700">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor={`${uid}-email`}>Email</Label>
                  <input id={`${uid}-email`} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" className={inputClass} value={form.email} onChange={set('email')} maxLength={200} aria-invalid={!!errors.email} />
                  {errors.email && <p className="mt-1.5 text-sm font-semibold text-red-700">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor={`${uid}-phone`} optional>Telemóvel / WhatsApp</Label>
                  <input id={`${uid}-phone`} type="tel" autoComplete="tel" className={inputClass} value={form.phone} onChange={set('phone')} maxLength={30} />
                </div>
                <div>
                  <Label htmlFor={`${uid}-postal_code`} optional>Código postal</Label>
                  <input id={`${uid}-postal_code`} type="text" autoComplete="postal-code" className={inputClass} value={form.postal_code} onChange={set('postal_code')} placeholder="2400-000" maxLength={12} />
                </div>
                {isCompany && (
                  <>
                    <div>
                      <Label htmlFor={`${uid}-company`} optional>Empresa</Label>
                      <input id={`${uid}-company`} type="text" autoComplete="organization" className={inputClass} value={form.company} onChange={set('company')} maxLength={160} />
                    </div>
                    <div>
                      <Label htmlFor={`${uid}-vat_number`} optional>NIF para a fatura</Label>
                      <input id={`${uid}-vat_number`} type="text" inputMode="numeric" className={inputClass} value={form.vat_number} onChange={set('vat_number')} maxLength={20} />
                    </div>
                  </>
                )}
              </div>
            </fieldset>

            {status === 'error' && (
              <p className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 font-semibold" aria-live="polite">
                Não conseguimos enviar o pedido. Tente de novo ou escreva-nos para {CONTACT.email}.
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center justify-center gap-2 bg-brand-pink text-white rounded-2xl h-14 px-10 text-lg font-bold hover:brightness-110 transition disabled:opacity-70 cursor-pointer"
              >
                {status === 'sending' ? <Loader2 className="animate-spin" size={22} /> : 'Enviar pedido'}
              </button>
              <p className="text-sm text-gray-600">
                Usamos estes dados só para responder ao pedido.{' '}
                <Link to="/informacoes#privacidade" className="underline underline-offset-2">Privacidade</Link>
              </p>
            </div>
          </form>
        </div>

        <aside className="lg:sticky lg:top-28 space-y-6 rounded-3xl bg-white border border-gray-100 p-6">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Como funciona</h2>
            <ol className="mt-3 space-y-3 text-gray-700 text-[15px] leading-relaxed list-decimal pl-5">
              <li>Respondemos por email com proposta e preço.</li>
              <li>Criamos a arte e enviamos para aprovação.</li>
              <li>A produção começa com 50% de sinal; o resto paga-se até ao levantamento ou envio.</li>
            </ol>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="space-y-2.5 text-[15px]">
            <h2 className="font-bold text-gray-900 text-lg">Prefere falar já?</h2>
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-800 hover:text-brand-blue">
              <MessageCircle size={18} className="text-[#1f9e55]" aria-hidden="true" /> WhatsApp {CONTACT.phoneDisplay}
            </a>
            <a href={`tel:${CONTACT.phoneE164}`} className="flex items-center gap-2 text-gray-800 hover:text-brand-blue">
              <Phone size={18} className="text-brand-blue" aria-hidden="true" /> {CONTACT.phoneDisplay}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 text-gray-800 hover:text-brand-blue break-all">
              <Mail size={18} className="text-brand-pink shrink-0" aria-hidden="true" /> {CONTACT.email}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Orcamento;
