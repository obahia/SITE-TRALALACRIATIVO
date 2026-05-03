// src/pages/Sobre.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Sparkles } from 'lucide-react';

const Sobre = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-8 md:px-16 lg:px-32 py-12 md:py-20"
    >
      <div className="bg-white/60 backdrop-blur-md rounded-[3rem] p-8 md:p-12 shadow-xl border border-white/50 relative overflow-hidden">
        
        {/* Decoração de Fundo (opcional) */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-pink/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-brand-blue/20 rounded-full blur-3xl"></div>

        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          
          {/* --- LADO DA FOTO --- */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative group">
              {/* Moldura colorida atrás */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-pink rounded-[2rem] rotate-6 group-hover:rotate-3 transition-transform duration-500 opacity-60"></div>
              
            
              <img 
                src="/assets/livia.jpg" 
                alt="Lívia Dutra - Fundadora" 
                className="relative w-80 h-96 object-cover rounded-[2rem] shadow-lg border-4 border-white rotate-[-3deg] group-hover:rotate-0 transition-transform duration-500"
              />
              
              {/* Selo Flutuante */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-full shadow-lg animate-bounce-slow">
                <Heart className="text-brand-pink fill-brand-pink" size={32} />
              </div>
            </div>
          </div>

          {/* --- LADO DO TEXTO --- */}
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
            <div>
              <h2 className="text-sm font-bold text-brand-blue tracking-widest uppercase mb-2 flex items-center justify-center md:justify-start gap-2">
                <Sparkles size={16} /> Nossa História
              </h2>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                Olá! Sou a <span className="text-brand-pink font-handwriting">Lívia Dutra</span>
              </h1>
              <p className="text-gray-400 text-lg">A mente e o coração por trás do Tralalá Criativo.</p>
            </div>

            <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
              <p>
                Tenho 24 anos e a ideia desse sonho nasceu com a chegada do meu filho, que me fez ver o mundo com <span className="text-brand-blue font-bold">mais cor, mais amor</span> e mais vontade de eternizar momentos felizes.
              </p>
              
              <p>
                Sempre gostei da arte, dos detalhes e da sensação única de oferecer algo feito com carinho. Com o tempo, percebi que os produtos personalizados têm um poder mágico: o de transformar objetos simples em <span className="text-brand-pink font-bold">memórias que aquecem o coração</span>.
              </p>

              <p>
                Foi assim que o <strong>Tralalá Criativo</strong> ganhou vida: um ateliê onde cada caneca, cada tote bag e cada estampa contam uma história.
              </p>
              
              <div className="bg-white/50 p-6 rounded-2xl border-l-4 border-brand-pink italic text-gray-500 mt-6">
                "Tudo é pensado e criado com muito cuidado, desde a escolha das cores até à embalagem final, para que cada encomenda leve consigo um pedacinho de afeto."
              </div>
            </div>

            {/* Assinatura ou Botão */}
            <div className="pt-4">
              <div className="flex items-center justify-center md:justify-start gap-2 text-brand-blue font-bold">
                 <Star size={20} className="fill-brand-blue/20" />
                 <span>Feito com amor, para você.</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Sobre;