import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin, Mail, MessageCircle } from 'lucide-react';
import { OCCASIONS, CONTACT } from '../data/occasions';
import { CONTAINER_CLASS } from '../constants';

const linkClass = 'hover:text-brand-pink transition-colors w-fit';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-14 pb-10 mt-auto">
      <div className={CONTAINER_CLASS}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 mb-10">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src="/assets/logo.png" alt="" className="w-12 h-12 rounded-full object-cover" />
              <p className="text-brand-dark font-bold text-xl">Tralalá Criativo</p>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              Papelaria de festa e presentes personalizados, feitos à mão em Leiria e enviados para todo o país.
            </p>
          </div>

          <nav aria-label="Ocasiões" className="flex flex-col gap-3">
            <p className="text-gray-900 font-bold">Ocasiões</p>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-600">
              {OCCASIONS.map((o) => (
                <li key={o.slug}><Link to={`/ocasioes/${o.slug}`} className={linkClass}>{o.name}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Encomendas" className="flex flex-col gap-3">
            <p className="text-gray-900 font-bold">Encomendas</p>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-600">
              <li><Link to="/produtos" className={linkClass}>Loja</Link></li>
              <li><Link to="/orcamento" className={linkClass}>Pedir orçamento</Link></li>
              <li><Link to="/informacoes" className={linkClass}>Envios e prazos</Link></li>
              <li><Link to="/informacoes#trocas" className={linkClass}>Trocas e devoluções</Link></li>
              <li><Link to="/informacoes#privacidade" className={linkClass}>Privacidade</Link></li>
              <li><Link to="/sobre" className={linkClass}>Sobre nós</Link></li>
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
            <p className="text-gray-900 font-bold">Contactos</p>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-600">
              <li>
                <a href={`tel:${CONTACT.phoneE164}`} className={`flex items-center gap-2 ${linkClass}`}>
                  <Phone size={16} aria-hidden="true" /> {CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${linkClass}`}>
                  <MessageCircle size={16} aria-hidden="true" /> WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className={`flex items-center gap-2 ${linkClass}`}>
                  <Mail size={16} aria-hidden="true" /> {CONTACT.email}
                </a>
              </li>
              <li>
                <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 ${linkClass}`}>
                  <Instagram size={16} aria-hidden="true" /> @tralalacriativo.pt
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <Link to="/localizacao" className={linkClass}>{CONTACT.address}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} Tralalá Criativo. Feito com carinho em Leiria.</p>
          <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">
            Livro de Reclamações
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
