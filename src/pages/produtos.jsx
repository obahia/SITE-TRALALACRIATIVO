import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Package, X } from 'lucide-react';

import ProductCard from '../components/ProductCard';
import { Stagger, Item } from '../components/motion/Reveal';
import { useProducts } from '../hooks/useProducts';
import { OCCASIONS, OCCASION_BY_SLUG } from '../data/occasions';
import { CONTAINER_CLASS } from '../constants';

const ALL = 'Todos';

const normalize = (text) =>
  String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const chipClass = (active) =>
  `px-4 h-10 rounded-full font-semibold text-base transition-colors duration-200 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
    active ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-tile-sky'
  }`;

const Produtos = () => {
  const [params, setParams] = useSearchParams();
  const occasion = OCCASION_BY_SLUG[params.get('ocasiao')] ? params.get('ocasiao') : '';
  const category = params.get('categoria') || ALL;
  const [searchQuery, setSearchQuery] = useState('');

  const { products, loading, error } = useProducts({ orderBy: 'sort_order', ascending: true });

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return [ALL, ...Array.from(set).sort((a, b) => a.localeCompare(b, 'pt'))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = normalize(searchQuery.trim());
    return products.filter((p) => {
      if (occasion && !p.occasions?.includes(occasion)) return false;
      if (category !== ALL && p.category !== category) return false;
      if (q && !normalize(`${p.name} ${p.description}`).includes(q)) return false;
      return true;
    });
  }, [products, occasion, category, searchQuery]);

  const hasFilters = occasion || category !== ALL || searchQuery;

  return (
    <div className={`${CONTAINER_CLASS} py-10 md:py-14`}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.9] font-bold text-ink tracking-[-0.03em]">Loja</h1>
          <p className="mt-3 text-gray-700 text-lg max-w-xl">
            Tudo personalizado com o tema, o nome e a data. Grandes quantidades?{' '}
            <Link to="/orcamento" className="font-bold text-pink-ink underline underline-offset-2">Peça orçamento</Link>.
          </p>
        </div>
        <div className="relative w-full md:max-w-xs">
          <label htmlFor="pesquisa-produtos" className="sr-only">Pesquisar produtos</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} aria-hidden="true" />
          <input
            id="pesquisa-produtos"
            type="search"
            placeholder="Pesquisar, ex.: caixinha"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-12 rounded-full bg-paper placeholder-ink-soft/70 text-ink focus:ring-4 focus:ring-brand-blue/30 outline-none transition"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-3 mb-8">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Ocasião">
          <button type="button" onClick={() => updateParam('ocasiao', '')} className={chipClass(!occasion)} aria-pressed={!occasion}>
            Todas as ocasiões
          </button>
          {OCCASIONS.map((o) => (
            <button
              key={o.slug}
              type="button"
              onClick={() => updateParam('ocasiao', o.slug)}
              className={chipClass(occasion === o.slug)}
              aria-pressed={occasion === o.slug}
            >
              {o.name}
            </button>
          ))}
        </div>
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Categoria">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => updateParam('categoria', c === ALL ? '' : c)}
                aria-pressed={category === c}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  category === c ? 'bg-tile-sky text-ink' : 'text-ink-soft hover:bg-paper'
                }`}
              >
                {c === ALL ? 'Todas as categorias' : c}
              </button>
            ))}
          </div>
        )}
      </div>

      {!loading && !error && (
        <div className="flex items-center gap-3 mb-5 text-sm text-gray-600" aria-live="polite">
          <span className="tabular-nums">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setParams({}, { replace: true }); }}
              className="inline-flex items-center gap-1 font-semibold text-brand-blue hover:text-pink-ink cursor-pointer"
            >
              <X size={14} /> Limpar filtros
            </button>
          )}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/6] rounded-2xl bg-paper animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-gray-700">
          <p className="text-lg font-semibold">Não conseguimos carregar a loja.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-3 font-bold text-brand-blue underline cursor-pointer">
            Tentar de novo
          </button>
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <Package size={48} className="mx-auto mb-4 text-gray-400" aria-hidden="true" />
          <p className="text-lg font-semibold text-gray-800">Nenhum produto com estes filtros.</p>
          <p className="mt-2">
            Não encontra o que procura?{' '}
            <Link to={`/orcamento${occasion ? `?ocasiao=${occasion}` : ''}`} className="font-bold text-pink-ink underline">
              Peça-nos um orçamento
            </Link>.
          </p>
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6" gap={0.04} amount={0.05}>
          {filteredProducts.map((produto, i) => (
            <Item key={produto.id} kind="row">
              <ProductCard product={produto} tone={i} />
            </Item>
          ))}
        </Stagger>
      )}
    </div>
  );
};

export default Produtos;
