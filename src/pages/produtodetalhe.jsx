import React, { useState, useRef, useEffect, useId } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, Upload, ArrowLeft, X, Check, Loader2, Package, CalendarClock, Truck, ArrowRight } from 'lucide-react';

import { supabase } from '../services/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { uploadCustomizationImage } from '../services/storage';
import { OCCASION_BY_SLUG, SHIPPING } from '../data/occasions';
import { CONTAINER_CLASS } from '../constants';
import { formatPriceSimple } from '../utils/formatters';

const MAX_QTY = 1000;

const inputClass =
  'w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 ' +
  'focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 transition';

const ProdutoDetalhe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const uid = useId();
  const { addToCart } = useCart();
  const { user, setIsLoginModalOpen } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState('1');
  const [selectedOption, setSelectedOption] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [details, setDetails] = useState({ nome: '', idade: '', tema: '', data: '' });
  const [instructions, setInstructions] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (cancelled) return;
      if (error || !data) {
        navigate('/produtos', { replace: true });
        return;
      }
      setProduct(data);
      const min = data.min_quantity || 1;
      setQuantity(min);
      setQuantityInput(String(min));
      setSelectedOption(data.customization_options?.[0] ?? null);
      setLoading(false);
    };
    fetchProduct();
    return () => { cancelled = true; };
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-blue" size={40} aria-label="A carregar" />
      </div>
    );
  }
  if (!product) return null;

  const minQty = product.min_quantity || 1;
  const soldOut = product.stock_quantity === 0;
  const isQuote = product.sale_mode === 'quote';
  const allowsImage = selectedOption?.allows_image === true;
  const unitPrice = Number(selectedOption ? selectedOption.price : product.price);
  const perLetter = product.price_note === 'Preço por letra';
  const occasionNames = (product.occasions || []).map((slug) => OCCASION_BY_SLUG[slug]?.name).filter(Boolean);

  const commitQuantity = (value) => {
    const n = Math.min(MAX_QTY, Math.max(minQty, Number.parseInt(value, 10) || minQty));
    setQuantity(n);
    setQuantityInput(String(n));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError('');

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('A imagem tem mais de 5 MB. Escolha uma mais pequena.');
      return;
    }
    if (!user) {
      setUploadError('Entre na sua conta para enviar imagens.');
      setIsLoginModalOpen(true);
      return;
    }

    setUploading(true);
    const { data, error } = await uploadCustomizationImage(file, user.id);
    setUploading(false);

    if (error) {
      setUploadError(`Não foi possível enviar a imagem: ${error.message}`);
      return;
    }
    setUploadedImage(data.publicUrl);
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddToCart = () => {
    const summary = [
      details.nome && `Nome: ${details.nome.trim()}`,
      details.idade && `Idade: ${details.idade.trim()}`,
      details.tema && `Tema/cores: ${details.tema.trim()}`,
      details.data && `Data da festa: ${details.data}`,
    ].filter(Boolean).join(' · ');

    addToCart(
      { ...product, price: unitPrice },
      quantity,
      {
        uploadedImage: allowsImage ? uploadedImage : null,
        instructions: [summary, instructions.trim()].filter(Boolean).join('\n'),
        personalizationType: selectedOption?.label || 'Padrão',
      }
    );
  };

  const setDetail = (key) => (e) => setDetails((d) => ({ ...d, [key]: e.target.value }));
  const options = product.customization_options || [];

  return (
    <div className={`${CONTAINER_CLASS} py-8 md:py-12`}>
      <Link to="/produtos" className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-blue mb-6 font-semibold">
        <ArrowLeft size={18} /> Voltar à loja
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* IMAGEM */}
        <div className="lg:sticky lg:top-28">
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden aspect-[4/5] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.4)]">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-light">
                <Package size={72} className="text-brand-blue/40" strokeWidth={1.5} aria-hidden="true" />
              </div>
            )}
          </div>
          {occasionNames.length > 0 && (
            <p className="mt-4 text-sm text-gray-600">
              Ideal para: <span className="font-semibold text-gray-800">{occasionNames.join(', ')}</span>
            </p>
          )}
        </div>

        {/* INFO */}
        <div>
          {product.category && <p className="text-sm font-semibold text-brand-blue mb-2">{product.category}</p>}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-[-0.02em] text-balance">{product.name}</h1>
          <p className="mt-4 text-gray-700 text-lg leading-relaxed">{product.description}</p>

          {isQuote ? (
            <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-6 md:p-8">
              <p className="text-2xl font-bold text-brand-pink">{product.price_note || 'Sob orçamento'}</p>
              <p className="mt-2 text-gray-700">
                O preço depende do tamanho, do modelo e da quantidade. Diga-nos o que precisa e enviamos o valor certo.
              </p>
              <Link
                to={`/orcamento?produto=${encodeURIComponent(product.name)}${product.occasions?.[0] ? `&ocasiao=${product.occasions[0]}` : ''}`}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-brand-pink text-white text-lg font-bold h-14 rounded-2xl hover:brightness-110 transition"
              >
                Pedir orçamento <ArrowRight size={20} />
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-6 flex items-baseline flex-wrap gap-x-3 gap-y-1">
                <span className="text-4xl font-bold text-gray-900 tabular-nums">{formatPriceSimple(unitPrice * quantity)}</span>
                <span className="text-gray-600 tabular-nums">
                  {quantity} × {formatPriceSimple(unitPrice)}{perLetter ? ' por letra' : ''}
                </span>
              </div>
              {minQty > 1 && (
                <p className="mt-1 text-sm font-semibold text-gray-700">Encomenda mínima: {minQty} unidades.</p>
              )}

              <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-6 md:p-8 space-y-7">
                {/* Quantidade */}
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor={`${uid}-qty`} className="font-bold text-gray-900">
                    {perLetter ? 'Número de letras' : 'Quantidade'}
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-300 bg-white">
                    <button
                      type="button"
                      onClick={() => commitQuantity(quantity - 1)}
                      disabled={quantity <= minQty}
                      aria-label="Diminuir quantidade"
                      className="w-11 h-11 flex items-center justify-center text-gray-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      id={`${uid}-qty`}
                      type="text"
                      inputMode="numeric"
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      onBlur={(e) => commitQuantity(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitQuantity(e.currentTarget.value); }}
                      className="w-16 h-11 text-center font-bold text-lg text-gray-900 tabular-nums border-x border-gray-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => commitQuantity(quantity + 1)}
                      disabled={quantity >= MAX_QTY}
                      aria-label="Aumentar quantidade"
                      className="w-11 h-11 flex items-center justify-center text-gray-700 disabled:opacity-30 cursor-pointer"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Opções (ex.: tamanho do display) */}
                {options.length > 1 && (
                  <fieldset>
                    <legend className="font-bold text-gray-900 mb-3">Escolha a opção</legend>
                    <div className="grid gap-2.5">
                      {options.map((option) => {
                        const active = selectedOption?.label === option.label;
                        return (
                          <button
                            key={option.label}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setSelectedOption(option)}
                            className={`flex justify-between items-center p-4 rounded-2xl border-2 text-left transition-colors cursor-pointer ${
                              active ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <span className={`font-bold ${active ? 'text-brand-blue' : 'text-gray-800'}`}>{option.label}</span>
                            <span className="flex items-center gap-3">
                              <span className="font-bold text-gray-900 tabular-nums">{formatPriceSimple(Number(option.price))}</span>
                              <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? 'bg-brand-blue border-brand-blue' : 'border-gray-300'}`}>
                                {active && <Check size={14} className="text-white" />}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}

                {/* Personalização */}
                <fieldset className="space-y-4">
                  <legend className="font-bold text-gray-900 mb-1">Personalização</legend>
                  <p className="text-sm text-gray-600 -mt-1">Enviamos a arte para aprovar antes de produzir.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`${uid}-nome`} className="block text-sm font-semibold text-gray-700 mb-1.5">Nome a colocar</label>
                      <input id={`${uid}-nome`} className={inputClass} value={details.nome} onChange={setDetail('nome')} maxLength={60} placeholder="ex.: Leonor" />
                    </div>
                    <div>
                      <label htmlFor={`${uid}-idade`} className="block text-sm font-semibold text-gray-700 mb-1.5">Idade ou data</label>
                      <input id={`${uid}-idade`} className={inputClass} value={details.idade} onChange={setDetail('idade')} maxLength={40} placeholder="ex.: 3 anos" />
                    </div>
                    <div>
                      <label htmlFor={`${uid}-tema`} className="block text-sm font-semibold text-gray-700 mb-1.5">Tema e cores</label>
                      <input id={`${uid}-tema`} className={inputClass} value={details.tema} onChange={setDetail('tema')} maxLength={120} placeholder="ex.: Safari, verde e bege" />
                    </div>
                    <div>
                      <label htmlFor={`${uid}-data`} className="block text-sm font-semibold text-gray-700 mb-1.5">Data da festa</label>
                      <input id={`${uid}-data`} type="date" className={inputClass} value={details.data} onChange={setDetail('data')} />
                    </div>
                  </div>

                  {allowsImage && (
                    <div>
                      <p className="block text-sm font-semibold text-gray-700 mb-1.5">Imagem de referência (opcional)</p>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="sr-only" id={`${uid}-file`} />
                      {uploadedImage ? (
                        <div className="flex items-center gap-4 p-3 rounded-2xl border border-brand-blue/40 bg-brand-blue/5">
                          <img src={uploadedImage} alt="Imagem enviada" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm">Imagem recebida</p>
                            <button type="button" onClick={removeImage} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-red-700 cursor-pointer">
                              <X size={14} /> Remover
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor={`${uid}-file`}
                          className="flex items-center justify-center gap-2 h-20 rounded-2xl border-2 border-dashed border-gray-300 text-gray-700 font-semibold hover:border-brand-blue hover:text-brand-blue transition-colors cursor-pointer focus-within:ring-4 focus-within:ring-brand-blue/30"
                        >
                          {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} aria-hidden="true" />}
                          {uploading ? 'A enviar…' : 'Carregar imagem (até 5 MB)'}
                        </label>
                      )}
                      {uploadError && <p className="mt-1.5 text-sm font-semibold text-red-700">{uploadError}</p>}
                    </div>
                  )}

                  <div>
                    <label htmlFor={`${uid}-notas`} className="block text-sm font-semibold text-gray-700 mb-1.5">Mais algum pormenor?</label>
                    <textarea
                      id={`${uid}-notas`}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      maxLength={1000}
                      rows={3}
                      placeholder="Frase, personagem, cores a evitar…"
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </fieldset>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={soldOut}
                className="mt-6 w-full bg-gray-900 text-white text-lg font-bold h-16 rounded-2xl hover:bg-black transition active:scale-[0.99] cursor-pointer disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                {soldOut ? 'Esgotado' : `Adicionar ao carrinho · ${formatPriceSimple(unitPrice * quantity)}`}
              </button>
              {soldOut && (
                <p className="mt-3 text-sm text-gray-700">
                  Este produto está esgotado.{' '}
                  <Link to={`/orcamento?produto=${encodeURIComponent(product.name)}`} className="font-bold text-brand-pink underline">
                    Pergunte-nos quando volta
                  </Link>.
                </p>
              )}

              {quantity >= 100 && (
                <p className="mt-3 text-sm text-gray-700">
                  Para {quantity} unidades ou mais,{' '}
                  <Link to={`/orcamento?produto=${encodeURIComponent(product.name)}`} className="font-bold text-brand-pink underline">
                    peça orçamento
                  </Link>{' '}
                  e conseguimos um preço melhor.
                </p>
              )}
            </>
          )}

          <ul className="mt-8 space-y-3 text-gray-700">
            <li className="flex gap-3">
              <CalendarClock size={20} className="text-brand-blue shrink-0 mt-0.5" aria-hidden="true" />
              <span>Feito à mão depois de aprovar a arte. Encomende com 2 a 4 semanas de antecedência.</span>
            </li>
            <li className="flex gap-3">
              <Truck size={20} className="text-brand-blue shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                CTT {formatPriceSimple(SHIPPING.cttPrice)}, grátis acima de {SHIPPING.freeFrom} €. Levantamento grátis em Leiria.{' '}
                <Link to="/informacoes" className="font-semibold text-brand-blue underline underline-offset-2">Saber mais</Link>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProdutoDetalhe;
