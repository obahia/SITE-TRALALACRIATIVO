// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  const containerClass = "container mx-auto px-8 md:px-16 lg:px-32";

  return (
    <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
      <div className={`${containerClass} text-center`}>
        <p className="text-brand-blue font-bold text-2xl mb-4">Tralalá Criativo</p>
        <p className="text-gray-400 text-sm">© 2025 Feito com carinho em Leiria.</p>

        {/* Opcional: Links de redes sociais ou termos */}
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-400">
          <a href="https://www.instagram.com/tralalacriativo.pt/" target='_blank' rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">Instagram</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;