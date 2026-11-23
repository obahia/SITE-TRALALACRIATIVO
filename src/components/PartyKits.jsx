import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { PARTY_KITS } from '../data/occasions';

// Kits de decoração: reservam-se por orçamento (data da festa + 50% de sinal).
const PartyKits = ({ occasion }) => (
  <div>
    <ul className="grid md:grid-cols-3 gap-5 md:gap-6">
      {PARTY_KITS.map((kit, i) => (
        <li
          key={kit.id}
          className={`flex flex-col bg-white rounded-3xl overflow-hidden border ${
            i === 1 ? 'border-brand-pink/40 shadow-[0_18px_40px_-20px_rgba(236,72,153,0.55)]' : 'border-gray-100'
          }`}
        >
          <div className="relative aspect-[5/4] bg-brand-light overflow-hidden">
            <img src={kit.image} alt={`${kit.name}: exemplo de mesa decorada`} loading="lazy" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col flex-1 p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-2xl font-bold text-gray-900">{kit.name}</h3>
              <span className="text-2xl font-bold text-gray-900 tabular-nums">{kit.price} €</span>
            </div>
            <p className="mt-1 text-gray-600">{kit.tagline}</p>
            <ul className="mt-5 mb-6 space-y-2 text-gray-800">
              {kit.items.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check size={18} className="text-brand-blue shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to={`/orcamento?kit=${kit.id}${occasion ? `&ocasiao=${occasion}` : ''}`}
              className={`mt-auto pt-0 inline-flex items-center justify-center gap-2 h-12 rounded-xl font-bold transition ${
                i === 1 ? 'bg-brand-pink text-white hover:brightness-110' : 'bg-gray-900 text-white hover:bg-black'
              }`}
            >
              Reservar este kit <ArrowRight size={18} />
            </Link>
          </div>
        </li>
      ))}
    </ul>
    <p className="mt-6 text-sm text-gray-600 max-w-2xl">
      O tema, as cores, o nome e a idade adaptam-se à sua festa. A entrega ou o levantamento em Leiria combina-se no
      orçamento; a reserva confirma-se com 50% de sinal após aprovação da arte e o restante paga-se até ao levantamento ou envio.
    </p>
  </div>
);

export default PartyKits;
