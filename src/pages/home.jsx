import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

import BrandHero from '../components/home/BrandHero';
import KitReceipt from '../components/home/KitReceipt';
import { Stagger, Item } from '../components/motion/Reveal';
import { EASE_OUT } from '../components/motion/easing';
import { useProducts } from '../hooks/useProducts';
import { OCCASION_BY_SLUG, SHIPPING } from '../data/occasions';
import { CONTAINER_CLASS } from '../constants';
import { formatPriceSimple } from '../utils/formatters';

const CATALOGUE_ORDER = ['Caixinhas e embalagens', 'Lembrancinhas', 'Decoração de mesa', 'Papelaria'];

// Duas ocasiões em painel grande; as outras três em linhas com foto.
const PANELS = [
  { slug: 'festas-infantis', field: 'bg-tile-sky', img: '/assets/produtos/caixinha-luxo.webp', fact: 'Caixinhas, topos e lembranças com o personagem' },
  { slug: 'casamento', field: 'bg-tile-sun', img: '/assets/produtos/cone-personalizado.webp', fact: 'Convites, cones para pétalas e ímanes gravados' },
];
const MORE_OCCASIONS = [
  { slug: 'batizado', img: '/assets/produtos/caixa-padrinhos.webp', fact: 'Caixa para os padrinhos e lembranças em MDF' },
  { slug: 'empresas', img: '/assets/produtos/sacolinha.webp', fact: 'Brindes com logótipo e fatura com NIF' },
  { slug: 'individuais', img: '/assets/produtos/nome-mdf.webp', fact: 'Canecas, azulejos e nomes em MDF' },
];

const STAGES = [
  {
    name: 'Escolhe',
    text: 'Na loja ou por orçamento: o produto, o tema, o nome e a idade.',
    img: '/assets/produtos/convite-impresso.webp',
    field: 'bg-tile-sky',
    height: 'lg:h-[30vh]',
    span: 'lg:col-span-3',
  },
  {
    name: 'Aprova a arte',
    text: 'Enviamos a arte antes de produzir. Encomende com 2 a 4 semanas de antecedência.',
    img: '/assets/produtos/topo-bolo-simples.webp',
    field: 'bg-tile-sun',
    height: 'lg:h-[44vh]',
    span: 'lg:col-span-4',
  },
  {
    name: 'Recebe em casa',
    text: `CTT: ${formatPriceSimple(SHIPPING.leiriaPrice)} no distrito de Leiria, ${formatPriceSimple(SHIPPING.cttPrice)} no resto do país, grátis acima de ${SHIPPING.freeFrom} €.`,
    img: '/assets/produtos/kit-premium.webp',
    field: 'bg-tile-rose',
    height: 'lg:h-[60vh]',
    span: 'lg:col-span-5',
  },
];

const priceLabel = (p) => {
  if (p.sale_mode === 'quote') return p.price_note || 'Sob orçamento';
  const since = p.price_note?.toLowerCase().startsWith('desde') ? 'desde ' : '';
  const unit = p.price_note === 'Preço por letra' ? ' /letra' : p.min_quantity > 1 ? ' /un.' : '';
  return `${since}${formatPriceSimple(Number(p.price))}${unit}`;
};

const Home = () => {
  const reduce = useReducedMotion();
  const { products } = useProducts({ orderBy: 'sort_order', ascending: true });

  const catalogue = useMemo(() => {
    const own = products.filter((p) => p.image_url?.startsWith('/assets/produtos/'));
    return CATALOGUE_ORDER
      .map((category) => ({ category, items: own.filter((p) => p.category === category) }))
      .filter((group) => group.items.length > 0);
  }, [products]);

  return (
    <div>
      <BrandHero />

      {/* --- OCASIÕES: dois objetos, dois campos --- */}
      <section aria-labelledby="ocasioes-title">
        <div className="grid md:grid-cols-2">
          {PANELS.map((panel, i) => {
            const occasion = OCCASION_BY_SLUG[panel.slug];
            return (
              <div key={panel.slug} className={`relative ${panel.field} h-[78svh] md:h-[88svh] overflow-hidden group`}>
                {i === 0 && (
                  <h2 id="ocasioes-title" className="absolute top-8 left-6 md:top-12 md:left-10 z-10 text-[clamp(1.75rem,2.8vw,2.5rem)] font-bold leading-none tracking-[-0.02em] text-ink max-w-[9ch]">
                    Para que festa é?
                  </h2>
                )}
                <Motion.img
                  src={panel.img}
                  alt=""
                  loading="lazy"
                  className="absolute -top-[14%] right-[-8%] w-[78%] md:w-[72%] aspect-[4/5] object-cover rounded-2xl transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-[1.03]"
                  initial={reduce ? false : { y: -60, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.1, ease: EASE_OUT, delay: i * 0.12 }}
                />
                <Stagger className="absolute inset-x-6 md:inset-x-10 bottom-7 md:bottom-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                  <Item>
                    <p className="text-2xl font-bold text-ink">{occasion.name}</p>
                    <p className="mt-1 text-lg text-ink">{panel.fact}</p>
                  </Item>
                  <Item className="flex gap-2.5 shrink-0">
                    <Link
                      to={`/ocasioes/${panel.slug}`}
                      className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-ink text-paper font-bold transition-transform duration-150 active:scale-[0.98] hover:bg-pink-ink"
                    >
                      Ver ideias
                    </Link>
                    <Link
                      to={`/orcamento?ocasiao=${panel.slug}`}
                      className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-paper text-ink font-bold transition-transform duration-150 active:scale-[0.98] hover:bg-paper/70"
                    >
                      Orçamento
                    </Link>
                  </Item>
                </Stagger>
              </div>
            );
          })}
        </div>

        <Stagger as="ul" className={`${CONTAINER_CLASS} py-12 md:py-16 grid md:grid-cols-3 gap-8`} gap={0.09}>
          {MORE_OCCASIONS.map((o) => (
            <Item as="li" kind="row" key={o.slug}>
              <Link to={`/ocasioes/${o.slug}`} className="group flex items-center gap-5">
                <img src={o.img} alt="" loading="lazy" className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover shrink-0 transition-transform duration-300 group-hover:rotate-[-3deg] group-hover:scale-105" />
                <span>
                  <span className="flex items-center gap-1.5 text-2xl font-bold text-ink group-hover:text-pink-ink transition-colors">
                    {OCCASION_BY_SLUG[o.slug].name}
                    <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                  <span className="block mt-0.5 text-base text-ink-soft">{o.fact}</span>
                </span>
              </Link>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* --- CATÁLOGO: menu em duas colunas, foto como marcador --- */}
      {catalogue.length > 0 && (
        <section className={`${CONTAINER_CLASS} pt-16 md:pt-28 pb-20 md:pb-32`} aria-labelledby="catalogo-title">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 id="catalogo-title" className="text-[clamp(2.25rem,4.2vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em] text-ink">
              O catálogo
            </h2>
            <Link to="/produtos" className="group inline-flex items-center gap-1.5 text-lg font-bold text-ink underline underline-offset-4 decoration-2 decoration-brand-pink hover:text-pink-ink">
              Abrir na loja <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {catalogue.map(({ category, items }) => (
            <div key={category} className="mt-16 md:mt-24">
              <div className="flex items-baseline justify-between gap-4 mb-8 md:mb-10">
                <h3 className="text-[clamp(1.75rem,2.8vw,2.5rem)] font-bold leading-none tracking-[-0.02em] text-ink">{category}</h3>
                <span className="text-base text-ink-soft tabular-nums">{items.length} produtos</span>
              </div>
              <Stagger as="ul" className="grid md:grid-cols-2 gap-x-16 gap-y-8" gap={0.05} amount={0.1}>
                {items.map((p) => (
                  <Item as="li" kind="row" key={p.id}>
                    <Link to={`/produto/${p.id}`} className="group flex gap-5">
                      <span className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden bg-tile-sky">
                        <img src={p.image_url} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 ease-[var(--ease-soft)] group-hover:scale-110" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-baseline justify-between gap-4">
                          <span className="text-lg font-bold text-ink group-hover:text-pink-ink transition-colors">{p.name}</span>
                          <span className={`shrink-0 text-lg font-semibold tabular-nums ${p.sale_mode === 'quote' ? 'text-pink-ink' : 'text-ink'}`}>
                            {priceLabel(p)}
                          </span>
                        </span>
                        <span className="block mt-1 text-base text-ink-soft leading-relaxed line-clamp-2 max-w-[44ch]">{p.description}</span>
                        {p.min_quantity > 1 && (
                          <span className="block mt-1 text-base font-semibold text-ink">Mínimo {p.min_quantity} unidades</span>
                        )}
                      </span>
                    </Link>
                  </Item>
                ))}
              </Stagger>
            </div>
          ))}
        </section>
      )}

      {/* --- KITS: o talão --- */}
      <KitReceipt />

      {/* --- COMO ENCOMENDAR: blocos que crescem --- */}
      <section className={`${CONTAINER_CLASS} py-20 md:py-32`} aria-labelledby="como-title">
        <div className="grid lg:grid-cols-12 gap-x-3 gap-y-10 lg:items-end relative lg:min-h-[78vh]">
          <h2
            id="como-title"
            className="lg:absolute lg:top-0 lg:left-0 lg:w-[56%] text-[clamp(2.25rem,4.2vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em] text-ink"
          >
            Como encomendar
          </h2>
          {STAGES.map((stage, i) => (
            <Stagger key={stage.name} className={stage.span} delay={i * 0.12}>
              <Item kind="grow" className={`${stage.field} ${stage.height} h-[62vw] sm:h-[44vw] rounded-2xl overflow-hidden relative`}>
                <img
                  src={stage.img}
                  alt=""
                  loading="lazy"
                  className={`absolute inset-[10%] w-[80%] h-[80%] rounded-xl ${stage.img.includes('convite') ? 'object-contain' : 'object-cover'}`}
                />
              </Item>
              <Item>
                <p className="mt-5 text-xl font-bold text-ink">{stage.name}</p>
                <p className="mt-1 text-base text-ink-soft leading-relaxed max-w-[40ch]">{stage.text}</p>
              </Item>
            </Stagger>
          ))}
        </div>
      </section>

      {/* --- ORÇAMENTO: o cartão-resposta --- */}
      <section className="bg-ink overflow-hidden" aria-labelledby="pedido-title">
        <div className={`${CONTAINER_CLASS} min-h-[80svh] grid lg:grid-cols-12 gap-10 items-end pt-20`}>
          <Stagger className="lg:col-span-4 lg:pb-24">
            <Item as="p" className="text-xl md:text-2xl leading-snug text-paper">
              Casamentos, batizados e empresas pedem quantidades grandes. Conte-nos a data e o que imagina; respondemos com ideias e preço.
            </Item>
          </Stagger>
          <Motion.div
            className="lg:col-span-7 lg:col-start-6 bg-paper aspect-[7/5] max-h-[560px] w-full -mb-16 px-8 md:px-12 pt-10 md:pt-14 flex flex-col items-center text-center"
            initial={reduce ? false : { y: 120, rotate: 6, opacity: 0 }}
            whileInView={{ y: 0, rotate: 2, opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
            style={{ rotate: reduce ? 2 : undefined }}
          >
            <h2 id="pedido-title" className="text-[clamp(1.75rem,2.8vw,2.5rem)] font-bold leading-none tracking-[-0.02em] text-ink">Pedir orçamento</h2>
            <p className="mt-3 text-lg text-ink max-w-[42ch]">
              Kits, convites, brindes com logótipo ou mais de 100 unidades. A reserva fica feita com 50% de sinal.
            </p>
            <Link
              to="/orcamento"
              className="group mt-8 w-full h-14 rounded-full bg-ink text-paper text-lg font-bold inline-flex items-center justify-center gap-2 transition-transform duration-150 active:scale-[0.98] hover:bg-pink-ink"
            >
              Escrever o pedido <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
