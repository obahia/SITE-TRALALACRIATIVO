import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, CalendarClock, Truck, Receipt } from 'lucide-react';

import ProductCard from '../components/ProductCard';
import PartyKits from '../components/PartyKits';
import NotFound from './NotFound';
import { useProducts } from '../hooks/useProducts';
import { OCCASION_BY_SLUG, OCCASIONS, SHIPPING } from '../data/occasions';
import { CONTAINER_CLASS } from '../constants';
import { formatPriceSimple } from '../utils/formatters';

const Ocasiao = () => {
  const { slug } = useParams();
  const occasion = OCCASION_BY_SLUG[slug];
  const { products, loading, error } = useProducts({
    occasion: occasion ? slug : '__none__',
    orderBy: 'sort_order',
    ascending: true,
  });

  if (!occasion) return <NotFound />;

  const isCompany = slug === 'empresas';
  const quoteLink = `/orcamento?ocasiao=${slug}`;

  return (
    <div className="pb-16">
      {/* --- TOPO --- */}
      <section className={`${CONTAINER_CLASS} pt-8 pb-14 md:pt-14 md:pb-20`}>
        <nav aria-label="Caminho" className="text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-brand-blue">Início</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-gray-900 font-semibold">{occasion.name}</span>
        </nav>
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.05] tracking-[-0.02em] text-balance">
              {occasion.title}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-gray-700 leading-relaxed max-w-xl">{occasion.intro}</p>
            <ul className="mt-6 space-y-2">
              {occasion.ideas.map((idea) => (
                <li key={idea} className="flex gap-2.5 text-gray-800 font-medium">
                  <Check size={20} className="text-brand-pink shrink-0" aria-hidden="true" /> {idea}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={quoteLink}
                className="inline-flex items-center justify-center gap-2 bg-brand-pink text-white rounded-2xl h-14 px-8 text-lg font-bold hover:brightness-110 transition"
              >
                Pedir orçamento <ArrowRight size={20} />
              </Link>
              <a
                href="#produtos"
                className="inline-flex items-center justify-center rounded-2xl h-14 px-8 text-lg font-bold text-gray-900 bg-white border-2 border-gray-200 hover:border-gray-400 transition-colors"
              >
                Ver produtos
              </a>
            </div>
          </div>
          <figure className="bg-white p-3 pb-10 rounded-md shadow-[0_18px_40px_-18px_rgba(15,23,42,0.45)] rotate-[1.5deg] max-w-md w-full mx-auto">
            <img src={occasion.image} alt="" className="w-full aspect-[4/5] object-cover rounded-sm" />
          </figure>
        </div>
      </section>

      {/* --- FACTOS PRÁTICOS --- */}
      <section className="bg-white border-y border-gray-100">
        <div className={`${CONTAINER_CLASS} py-8 grid sm:grid-cols-3 gap-6`}>
          <p className="flex gap-3 text-gray-800">
            <CalendarClock className="text-brand-blue shrink-0" aria-hidden="true" />
            <span><strong>Encomende com 2 a 4 semanas</strong> de antecedência para garantir a data.</span>
          </p>
          <p className="flex gap-3 text-gray-800">
            <Truck className="text-brand-blue shrink-0" aria-hidden="true" />
            <span>
              <strong>CTT para todo o país</strong> por {formatPriceSimple(SHIPPING.cttPrice)}, grátis acima de {SHIPPING.freeFrom} €. Levantamento grátis em Leiria.
            </span>
          </p>
          <p className="flex gap-3 text-gray-800">
            <Receipt className="text-brand-blue shrink-0" aria-hidden="true" />
            <span>
              {isCompany
                ? <><strong>Fatura com NIF</strong> da empresa e preços para grandes quantidades.</>
                : <><strong>Arte enviada para aprovação</strong> antes de começarmos a produzir.</>}
            </span>
          </p>
        </div>
      </section>

      {/* --- PRODUTOS --- */}
      <section id="produtos" className={`${CONTAINER_CLASS} py-14 md:py-20 scroll-mt-24`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Produtos para {occasion.name.toLowerCase()}</h2>
          <Link to={`/produtos?ocasiao=${slug}`} className="inline-flex items-center gap-1.5 font-bold text-brand-blue hover:text-brand-pink transition-colors">
            Filtrar na loja <ArrowRight size={18} />
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/6] rounded-3xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (error || products.length === 0) && (
          <div className="rounded-3xl bg-white border border-gray-100 p-8 text-center">
            <p className="text-lg font-semibold text-gray-800">Ainda estamos a fotografar os produtos desta ocasião.</p>
            <p className="mt-2 text-gray-600">Diga-nos o que procura e enviamos ideias e preços.</p>
            <Link to={quoteLink} className="mt-5 inline-flex items-center gap-2 font-bold text-brand-pink">
              Pedir orçamento <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {occasion.showKits && (
        <section className="bg-brand-blue/[0.06] py-14 md:py-20">
          <div className={CONTAINER_CLASS}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Kits de decoração</h2>
            <PartyKits occasion={slug} />
          </div>
        </section>
      )}

      {/* --- OUTRAS OCASIÕES --- */}
      <section className={`${CONTAINER_CLASS} pt-14`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Outras ocasiões</h2>
        <div className="flex flex-wrap gap-3">
          {OCCASIONS.filter((o) => o.slug !== slug).map((o) => (
            <Link
              key={o.slug}
              to={`/ocasioes/${o.slug}`}
              className="px-5 py-2.5 rounded-full bg-white border border-gray-200 font-semibold text-gray-800 hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              {o.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Ocasiao;
