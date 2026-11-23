import React from 'react';
import { Link } from 'react-router-dom';
import { OCCASIONS, CONTACT } from '../data/occasions';
import { CONTAINER_CLASS } from '../constants';
import { Stagger, Item } from './motion/Reveal';

const linkClass = 'hover:text-pink-ink transition-colors duration-200 w-fit';

// Wordmark construído em blocos: cada letra recortada num bloco de cor, alturas diferentes, bases alinhadas.
const BLOCKS = [
  { ch: 'T', bg: 'bg-brand-blue', h: 'h-[100%]' },
  { ch: 'r', bg: 'bg-brand-pink', h: 'h-[72%]' },
  { ch: 'a', bg: 'bg-brand-yellow', h: 'h-[64%]' },
  { ch: 'l', bg: 'bg-brand-dark', h: 'h-[92%]' },
  { ch: 'a', bg: 'bg-brand-pink', h: 'h-[68%]' },
  { ch: 'l', bg: 'bg-brand-blue', h: 'h-[84%]' },
  { ch: 'á', bg: 'bg-brand-yellow', h: 'h-[96%]' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-light pt-16 md:pt-24 pb-10 mt-auto">
      <div className={CONTAINER_CLASS}>
        <Stagger className="flex items-end gap-1 h-[22svh] md:h-[34svh]" gap={0.06} aria-hidden="true">
          {BLOCKS.map((b, i) => (
            <Item
              key={`${b.ch}-${i}`}
              kind="grow"
              className={`${b.bg} ${b.h} flex-1 rounded-xl flex items-end justify-center overflow-hidden`}
            >
              <span className="font-bold leading-[0.8] text-brand-light text-[clamp(3.5rem,11vw,11rem)] translate-y-[8%]">{b.ch}</span>
            </Item>
          ))}
        </Stagger>
        <p className="sr-only">Tralalá Criativo</p>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 text-base text-ink">
          <nav aria-label="Ocasiões" className="lg:col-span-2">
            <p className="font-bold mb-3">Ocasiões</p>
            <ul className="flex flex-col gap-2.5">
              {OCCASIONS.map((o) => (
                <li key={o.slug}><Link to={`/ocasioes/${o.slug}`} className={linkClass}>{o.name}</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Loja" className="lg:col-span-2">
            <p className="font-bold mb-3">Loja</p>
            <ul className="flex flex-col gap-2.5">
              <li><Link to="/produtos" className={linkClass}>Todos os produtos</Link></li>
              <li><Link to="/orcamento" className={linkClass}>Pedir orçamento</Link></li>
              <li><Link to="/sobre" className={linkClass}>Sobre nós</Link></li>
            </ul>
          </nav>
          <nav aria-label="Encomendas" className="lg:col-span-2">
            <p className="font-bold mb-3">Encomendas</p>
            <ul className="flex flex-col gap-2.5">
              <li><Link to="/informacoes" className={linkClass}>Envios e prazos</Link></li>
              <li><Link to="/informacoes#trocas" className={linkClass}>Trocas</Link></li>
              <li><Link to="/informacoes#privacidade" className={linkClass}>Privacidade</Link></li>
            </ul>
          </nav>
          <nav aria-label="Redes" className="lg:col-span-2">
            <p className="font-bold mb-3">Redes</p>
            <ul className="flex flex-col gap-2.5">
              <li><a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>Instagram</a></li>
              <li><a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className={linkClass}>WhatsApp</a></li>
            </ul>
          </nav>
          <div className="col-span-2 lg:col-span-4 flex flex-col gap-2.5">
            <p className="font-bold mb-0.5">Leiria</p>
            <Link to="/localizacao" className={linkClass}>{CONTACT.address}</Link>
            <a href={`tel:${CONTACT.phoneE164}`} className={`${linkClass} tabular-nums`}>{CONTACT.phoneDisplay}</a>
            <a href={`mailto:${CONTACT.email}`} className={linkClass}>{CONTACT.email}</a>
          </div>
        </div>

        <div className="mt-14 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-base text-ink-soft">
          <p>© {currentYear} Tralalá Criativo. Feito à mão em Leiria.</p>
          <div className="flex items-center gap-5">
            <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer" className={linkClass}>
              Livro de Reclamações
            </a>
            <Link
              to="/orcamento"
              className="inline-flex items-center h-11 px-5 rounded-full bg-ink text-paper font-bold transition-transform duration-150 active:scale-[0.98] hover:bg-pink-ink"
            >
              Pedir orçamento
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
