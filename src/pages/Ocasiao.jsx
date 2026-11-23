import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Check, CalendarClock, Truck, Receipt } from 'lucide-react';

import ProductCard from '../components/ProductCard';
import KitReceipt from '../components/home/KitReceipt';
import { Stagger, Item } from '../components/motion/Reveal';
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
        <nav aria-label="Caminho" className="text-base text-ink-soft mb-6">
          <Link to="/" className="hover:text-pink-ink">Início</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-ink font-semibold">{occasion.name}</span>
        </nav>
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          <Stagger key={slug} gap={0.09}>
            <Item as="h1" className="text-[clamp(2.5rem,5.4vw,5rem)] font-bold text-ink leading-[0.95] tracking-[-0.03em] text-balance">
              {occasion.title}
            </Item>
            <Item as="p" className="mt-6 text-lg md:text-xl text-ink leading-relaxed max-w-xl">{occasion.intro}</Item>
            <Item as="ul" className="mt-6 space-y-2">
              {occasion.ideas.map((idea) => (
                <li key={idea} className="flex gap-2.5 text-ink text-lg font-medium">
                  <Check size={22} className="text-pink-ink shrink-0" aria-hidden="true" /> {idea}
                </li>
              ))}
            </Item>
            <Item className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={quoteLink}
                className="group inline-flex items-center justify-center gap-2 bg-pink-ink text-white rounded-full h-14 px-8 text-lg font-bold hover:brightness-110 active:scale-[0.98] transition"
              >
                Pedir orçamento <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#produtos"
                className="inline-flex items-center justify-center rounded-full h-14 px-8 text-lg font-bold text-ink bg-paper hover:bg-tile-sky active:scale-[0.98] transition"
              >
                Ver produtos
              </a>
            </Item>
          </Stagger>
          <Stagger key={`${slug}-img`}>
            <Item kind="open" as="figure" className="bg-tile-rose p-[7%] rounded-2xl max-w-md w-full mx-auto overflow-hidden">
              <img src={occasion.image} alt="" className="w-full aspect-[4/5] object-cover rounded-xl" />
            </Item>
          </Stagger>
        </div>
      </section>

      {/* --- FACTOS PRÁTICOS --- */}
      <section className="bg-paper">
        <div className={`${CONTAINER_CLASS} py-8 grid sm:grid-cols-3 gap-6`}>
          <p className="flex gap-3 text-ink">
            <CalendarClock className="text-pink-ink shrink-0" aria-hidden="true" />
            <span><strong>Encomende com 2 a 4 semanas</strong> de antecedência para garantir a data.</span>
          </p>
          <p className="flex gap-3 text-ink">
            <Truck className="text-pink-ink shrink-0" aria-hidden="true" />
            <span>
              <strong>CTT para todo o país</strong> por {formatPriceSimple(SHIPPING.cttPrice)}, grátis acima de {SHIPPING.freeFrom} €. Levantamento grátis em Leiria.
            </span>
          </p>
          <p className="flex gap-3 text-ink">
            <Receipt className="text-pink-ink shrink-0" aria-hidden="true" />
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
          <h2 className="text-[clamp(2.25rem,4.2vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em] text-ink">Produtos para {occasion.name.toLowerCase()}</h2>
          <Link to={`/produtos?ocasiao=${slug}`} className="inline-flex items-center gap-1.5 font-bold text-ink underline underline-offset-4 decoration-2 decoration-brand-pink hover:text-pink-ink transition-colors">
            Filtrar na loja <ArrowRight size={18} />
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/6] rounded-2xl bg-paper animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (error || products.length === 0) && (
          <div className="rounded-2xl bg-paper p-8 text-center">
            <p className="text-lg font-semibold text-ink">Ainda estamos a fotografar os produtos desta ocasião.</p>
            <p className="mt-2 text-ink-soft">Diga-nos o que procura e enviamos ideias e preços.</p>
            <Link to={quoteLink} className="mt-5 inline-flex items-center gap-2 font-bold text-pink-ink">
              Pedir orçamento <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6" gap={0.05} amount={0.05}>
            {products.map((product, i) => (
              <Item key={product.id} kind="row">
                <ProductCard product={product} tone={i} />
              </Item>
            ))}
          </Stagger>
        )}
      </section>

      {occasion.showKits && <KitReceipt />}

      {/* --- OUTRAS OCASIÕES --- */}
      <section className={`${CONTAINER_CLASS} pt-14`}>
        <h2 className="text-xl font-bold text-ink mb-4">Outras ocasiões</h2>
        <div className="flex flex-wrap gap-3">
          {OCCASIONS.filter((o) => o.slug !== slug).map((o) => (
            <Link
              key={o.slug}
              to={`/ocasioes/${o.slug}`}
              className="px-5 h-11 inline-flex items-center rounded-full bg-paper font-semibold text-ink hover:bg-tile-sky transition-colors duration-200"
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
