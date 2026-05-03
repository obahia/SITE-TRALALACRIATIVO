// src/pages/localizacao.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Instagram, MapPin } from 'lucide-react';

const Localizacao = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-8 md:px-16 lg:px-32 py-12 md:py-20"
    >
      <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-8 md:p-12 shadow-xl border border-white/50 relative overflow-hidden">
        
        {/* Decoração de Fundo */}
        <div className="absolute top-0 left-0 -mt-10 -ml-10 w-40 h-40 bg-brand-blue/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-40 h-40 bg-brand-pink/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Heading */}
          <h2 className="text-sm font-bold text-brand-blue tracking-widest uppercase mb-2 flex items-center justify-center md:justify-start gap-2">
            <MapPin size={16} /> Onde Estamos
          </h2>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center md:text-left">
            Visite o nosso atelie
          </h1>

          {/* Grid: Map + Contact Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* Google Maps Embed */}
            <div className="flex justify-center h-[400px]">
              <iframe
                src="https://maps.google.com/maps?q=Av.+Marquês+de+Pombal+226+Leiria+Portugal&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '1rem' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="shadow-lg rounded-2xl"
              ></iframe>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col justify-center space-y-6">
              
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Phone className="text-brand-blue" size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-blue tracking-widest uppercase mb-1">Telefone</p>
                  <a
                    href="tel:+351961073787"
                    className="text-lg text-gray-700 hover:text-brand-pink transition-colors cursor-pointer font-semibold"
                  >
                    961 073 787
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Instagram className="text-brand-blue" size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-blue tracking-widest uppercase mb-1">Instagram</p>
                  <a
                    href="https://www.instagram.com/tralalacriativo.pt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-gray-700 hover:text-brand-pink transition-colors cursor-pointer font-semibold"
                  >
                    @tralalacriativo.pt
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <MapPin className="text-brand-blue" size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-blue tracking-widest uppercase mb-1">Endereco</p>
                  <p className="text-lg text-gray-700 font-semibold">
                    Av. Marques de Pombal, 226<br />
                    Leiria, Portugal
                  </p>
                </div>
              </div>

            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-brand-pink/10 rounded-2xl p-6 text-center border border-brand-pink/20">
            <h3 className="text-xl font-bold text-brand-blue mb-2">Tem alguma questao?</h3>
            <p className="text-gray-700 mb-4">Entre em contacto connosco!</p>
            <a 
              href="tel:+351961073787" 
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              <Phone size={20} />
              Ligar Agora
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Localizacao;