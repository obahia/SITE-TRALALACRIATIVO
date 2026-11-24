import React, { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { EASE_OUT } from '../motion/easing';
import { CONTAINER_CLASS } from '../../constants';
import { formatPriceSimple } from '../../utils/formatters';

// Cada categoria com uma cor do logótipo (turquesa, rosa, roxo, amarelo).
const CATEGORY_STYLE = {
  'Caixinhas e embalagens': { tab: 'bg-pink-ink text-white', chip: 'bg-tile-rose text-pink-ink', frame: 'bg-tile-rose' },
  Lembrancinhas: { tab: 'bg-teal-ink text-white', chip: 'bg-tile-sky text-teal-ink', frame: 'bg-tile-sky' },
  'Decoração de mesa': { tab: 'bg-[#7e22ce] text-white', chip: 'bg-tile-lilac text-[#6b21a8]', frame: 'bg-tile-lilac' },
  Papelaria: { tab: 'bg-brand-yellow text-ink', chip: 'bg-tile-sun text-[#8a5a00]', frame: 'bg-tile-sun' },
};
const FALLBACK_STYLE = { tab: 'bg-teal-ink text-white', chip: 'bg-tile-sky text-teal-ink', frame: 'bg-tile-sky' };

const priceLabel = (p) => {
  if (p.sale_mode === 'quote') return p.price_note || 'Sob orçamento';
  const since = p.price_note?.toLowerCase().startsWith('desde') ? 'desde ' : '';
  const unit = p.price_note === 'Preço por letra' ? '/letra' : p.min_quantity > 1 ? '/un.' : '';
  return `${since}${formatPriceSimple(Number(p.price))}${unit ? ` ${unit}` : ''}`;
};

const CatalogueTabs = ({ groups }) => {
  const uid = useId();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(groups[0]?.category);
  const current = useMemo(() => groups.find((g) => g.category === active) || groups[0], [groups, active]);
  if (!current) return null;
  const style = CATEGORY_STYLE[current.category] || FALLBACK_STYLE;

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className="relative overflow-hidden py-20 md:py-28 bg-[url('/assets/fundo.jpeg')] bg-cover bg-center"
    >
      {/* véu claro para o texto ler bem sobre a aguarela */}
      <div className="absolute inset-0 bg-brand-light/55" aria-hidden="true" />

      <div className={`${CONTAINER_CLASS} relative`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <h2 id={`${uid}-title`} className="text-[clamp(2.25rem,4.2vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em] text-teal-ink">
              O nosso catálogo
            </h2>
            <p className="mt-3 text-lg md:text-xl text-ink">
              Personalizados com alma, feitos com <span className="text-pink-ink font-bold">carinho</span>.
            </p>
          </div>
          <Link
            to="/produtos"
            className="group self-start md:self-auto inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-teal-ink font-bold transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
          >
            Ver toda a loja <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Separadores por categoria */}
        <div className="mt-10 flex flex-wrap gap-2.5" role="group" aria-label="Escolher categoria">
          {groups.map((g) => {
            const selected = g.category === current.category;
            const s = CATEGORY_STYLE[g.category] || FALLBACK_STYLE;
            return (
              <button
                key={g.category}
                type="button"
                aria-pressed={selected}
                aria-controls={`${uid}-panel`}
                onClick={() => setActive(g.category)}
                className={`relative h-12 px-5 rounded-full font-bold text-base cursor-pointer transition-colors duration-200 ${
                  selected ? s.tab : 'bg-white/85 text-ink hover:bg-white'
                }`}
              >
                {g.category}
                <span className={`ml-2 tabular-nums ${selected ? 'opacity-80' : 'text-ink-soft'}`}>{g.items.length}</span>
              </button>
            );
          })}
        </div>

        {/* Produtos da categoria */}
        <div id={`${uid}-panel`} className="mt-10" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <Motion.ul
              key={current.category}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.05 } } }}
            >
              {current.items.map((p, i) => (
                <Motion.li
                  key={p.id}
                  variants={{
                    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 18, rotate: i % 2 ? 1.5 : -1.5 },
                    show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.5, ease: EASE_OUT } },
                  }}
                  whileHover={reduce ? undefined : { y: -6, rotate: i % 2 ? 1 : -1, transition: { type: 'spring', stiffness: 300, damping: 18 } }}
                >
                  <Link to={`/produto/${p.id}`} className="group block h-full bg-white rounded-2xl p-2.5 pb-4">
                    <span className={`block aspect-square rounded-xl overflow-hidden ${style.frame}`}>
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 ease-[var(--ease-soft)] group-hover:scale-[1.06]"
                      />
                    </span>
                    <span className="block px-1.5 pt-3">
                      <span className="block font-bold text-ink leading-snug group-hover:text-pink-ink transition-colors">{p.name}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center h-7 px-3 rounded-full text-sm font-bold tabular-nums ${style.chip}`}>
                          {priceLabel(p)}
                        </span>
                        {p.min_quantity > 1 && (
                          <span className="inline-flex items-center h-7 px-2.5 rounded-full text-sm font-semibold bg-brand-light text-ink-soft">
                            mín. {p.min_quantity}
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                </Motion.li>
              ))}
            </Motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default CatalogueTabs;
