import React, { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { PARTY_KITS } from '../../data/occasions';
import { CONTAINER_CLASS } from '../../constants';
import { Stagger, Item } from '../motion/Reveal';
import { EASE_OUT } from '../motion/easing';

// "3 cilindros" -> { qty: '3', text: 'Cilindros' }; "Topo de bolo" -> { qty: '1', ... }
const splitItem = (item) => {
  const match = item.match(/^(\d+)\s+(.*)$/);
  const text = match ? match[2] : item;
  return { qty: match ? match[1] : '1', text: text.charAt(0).toUpperCase() + text.slice(1) };
};

// Pé em ziguezague do talão
const ZIGZAG = (() => {
  const teeth = 18;
  const pts = ['0% 0%', '100% 0%', '100% calc(100% - 14px)'];
  for (let i = teeth; i >= 0; i -= 1) {
    const x = (i / teeth) * 100;
    pts.push(`${x.toFixed(2)}% ${i % 2 === 0 ? 'calc(100% - 14px)' : '100%'}`);
  }
  return `polygon(${pts.join(', ')})`;
})();

// Uma cor do logótipo por kit
const KIT_COLOR = {
  'kit-essencial': { fill: 'bg-teal-ink text-white', text: 'text-teal-ink', band: 'bg-teal-ink' },
  'kit-premium': { fill: 'bg-pink-ink text-white', text: 'text-pink-ink', band: 'bg-pink-ink' },
  'kit-completo': { fill: 'bg-[#7e22ce] text-white', text: 'text-[#6b21a8]', band: 'bg-[#7e22ce]' },
};

const KitReceipt = () => {
  const uid = useId();
  const reduce = useReducedMotion();
  const [kitId, setKitId] = useState(PARTY_KITS[1].id);
  const kit = PARTY_KITS.find((k) => k.id === kitId);
  const color = KIT_COLOR[kit.id];

  return (
    <section className="relative bg-tile-rose overflow-hidden" aria-labelledby={`${uid}-title`}>
      <div className={`${CONTAINER_CLASS} grid lg:grid-cols-12 gap-10 lg:gap-8`}>
        <Stagger className="lg:col-span-6 pt-20 md:pt-28 lg:pb-28">
          <Item as="h2" id={`${uid}-title`} className="text-[clamp(2.25rem,4.2vw,4rem)] font-bold leading-[0.95] tracking-[-0.03em] text-ink text-balance">
            Kits para a mesa da <span className="text-pink-ink">festa</span>
          </Item>
          <Item as="p" className="mt-5 text-lg md:text-xl leading-relaxed text-ink max-w-[46ch]">
            Painel com o tema, estruturas, cilindros, bandejas e as caixinhas personalizadas. Escolha o kit, diga-nos a data
            e nós tratamos do resto.
          </Item>

          <Item as="fieldset" className="mt-8">
            <legend className="sr-only">Escolha o kit</legend>
            <div className="flex flex-wrap gap-2.5">
              {PARTY_KITS.map((k) => {
                const active = k.id === kitId;
                const c = KIT_COLOR[k.id];
                return (
                  <label
                    key={k.id}
                    className={`inline-flex items-center gap-2 h-12 px-5 rounded-full font-bold text-lg cursor-pointer transition-colors duration-200 focus-within:ring-4 focus-within:ring-brand-blue/30 ${
                      active ? c.fill : `bg-paper ${c.text} hover:bg-white`
                    }`}
                  >
                    <input type="radio" name={`${uid}-kit`} value={k.id} checked={active} onChange={() => setKitId(k.id)} className="sr-only" />
                    {k.name.replace('Kit ', '')}
                    <span className={`tabular-nums ${active ? 'opacity-85' : 'text-ink-soft'}`}>{k.price} €</span>
                  </label>
                );
              })}
            </div>
          </Item>

          <Item className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              to={`/orcamento?kit=${kit.id}`}
              className="group inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full whitespace-nowrap bg-gradient-to-r from-brand-pink to-brand-blue text-white text-lg font-bold shadow-lg transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              Reservar este kit
              <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <p className="text-base text-ink">Reserva com 50% de sinal, depois de aprovar a arte.</p>
          </Item>
        </Stagger>

        {/* O talão: começa acima da secção e acaba em ziguezague */}
        <div className="lg:col-span-4 lg:col-start-8 pb-20 lg:pb-0">
          <Motion.div
            data-ui
            className="mx-auto w-full max-w-[380px] bg-paper lg:-mt-2 px-7 pt-0 pb-14"
            style={{ clipPath: ZIGZAG }}
            initial={reduce ? false : { y: -40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1, ease: EASE_OUT }}
          >
            {/* cabeçalho do talão na cor do kit */}
            <Motion.div
              key={kit.id}
              initial={reduce ? false : { opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`-mx-7 mb-6 pt-10 lg:pt-24 pb-6 px-7 ${color.band} text-center`}
            >
              <img src="/assets/logo.png" alt="" className="mx-auto h-12 w-auto rounded-lg bg-white px-2 py-1" />
              <p className="mt-3 text-2xl font-bold text-white">{kit.name}</p>
              <p className="text-base text-white/90">Tralalá Criativo · Leiria</p>
            </Motion.div>

            <table className="mt-6 w-full text-base text-ink">
              <caption className="sr-only">Conteúdo do {kit.name}</caption>
              <thead className="sr-only">
                <tr><th scope="col">Peça</th><th scope="col">Quantidade</th></tr>
              </thead>
              <AnimatePresence mode="wait" initial={false}>
                <Motion.tbody
                  key={kit.id}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                >
                  {kit.items.map((item) => {
                    const { qty, text } = splitItem(item);
                    return (
                      <Motion.tr
                        key={item}
                        variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_OUT } } }}
                      >
                        <td className="py-2">{text}</td>
                        <td className="py-2 text-right tabular-nums font-semibold">{qty}</td>
                      </Motion.tr>
                    );
                  })}
                </Motion.tbody>
              </AnimatePresence>
              <tfoot>
                <tr>
                  <td colSpan={2} className="pt-5"><div className={`h-1 ${color.band}`} aria-hidden="true" /></td>
                </tr>
                <tr>
                  <th scope="row" className="pt-4 text-left text-lg font-semibold">Total</th>
                  <td className={`pt-4 text-right text-[2.75rem] leading-none font-bold tabular-nums whitespace-nowrap ${color.text}`}>{kit.price} €</td>
                </tr>
                <tr className="text-ink-soft">
                  <th scope="row" className="pt-3 text-left font-normal">Sinal para reservar (50%)</th>
                  <td className="pt-3 text-right tabular-nums">{(kit.price / 2).toFixed(2).replace('.', ',')} €</td>
                </tr>
              </tfoot>
            </table>
          </Motion.div>
        </div>
      </div>
    </section>
  );
};

export default KitReceipt;
