import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import LoginModal from './LoginModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [nomeExibicao, setNomeExibicao] = useState(''); // Estado para guardar o nome vindo do banco

  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout, isLoginModalOpen, setIsLoginModalOpen } = useAuth();
  const location = useLocation();

  // Scroll lock para o menu mobile
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // --- NOVA LÓGICA: Buscar o nome na tabela profiles ---
  useEffect(() => {
    async function pegarNomeDoPerfil() {
      if (user) {
        // Busca na tabela profiles onde o ID é igual ao do usuário logado
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (data && data.first_name) {
          setNomeExibicao(data.first_name);
        } else {
          // Fallback: se não achar, usa o e-mail cortado
          setNomeExibicao(user.email.split('@')[0]);
        }
      } else {
        setNomeExibicao(''); // Limpa se deslogar
      }
    }

    pegarNomeDoPerfil();
  }, [user]); // Roda toda vez que o usuário muda (login/logout)
  // -----------------------------------------------------

  const containerClass = "container mx-auto px-8 md:px-16 lg:px-32";
  
  const getNavLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return `text-base font-bold px-4 py-2 rounded-md transition-all duration-300 cursor-pointer ${
      isActive 
        ? 'bg-brand-blue/10 text-brand-blue shadow-sm' 
        : 'text-gray-600 hover:bg-brand-blue/10 hover:text-brand-blue hover:shadow-md'
    }`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 h-24 flex items-center transition-all shadow-sm">
        <div className={`${containerClass} w-full flex items-center justify-between`}>

          <Link to="/" className="flex items-center gap-4 hover:scale-105 transition-transform duration-300 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-pink rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              <img src="/assets/logo.png" alt="Logo" className="relative w-20 h-20 object-cover rounded-full border-white shadow-lg" />
            </div>
            <span className="text-2xl font-bold text-brand-dark hidden sm:block">Tralalá Criativo</span>
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className={getNavLinkStyle("/")}>Início</Link>
            <Link to="/produtos" className={getNavLinkStyle("/produtos")}>Produtos</Link>
            <Link to="/sobre" className={getNavLinkStyle("/sobre")}>Sobre Nós</Link>

            {/* Botão Carrinho */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition cursor-pointer ml-1 text-brand-dark group"
            >
              <ShoppingCart className="w-6 h-6 group-hover:text-brand-blue transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-pink text-xs font-bold text-white flex items-center justify-center animate-bounce shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* --- ÁREA DO USUÁRIO --- */}
            {user ? (
              // SE ESTIVER LOGADO
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                <div className="flex items-center gap-2 text-sm font-bold text-brand-blue">
                  <User size={18} />
                  {/* AQUI MOSTRAMOS O NOME VINDO DO BANCO */}
                  <span className="max-w-[120px] truncate capitalize">
                    {nomeExibicao || 'Carregando...'}
                  </span>
                </div>
                <Link
                  to="/perfil"
                  title="Meu Perfil"
                  className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-full transition-colors cursor-pointer"
                >
                  <User size={18} />
                </Link>
                <button
                  onClick={logout}
                  title="Sair"
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer "
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              // SE NÃO ESTIVER LOGADO
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="ml-2 flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full font-bold text-sm shadow-md hover:bg-black hover:scale-105 transition-all cursor-pointer"
              >
                <User size={16} /> Entrar
              </button>
            )}


          </nav>

          {/* MENU MOBILE */}
          <div className="flex items-center gap-4 md:hidden">
            <button onClick={() => setIsCartOpen(true)} className="relative text-gray-600 cursor-pointer">
              <ShoppingCart size={28} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-pink text-[10px] font-bold text-white flex items-center justify-center">{cartCount}</span>}
            </button>

            <button className="text-gray-600 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>

        {/* Dropdown Mobile substituído por Side-Drawer Animado */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 md:hidden cursor-pointer"
              />
              
              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white shadow-2xl z-50 flex flex-col md:hidden overflow-y-auto"
              >
                <div className="p-6 flex flex-col gap-6 flex-1">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-xl font-bold text-brand-dark">Menu</span>
                    <button 
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 text-gray-500 hover:text-brand-pink hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Opção de Login Mobile */}
                  {user ? (
                    <div className="flex justify-between items-center bg-brand-blue/5 p-4 rounded-xl border border-brand-blue/10">
                      <span className="font-bold text-brand-blue flex items-center gap-2 max-w-[70%] truncate">
                        <User size={18} className="shrink-0" />
                        <span className="truncate">{nomeExibicao || user.email}</span>
                      </span>
                      <button 
                        onClick={() => { logout(); setIsMenuOpen(false); }} 
                        className="text-xs text-red-500 font-bold border border-red-200 px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      >
                        Sair
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} 
                      className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:bg-black transition-all cursor-pointer"
                    >
                      <User size={18} /> Entrar na Conta
                    </button>
                  )}

                  <nav className="flex flex-col gap-2 mt-2">
                    <Link to="/" onClick={() => setIsMenuOpen(false)} className={`block ${getNavLinkStyle("/")}`}>Início</Link>
                    <Link to="/produtos" onClick={() => setIsMenuOpen(false)} className={`block ${getNavLinkStyle("/produtos")}`}>Produtos</Link>
                    <Link to="/sobre" onClick={() => setIsMenuOpen(false)} className={`block ${getNavLinkStyle("/sobre")}`}>Sobre Nós</Link>
                    {user && (
                      <Link to="/perfil" onClick={() => setIsMenuOpen(false)} className={`block ${getNavLinkStyle("/perfil")}`}>Meu Perfil</Link>
                    )}
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Header;