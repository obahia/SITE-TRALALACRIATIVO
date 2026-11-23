import React, { useEffect, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { EASE_OUT, EASE_SOFT } from '../motion/easing';
import { formatPriceSimple } from '../../utils/formatters';
import { CONTAINER_CLASS } from '../../constants';

// Espécimes do hero: fotografias reais do catálogo. Preço e mínimo vêm da base de dados quando existem.
const SPECIMENS = [
  { name: 'Caixinha Luxo', label: 'Caixinha luxo', img: '/assets/produtos/caixinha-luxo.webp', tile: 'var(--color-tile-rose)', fallback: '2,80 € por unidade, mínimo 10' },
  { name: 'Tubete 3D', label: 'Tubete 3D', img: '/assets/produtos/tubete-3d.webp', tile: 'var(--color-tile-sky)', fallback: '1,80 € por unidade, mínimo 10' },
  { name: 'Topo de Bolo Simples', label: 'Topo de bolo', img: '/assets/produtos/topo-bolo-simples.webp', tile: 'var(--color-tile-sun)', fallback: '6,50 € com nome, idade e tema' },
  { name: 'Caixa Cineminha + Copos', label: 'Caixa cineminha', img: '/assets/produtos/caixa-cineminha.webp', tile: 'var(--color-tile-sky)', fallback: '8,00 € por unidade, mínimo 5' },
  { name: 'Display em PVC', label: 'Display em PVC', img: '/assets/produtos/display-pvc.webp', tile: 'var(--color-tile-rose)', fallback: 'Desde 22 €, até 1 metro de altura' },
  { name: 'Íman em MDF', label: 'Íman em MDF', img: '/assets/produtos/iman-mdf.webp', tile: 'var(--color-tile-sun)', fallback: '2,00 € por unidade, mínimo 10' },
];

const HOLD_MS = 5600;

const describe = (product, fallback) => {
  if (!product) return fallback;
  const price = formatPriceSimple(Number(product.price));
  const since = product.price_note?.toLowerCase().startsWith('desde') ? 'Desde ' : '';
  const min = product.min_quantity > 1 ? `, mínimo ${product.min_quantity}` : '';
  return `${since}${price} por unidade${min}`;
};

const SpecimenHero = ({ products = [] }) => {
  const uid = useId();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false); // a pessoa escolheu ou escreveu: fica parado
  const [hovering, setHovering] = useState(false);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');

  const byName = useMemo(() => Object.fromEntries(products.map((p) => [p.name, p])), [products]);
  const current = SPECIMENS[index];
  const product = byName[current.name];

  // Movimento principal: troca lenta de espécime. Pára quando a pessoa interage,
  // quando o separador está escondido e com "reduzir movimento".
  useEffect(() => {
    if (reduce || paused || hovering) return undefined;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % SPECIMENS.length);
    }, HOLD_MS);
    return () => clearInterval(timer);
  }, [reduce, paused, hovering]);

  const choose = (i) => {
    setPaused(true);
    setIndex(i);
  };

  const tagName = nome.trim() || 'Leonor';
  const tagAge = idade.trim() || (nome.trim() ? '' : '3 anos');
  const params = new URLSearchParams();
  if (nome.trim()) params.set('nome', nome.trim());
  if (idade.trim()) params.set('idade', idade.trim());
  const query = params.toString() ? `?${params}` : '';
  const target = product ? `/produto/${product.id}${query}` : '/produtos';

  return (
    <section className={`${CONTAINER_CLASS} pt-8 md:pt-12 pb-20 md:pb-28`} aria-labelledby={`${uid}-title`}>
      {/* Linha 1: o nome da marca como wordmark e a frase que diz o que é */}
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <Motion.h1
          id={`${uid}-title`}
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="lg:col-span-7 text-[clamp(3.25rem,8.4vw,8.5rem)] leading-[0.88] font-bold tracking-[-0.035em] text-ink"
        >
          Tralalá
          <br />
          Criativo
        </Motion.h1>
        <Motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: EASE_OUT }}
          className="lg:col-span-4 lg:col-start-9 text-lg md:text-xl leading-relaxed text-ink lg:pt-3"
        >
          Papelaria de festa feita à mão em Leiria: caixinhas, topos de bolo, convites e kits com o nome e a idade de quem
          faz a festa. Enviamos para todo o país por CTT.
        </Motion.p>
        <Link
          to="/produtos"
          className="md:hidden flex items-center justify-center gap-2 h-14 rounded-full bg-ink text-paper text-lg font-bold active:scale-[0.98] transition-transform"
        >
          Ver a loja <ArrowRight size={20} />
        </Link>
      </div>

      {/* Linha 2: lista de nomes · espécime · etiqueta viva */}
      <div className="mt-10 lg:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-center">
        {/* Lista (desktop: vertical, alinhada à direita) */}
        <div role="group" aria-label="Escolher produto em destaque" className="hidden lg:flex lg:col-span-3 flex-col items-end gap-2.5 text-right">
          {SPECIMENS.map((s, i) => {
            const distance = Math.abs(i - index);
            const size = distance === 0 ? 'text-xl' : distance === 1 ? 'text-lg' : 'text-base';
            const tone = distance === 0 ? 'text-ink' : distance === 1 ? 'text-ink-soft' : 'text-ink-soft/70';
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => choose(i)}
                aria-pressed={i === index}
                className={`${size} ${tone} font-semibold cursor-pointer transition-[color,transform] duration-200 ease-[var(--ease-out)] hover:text-pink-ink hover:-translate-x-1`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Espécime */}
        <div className="lg:col-span-5 min-w-0">
          <Motion.div
            className="relative mx-auto w-full max-w-[440px] aspect-[4/5] rounded-2xl overflow-hidden"
            transition={{ duration: 1.6, ease: EASE_SOFT, opacity: { duration: 0.8, ease: EASE_OUT }, scale: { duration: 0.8, ease: EASE_OUT } }}
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, backgroundColor: current.tile }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <div className="absolute inset-[9%] bottom-[16%] rounded-xl overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                <Motion.img
                  key={current.img}
                  src={current.img}
                  alt={current.label}
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={reduce ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ opacity: { duration: 1.6, ease: EASE_SOFT }, scale: { duration: HOLD_MS / 1000, ease: 'linear' } }}
                  fetchPriority={index === 0 ? 'high' : undefined}
                />
              </AnimatePresence>
            </div>
            {/* Etiqueta com o nome escrito pela visita */}
            <div className="absolute left-[7%] bottom-[7%] -rotate-3 bg-paper px-4 py-2.5 rounded-md max-w-[78%]">
              <p className="text-ink font-bold text-2xl leading-none truncate">{tagName}</p>
              {tagAge && <p className="text-ink-soft text-sm font-semibold mt-1 truncate">{tagAge}</p>}
            </div>
          </Motion.div>

          {/* Lista (telemóvel: linha horizontal) */}
          <div className="lg:hidden mt-5 -mx-4 px-4 flex gap-5 overflow-x-auto snap-x" role="group" aria-label="Escolher produto em destaque (telemóvel)">
            {SPECIMENS.map((s, i) => (
              <button
                key={s.name}
                type="button"
                onClick={() => choose(i)}
                aria-pressed={i === index}
                className={`snap-center whitespace-nowrap text-lg font-semibold cursor-pointer ${i === index ? 'text-ink' : 'text-ink-soft/70'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coisa viva: escrever o nome e levá-lo para a personalização */}
        <div className="lg:col-span-4 min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <Motion.div
              key={current.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <p className="text-2xl font-bold text-ink">{current.label}</p>
              <p className="mt-1 text-lg text-ink-soft tabular-nums">{describe(product, current.fallback)}</p>
            </Motion.div>
          </AnimatePresence>

          <div className="mt-7 grid grid-cols-[1fr_7.5rem] gap-3">
            <div>
              <label htmlFor={`${uid}-nome`} className="block text-base font-semibold text-ink mb-1.5">Nome na etiqueta</label>
              <input
                id={`${uid}-nome`}
                value={nome}
                maxLength={16}
                onChange={(e) => { setNome(e.target.value); setPaused(true); }}
                placeholder="Leonor"
                autoComplete="off"
                className="w-full h-12 px-4 rounded-xl bg-paper text-ink text-lg placeholder-ink-soft/60 focus:outline-none focus:ring-4 focus:ring-brand-blue/30"
              />
            </div>
            <div>
              <label htmlFor={`${uid}-idade`} className="block text-base font-semibold text-ink mb-1.5">Idade</label>
              <input
                id={`${uid}-idade`}
                value={idade}
                maxLength={12}
                onChange={(e) => { setIdade(e.target.value); setPaused(true); }}
                placeholder="3 anos"
                autoComplete="off"
                className="w-full h-12 px-4 rounded-xl bg-paper text-ink text-lg placeholder-ink-soft/60 focus:outline-none focus:ring-4 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <Link
            to={target}
            className="group mt-5 flex w-full items-center justify-center gap-2 h-14 rounded-full bg-ink text-paper text-lg font-bold transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.98] hover:bg-pink-ink"
          >
            Personalizar {nome.trim() ? `para ${nome.trim()}` : 'este produto'}
            <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link to="/produtos" className="mt-4 inline-flex items-center gap-1.5 text-lg font-semibold text-ink underline underline-offset-4 decoration-2 decoration-brand-pink hover:text-pink-ink">
            Ver a loja toda
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SpecimenHero;
