import React from 'react';
import { motion as Motion, useReducedMotion } from 'motion/react';

import { EASE_OUT, EASE_SOFT } from './easing';

// Cada tipo de conteúdo entra à sua maneira, em vez de um fade igual em todo o lado.
const KINDS = {
  // títulos e texto: sobem 24px
  rise: {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
  },
  // linhas de lista: chegam uma a uma, curtas
  row: {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
  },
  // fotografias: abrem de baixo para cima e assentam de uma escala ligeira
  open: {
    hidden: { opacity: 0, clipPath: 'inset(22% 0% 0% 0%)', scale: 1.05 },
    show: {
      opacity: 1,
      clipPath: 'inset(0% 0% 0% 0%)',
      scale: 1,
      transition: { duration: 1.05, ease: EASE_SOFT },
    },
  },
  // blocos de cor: crescem a partir da base
  grow: {
    hidden: { opacity: 0, scaleY: 0.82 },
    show: { opacity: 1, scaleY: 1, transition: { duration: 0.9, ease: EASE_OUT } },
  },
};

/**
 * Contentor que dispara a entrada dos filhos uma vez, quando entra no ecrã.
 * Com "reduzir movimento" ativo, tudo aparece no estado final.
 */
export function Stagger({ as = 'div', gap = 0.08, delay = 0, amount = 0.2, children, ...rest }) {
  const reduce = useReducedMotion();
  const Comp = Motion[as] || Motion.div;
  return (
    <Comp
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export function Item({ as = 'div', kind = 'rise', style, children, ...rest }) {
  const Comp = Motion[as] || Motion.div;
  const extra = kind === 'grow' ? { transformOrigin: 'bottom', ...style } : style;
  return (
    <Comp variants={KINDS[kind]} style={extra} {...rest}>
      {children}
    </Comp>
  );
}
