import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { supabase } from '../services/supabase';

const FALLBACK_TESTIMONIALS = [
  { id: '1', name: 'Maria Silva', message: 'Adorei a qualidade das canecas! Chegaram bem embaladas e o design ficou perfeito. Recomendo muito!', rating: 5 },
  { id: '2', name: 'João Santos', message: 'Excelente atendimento e produtos de primeira qualidade. As camisetas são super confortáveis.', rating: 5 },
  { id: '3', name: 'Ana Costa', message: 'Os azulejos decorativos transformaram minha cozinha! Muito criativo e bem feito.', rating: 4 },
  { id: '4', name: 'Pedro Oliveira', message: 'Presente perfeito para oferecer no Natal. Entrega rápida e bem apresentado.', rating: 5 },
  { id: '5', name: 'Carla Mendes', message: 'Tote bag de excelente qualidade. Uso todos os dias e ainda está como nova!', rating: 4 },
];

const TestimonialCarousel = () => {
  const scrollRef = useRef(null);
  const [testimonials, setTestimonials] = useState([]);
  const containerClass = "container mx-auto px-8 md:px-16 lg:px-32";

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setTestimonials(FALLBACK_TESTIMONIALS);
        } else {
          setTestimonials(data);
        }
      } catch (err) {
        setTestimonials(FALLBACK_TESTIMONIALS);
      }
    };

    fetchTestimonials();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 340;
      direction === 'left'
        ? current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
        : current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
      />
    ));
  };

  return (
    <section className="py-16 my-12 relative bg-gray-50/50">
      <div className={containerClass}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-brand-dark">O Que Dizem Os Nossos Clientes</h2>
            <p className="text-gray-500 mt-1">Histórias reais de quem ama os nossos produtos</p>
          </div>

          {/* Navegação */}
          <div className="flex gap-2">
            <button 
              onClick={() => scroll('left')} 
              className="p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-brand-blue hover:text-white transition active:scale-95 cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-3 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-brand-blue hover:text-white transition active:scale-95 cursor-pointer"
            >
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
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="min-w-[300px] md:min-w-[350px] snap-center bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            >
              <Quote size={24} className="text-brand-blue/30 mb-3" />
              <p className="text-gray-600 text-sm mb-4 italic">"{testimonial.message}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-700 text-sm">{testimonial.name}</p>
                  <div className="flex gap-0.5">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
