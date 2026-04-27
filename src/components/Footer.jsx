// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const containerClass = "container mx-auto px-8 md:px-16 lg:px-32";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className={`${containerClass}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Logo / Sobre */}
          <div className="flex flex-col gap-4">
            <h3 className="text-brand-blue font-bold text-2xl">Tralalá Criativo</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Arte que aquece o coração. Presentes personalizados feitos com amor e dedicação em cada detalhe.
            </p>
          </div>

          {/* Links Úteis */}
          <div className="flex flex-col gap-4">
            <h4 className="text-brand-blue font-semibold text-lg">Links Úteis</h4>
            <nav className="flex flex-col gap-3 text-sm text-gray-500">
              <Link to="/" className="hover:text-brand-pink transition-colors cursor-pointer w-fit">
                Início
              </Link>
              <Link to="/produtos" className="hover:text-brand-pink transition-colors cursor-pointer w-fit">
                Produtos
              </Link>
              <Link to="/sobre" className="hover:text-brand-pink transition-colors cursor-pointer w-fit">
                Sobre Nós
              </Link>
            </nav>
          </div>

          {/* Contactos */}
          <div className="flex flex-col gap-4">
            <h4 className="text-brand-blue font-semibold text-lg">Contactos</h4>
            <div className="flex flex-col gap-3 text-sm text-gray-500">
              <a 
                href="tel:+351961073787" 
                className="flex items-center gap-2 hover:text-brand-pink transition-colors cursor-pointer w-fit"
              >
                <Phone size={16} />
                <span>961 073 787</span>
              </a>
              <a 
                href="https://www.instagram.com/tralalacriativo.pt/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 hover:text-brand-pink transition-colors cursor-pointer w-fit"
              >
                <Instagram size={16} />
                <span>Instagram</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>Av. Marquês de Pombal, 226 - Leiria</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} Tralalá Criativo. Feito com carinho em Leiria.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
