import React, { useState, useEffect } from 'react'; // Adicionei useEffect
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import LoginModal from './LoginModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [nomeExibicao, setNomeExibicao] = useState(''); // Estado para guardar o nome vindo do banco

  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout, isLoginModalOpen, setIsLoginModalOpen } = useAuth();

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
  const navLinkStyle = "text-base font-bold text-gray-600 px-4 py-2 rounded-md transition-all duration-300 hover:bg-[#e8b65a] hover:text-white hover:shadow-md";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 h-24 flex items-center transition-all shadow-sm">
        <div className={`${containerClass} w-full flex items-center justify-between`}>

          <Link to="/" className="flex items-center gap-4 hover:scale-105 transition-transform duration-300 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-pink rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              <img src="/assets/logo.png" alt="Logo" className="relative w-20 h-20 object-cover rounded-full border-white shadow-lg" />
            </div>
            <span className="text-2xl font-bold text-brand-dark hidden sm:block">Tralalá Criativo</span>
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className={navLinkStyle}>Início</Link>
            <Link to="/produtos" className={navLinkStyle}>Produtos</Link>
            <Link to="/sobre" className={navLinkStyle}>Sobre Nós</Link>

            {/* Botão Carrinho */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition cursor-pointer ml-1 text-brand-dark group"
            >
              <ShoppingCart className="w-6 h-6 group-hover:text-[#e8b65a] transition-colors" />
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
            <button onClick={() => setIsCartOpen(true)} className="relative text-gray-600">
              <ShoppingCart size={28} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-pink text-[10px] font-bold text-white flex items-center justify-center">{cartCount}</span>}
            </button>

            <button className="text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>

        {/* Dropdown Mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 p-6 absolute top-24 left-0 w-full shadow-xl flex flex-col gap-4 z-40">
            {/* Opção de Login Mobile */}
            {user ? (
              <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg mb-2">
                <span className="font-bold text-brand-blue text-sm flex items-center gap-2">
                  <User size={16} />
                  {/* Nome no mobile também atualizado */}
                  {nomeExibicao || user.email}
                </span>
                <button onClick={logout} className="text-xs text-red-500 font-bold border border-red-200 px-2 py-1 rounded bg-white">Sair</button>
              </div>
            ) : (
              <button onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mb-2">
                <User size={18} /> Entrar na Conta
              </button>
            )}

            <Link to="/" onClick={() => setIsMenuOpen(false)} className={`block text-center ${navLinkStyle}`}>Início</Link>
            <Link to="/produtos" onClick={() => setIsMenuOpen(false)} className={`block text-center ${navLinkStyle}`}>Produtos</Link>
            <Link to="/sobre" onClick={() => setIsMenuOpen(false)} className={`block text-center ${navLinkStyle}`}>Sobre Nós</Link>
          </div>
        )}
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Header;