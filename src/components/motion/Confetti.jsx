import React, { useMemo } from 'react';
import { motion as Motion, useReducedMotion } from 'motion/react';

// Cores dos salpicos do logótipo
const COLORS = ['#ec4899', '#1aa6bd', '#a855f7', '#f7b731', '#0ea5e9'];

/** Uma chuva curta de confettis, uma só vez. Com "reduzir movimento" não aparece. */
const Confetti = ({ pieces = 36 }) => {
  const reduce = useReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => {
        // distribuição determinística (sem Math.random, para render estável)
        const angle = (i / pieces) * Math.PI * 2;
        const spread = 140 + ((i * 37) % 120);
        return {
          id: i,
          x: Math.cos(angle) * spread,
          y: Math.sin(angle) * spread - 120,
          rotate: ((i * 53) % 360) - 180,
          color: COLORS[i % COLORS.length],
          size: 7 + (i % 3) * 3,
          round: i % 4 === 0,
        };
      }),
    [pieces]
  );

  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {bits.map((b) => (
        <Motion.span
          key={b.id}
          className="absolute left-1/2 top-10"
          style={{
            width: b.size,
            height: b.round ? b.size : b.size * 1.6,
            backgroundColor: b.color,
            borderRadius: b.round ? '999px' : '2px',
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 220], opacity: [1, 1, 0], rotate: b.rotate, scale: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], times: [0, 0.45, 1] }}
        />
      ))}
    </div>
  );
};

export default Confetti;
