import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from 'motion/react';
import { Sparkles, ArrowRight, MapPin, Truck, Heart } from 'lucide-react';
import { EASE_OUT } from '../motion/easing';
import { SHIPPING } from '../../data/occasions';
import { CONTAINER_CLASS } from '../../constants';

// Hero original da marca (título "Arte que aquece o coração" + vídeo do trabalho real),
// melhorado: texto da loja de personalizados, duas ações, factos práticos e fotos de produtos.
const rise = (reduce, delay) => ({
  initial: reduce ? false : { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: EASE_OUT },
});

const FACTS = [
  { icon: Heart, text: 'Feito à mão em Leiria' },
  { icon: Truck, text: 'Envio CTT para todo o país' },
  { icon: MapPin, text: `Portes grátis acima de ${SHIPPING.freeFrom} €` },
];

const BrandHero = () => {
  const reduce = useReducedMotion();

  return (
    <section className={`${CONTAINER_CLASS} py-12 md:py-20 lg:py-24`}>
      <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-16">
        {/* Texto */}
        <div className="flex-1 text-center lg:text-left">
          <Motion.h1
            {...rise(reduce, 0)}
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-[-0.02em]"
          >
            <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink bg-clip-text text-transparent">
              Arte que aquece o
            </span>
            <br />
            <span className="text-wave-effect">coração</span>
          </Motion.h1>

          <Motion.p
            {...rise(reduce, 0.12)}
            className="mt-7 text-lg md:text-xl text-ink-soft leading-relaxed max-w-xl mx-auto lg:mx-0"
          >
            Produtos personalizados para festas e presentes: caixinhas, topos de bolo, convites, canecas, azulejos e muito
            mais. Transforme as suas ideias em <span className="text-pink-ink font-bold">presentes inesquecíveis!</span>
          </Motion.p>

          <Motion.div {...rise(reduce, 0.24)} className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link
              to="/produtos"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-pink to-brand-blue text-white rounded-2xl h-14 px-8 text-lg font-bold shadow-lg transition-transform duration-300 ease-[var(--ease-out)] hover:scale-[1.03] active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5" aria-hidden="true" />
              Ver produtos
            </Link>
            <Link
              to="/orcamento"
              className="group inline-flex items-center justify-center gap-2 bg-white text-pink-ink rounded-2xl h-14 px-8 text-lg font-bold transition-colors duration-200 hover:bg-tile-rose"
            >
              Pedir orçamento
              <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Motion.div>

          <Motion.ul
            {...rise(reduce, 0.36)}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-start text-base text-ink-soft"
          >
            {FACTS.map((fact) => {
              const FactIcon = fact.icon;
              return (
                <li key={fact.text} className="inline-flex items-center gap-2">
                  <FactIcon size={18} className="text-brand-pink" aria-hidden="true" />
                  {fact.text}
                </li>
              );
            })}
          </Motion.ul>
        </div>

        {/* Vídeo do trabalho, a flutuar, com duas fotos de produtos à volta */}
        <div className="relative flex-1 w-full max-w-2xl mx-auto">
          {/* Exterior: entrada e inclinação. Interior: flutuar. Assim não há saltos. */}
          <Motion.div
            initial={reduce ? false : { opacity: 0, y: 30, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 2 }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            whileHover={{ rotate: 0, transition: { duration: 0.4, ease: EASE_OUT } }}
          >
            <Motion.div
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
              className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[7px] border-white/60"
            >
              <video
                src="/assets/video.mp4"
                poster="/assets/video-poster.webp"
                width={2056}
                height={1080}
                className="w-full h-auto aspect-[2056/1080] object-cover bg-tile-sky"
                loop
                muted
                autoPlay={!reduce}
                controls={reduce}
                playsInline
                preload="metadata"
                aria-label="Exemplos de trabalhos personalizados da Tralalá Criativo"
              />
            </Motion.div>
          </Motion.div>

          <Motion.img
            src="/assets/produtos/caixinha-luxo.webp"
            alt="Caixinhas luxo personalizadas"
            className="absolute -left-4 sm:-left-8 -bottom-8 w-28 sm:w-36 aspect-[4/5] object-cover rounded-xl bg-white p-1.5 pb-5 shadow-xl"
            initial={reduce ? false : { opacity: 0, y: 30, rotate: -12 }}
            animate={{ opacity: 1, y: 0, rotate: -7 }}
            transition={{ duration: 0.9, delay: 0.5, ease: EASE_OUT }}
          />
          <Motion.img
            src="/assets/produtos/topo-bolo-simples.webp"
            alt="Topo de bolo personalizado"
            className="hidden sm:block absolute -right-6 -top-8 w-32 aspect-[4/5] object-cover rounded-xl bg-white p-1.5 pb-5 shadow-xl"
            initial={reduce ? false : { opacity: 0, y: -24, rotate: 12 }}
            animate={{ opacity: 1, y: 0, rotate: 6 }}
            transition={{ duration: 0.9, delay: 0.65, ease: EASE_OUT }}
          />
        </div>
      </div>
    </section>
  );
};

export default BrandHero;
