import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';

import ProductCard from '../components/ProductCard';
import PartyKits from '../components/PartyKits';
import { useProducts } from '../hooks/useProducts';
import { OCCASIONS, SHIPPING } from '../data/occasions';
import { CONTAINER_CLASS } from '../constants';
import { formatPriceSimple } from '../utils/formatters';

const HERO_PHOTOS = [
  { src: '/assets/produtos/kit-premium.webp', alt: 'Mesa de festa com painel safari, cilindros e bandejas', className: 'col-span-7 row-span-2', rotate: -2 },
  { src: '/assets/produtos/caixinha-luxo.webp', alt: 'Caixinhas luxo com laço lilás', className: 'col-span-5', rotate: 3 },
  { src: '/assets/produtos/tubete-3d.webp', alt: 'Tubetes com aplicação 3D e nome da criança', className: 'col-span-5', rotate: -3 },
];

const STEPS = [
  {
    title: 'Escolha e personalize',
    text: 'Na loja, indique o tema, o nome e a idade em cada produto. Para kits e grandes quantidades, peça orçamento.',
  },
  {
    title: 'Aprove a arte',
    text: 'Enviamos a arte para aprovação antes de produzir. Nos kits e orçamentos, a reserva fica feita com 50% de sinal.',
  },
  {
    title: 'Produzimos à mão',
    text: 'Encomende com 2 a 4 semanas de antecedência. O prazo exato depende do projeto e da época do ano.',
  },
  {
    title: 'Envio ou levantamento',
    text: `CTT para todo o país (${formatPriceSimple(SHIPPING.cttPrice)}, grátis acima de ${SHIPPING.freeFrom} €) ou levantamento grátis em Leiria.`,
  },
];

const Home = () => {
  const reduceMotion = useReducedMotion();
  const { products, loading, error } = useProducts({
    featuredOnly: true,
    orderBy: 'sort_order',
    ascending: true,
    limit: 8,
  });

  return (
    <div className="pb-8">
      {/* --- HERO --- */}
      <section className={`${CONTAINER_CLASS} pt-10 pb-16 md:pt-16 md:pb-24`}>
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="max-w-xl">
            <h1 className="text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-[4.25rem] font-bold text-gray-900 tracking-[-0.02em] text-balance">
              Cada festa com o seu nome.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-700 leading-relaxed text-pretty">
              Caixinhas, topos de bolo, convites e kits de decoração feitos à mão em Leiria, com o tema, o nome e a idade
              que escolher. Enviamos para todo o país por CTT.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/produtos"
                className="inline-flex items-center justify-center gap-2 bg-brand-blue text-white rounded-2xl h-14 px-8 text-lg font-bold shadow-[0_10px_24px_-10px_rgba(14,165,233,0.7)] hover:brightness-110 transition"
              >
                Ver a loja <ArrowRight size={20} />
              </Link>
              <Link
                to="/orcamento"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-pink border-2 border-brand-pink/30 rounded-2xl h-14 px-8 text-lg font-bold hover:border-brand-pink transition-colors"
              >
                Pedir orçamento
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={16} className="text-brand-pink shrink-0" aria-hidden="true" />
              Levantamento grátis em Leiria · Portes grátis acima de {SHIPPING.freeFrom} €
            </p>
          </div>

          {/* Fotos reais em moldura de polaroid, como no catálogo */}
          <div className="grid grid-cols-12 grid-rows-2 gap-4 sm:gap-5 max-w-xl mx-auto w-full aspect-[6/5]">
            {HERO_PHOTOS.map((photo, i) => (
              <Motion.figure
                key={photo.src}
                initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: photo.rotate }}
                transition={{ duration: 0.9, delay: 0.12 * i, ease: [0.16, 1, 0.3, 1] }}
                className={`${photo.className} bg-white p-2 pb-6 sm:p-2.5 sm:pb-7 rounded-md shadow-[0_14px_30px_-14px_rgba(15,23,42,0.45)] min-h-0`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover rounded-sm"
                  fetchPriority={i === 0 ? 'high' : undefined}
                  decoding="async"
                />
              </Motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* --- OCASIÕES --- */}
      <section className="bg-white border-y border-gray-100 py-16 md:py-20">
        <div className={CONTAINER_CLASS}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">Para que festa é?</h2>
            <p className="text-gray-600 max-w-md">
              Cada ocasião tem os produtos que mais se pedem para ela. Escolha a sua e veja ideias e preços.
            </p>
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {OCCASIONS.map((o, i) => (
              <li
                key={o.slug}
                className={i < 2 ? 'col-span-2 md:col-span-3' : i === OCCASIONS.length - 1 ? 'col-span-2 md:col-span-2' : 'col-span-1 md:col-span-2'}
              >
                <Link
                  to={`/ocasioes/${o.slug}`}
                  className="group relative block h-full min-h-48 md:min-h-64 rounded-3xl overflow-hidden bg-gray-900"
                >
                  <img
                    src={o.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-[1.03] transition duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-5">
                    <span className="text-white text-xl md:text-2xl font-bold">{o.name}</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-white/90 text-sm font-semibold">
                      Ver ideias <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- DESTAQUES --- */}
      {!error && (loading || products.length > 0) && (
        <section className={`${CONTAINER_CLASS} py-16 md:py-20`}>
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Os mais pedidos</h2>
            <Link to="/produtos" className="hidden sm:inline-flex items-center gap-1.5 font-bold text-brand-blue hover:text-brand-pink transition-colors">
              Ver toda a loja <ArrowRight size={18} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-busy="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/6] rounded-3xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <Link to="/produtos" className="sm:hidden mt-6 flex items-center justify-center gap-1.5 font-bold text-brand-blue">
            Ver toda a loja <ArrowRight size={18} />
          </Link>
        </section>
      )}

      {/* --- KITS --- */}
      <section className="bg-brand-blue/[0.06] py-16 md:py-20">
        <div className={CONTAINER_CLASS}>
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-balance">Kits de decoração para a mesa da festa</h2>
            <p className="mt-3 text-gray-700 text-lg">
              Painel, estruturas, cilindros e as caixinhas com o tema. Reserve o kit com a data da festa e nós tratamos do resto.
            </p>
          </div>
          <PartyKits />
        </div>
      </section>

      {/* --- COMO ENCOMENDAR --- */}
      <section className={`${CONTAINER_CLASS} py-16 md:py-20`}>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">Como encomendar</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative pl-14">
              <span className="absolute left-0 top-0 w-10 h-10 rounded-full bg-brand-pink text-white font-bold text-lg flex items-center justify-center tabular-nums" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-gray-700 leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
        <Link to="/informacoes" className="mt-10 inline-flex items-center gap-1.5 font-bold text-brand-blue hover:text-brand-pink transition-colors">
          Prazos, envios e pagamentos <ArrowRight size={18} />
        </Link>
      </section>

      {/* --- ORÇAMENTO --- */}
      <section className={`${CONTAINER_CLASS} pb-16`}>
        <div className="rounded-[2rem] bg-gray-900 text-white px-6 py-10 md:px-14 md:py-14 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Casamento, batizado ou evento de empresa?</h2>
            <p className="mt-4 text-white/85 text-lg max-w-xl">
              Para muitos convidados, convites ou brindes com logótipo, conte-nos a data e o que imagina.
              Respondemos com um orçamento à medida.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col xl:flex-row gap-3 md:justify-self-end">
            <Link
              to="/orcamento"
              className="inline-flex items-center justify-center gap-2 bg-brand-pink text-white rounded-2xl h-14 px-8 text-lg font-bold whitespace-nowrap hover:brightness-110 transition"
            >
              Pedir orçamento <ArrowRight size={20} />
            </Link>
            <Link
              to="/ocasioes/empresas"
              className="inline-flex items-center justify-center rounded-2xl h-14 px-8 text-lg font-bold whitespace-nowrap text-white border-2 border-white/30 hover:border-white transition-colors"
            >
              Para empresas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
