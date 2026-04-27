import React, { useRef, useState, useEffect } from 'react';
import { ShoppingBag, Palette, Heart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// IMPORTANTE: Verifique se o caminho do seu arquivo supabaseClient está correto
import { supabase } from '../services/supabase';

import ProductCard from '../components/ProductCard';

const Home = () => {
  const scrollRef = useRef(null);
  const containerClass = "container mx-auto px-8 md:px-16 lg:px-32";

  // 1. ESTADO PARA GUARDAR OS PRODUTOS QUE VÊM DO BANCO
  const [products, setProducts] = useState([]);

  // 2. BUSCAR DADOS NO SUPABASE
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) throw error;

        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Erro ao buscar produtos:', error.message);
      }
    };

    fetchProducts();
  }, []);

  // Função Scroll
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 340;
      direction === 'left'
        ? current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
        : current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="antialiased min-h-screen pb-10"
    >
      {/* --- HERO SECTION --- */}
      <section className={`${containerClass} py-12 md:py-20 lg:py-24`}>
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Texto */}
          <div className="flex-1 space-y-8 text-center lg:text-left z-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-slate-700">
              <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-pink bg-clip-text text-transparent">
                Arte que aquece o <br />
              </span>
              <span
                className="text-wave-effect"
                style={{ backgroundImage: 'linear-gradient(to right, #00a8c6, #60d6f0, #00a8c6)' }}
              >
                coração
              </span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Produtos personalizados criativos: canecas, camisetas, azulejos e muito mais.
              Transforme as suas ideias em <span className="text-brand-pink font-bold">presentes inesquecíveis!</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/produtos" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-pink to-brand-blue text-white rounded-xl h-14 px-8 text-lg font-bold shadow-lg hover:shadow-glow-pink hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                <Sparkles className="w-5 h-5" />
                Ver Produtos
              </Link>
            </div>
          </div>

          {/* Imagem/Video Flutuante */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="flex-1 w-full max-w-2xl mx-auto"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-7 border-white/50 rotate-2 hover:rotate-0 transition duration-500 ">
              <video src="/assets/video.mp4" className="w-full h-auto object-cover" loop muted autoPlay playsInline preload="metadata" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES (Estilo Vidro) --- */}
      <section className={`${containerClass} py-8`}>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard icon={<ShoppingBag size={48} />} color="text-brand-blue" title="Produtos Diversos" desc="Canecas, camisetas, azulejos e muito mais para você personalizar" />
          <FeatureCard icon={<Palette size={48} />} color="text-brand-pink" title="100% Personalizável" desc="Adicione textos, imagens e detalhes únicos em cada produto" />
          <FeatureCard icon={<Heart size={48} />} color="text-brand-purple" title="Feito com Carinho" desc="Cada produto é produzido com atenção aos seus detalhes" />
        </div>
      </section>

      {/* --- CARROSSEL DE PRODUTOS --- */}
      <section id="destaques" className="py-16 my-12 relative">
        <div className="absolute inset-0 bg-brand-blue/5 -skew-y-2 transform origin-left -z-10"></div>

        <div className={containerClass}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-brand-dark">Destaques</h2>
              <p className="text-gray-500 mt-1">Os queridinhos dos nossos clientes</p>
            </div>

            {/* Navegação */}
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-brand-blue hover:text-white transition active:scale-95 cursor-pointer">
                <ChevronLeft size={24} />
              </button>
              <button onClick={() => scroll('right')} className="p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-brand-blue hover:text-white transition active:scale-95 cursor-pointer">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          {/* Lista de Cards */}
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto pb-12 pt-4 px-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Mensagem se não houver produtos */}
            {products.length === 0 && <p className="text-gray-400 pl-4">A carregar produtos...</p>}

            {products.map((product) => (
              <div key={product.id} className="min-w-[300px] snap-center">
                <ProductCard
                  id={product.id}
                  title={product.name}
                  description={product.description}
                  price={product.price}
                  // Tenta usar image, se não existir tenta image_url (depende do nome da coluna no banco)
                  image={product.image_url}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className={`${containerClass} py-12 pb-24`}>
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-blue/10 to-brand-pink/10 rounded-[3rem] p-12 text-center border border-white/50 backdrop-blur-sm shadow-xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-brand-blue/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-700">Pronto para criar algo único?</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Comece agora e transforme suas ideias em produtos personalizados incríveis!
            </p>
            <Link to="/produtos" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-blue to-brand-pink text-white rounded-2xl h-16 px-12 text-xl font-bold shadow-lg hover:shadow-glow-blue hover:-translate-y-1 transition-all duration-300">
              Começar Agora
            </Link>
          </div>
        </div>
      </section>

    </motion.div>
  );
};

// Componente FeatureCard 
const FeatureCard = ({ icon, color, title, desc }) => (
  <div className="text-center p-8 rounded-[2rem] bg-white shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 h-full flex flex-col items-center group">
    <div className={`${color} mb-6 group-hover:scale-110 transition-transform duration-500`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

export default Home;