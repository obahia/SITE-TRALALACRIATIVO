import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'motion/react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { OCCASIONS } from '../data/occasions';
import LoginModal from './LoginModal';
import NewPasswordModal from './NewPasswordModal';

const containerClass = 'container mx-auto px-4 sm:px-8 md:px-12 xl:px-24';

const navLinkClass = ({ isActive }) =>
  `text-[15px] font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
    isActive ? 'bg-tile-sky text-ink' : 'text-ink hover:bg-tile-sky'
  }`;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOccasionsOpen, setIsOccasionsOpen] = useState(false);
  const [nomeExibicao, setNomeExibicao] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const occasionsRef = useRef(null);

  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout, isLoginModalOpen, setIsLoginModalOpen } = useAuth();
  const location = useLocation();

  // Fecha menus ao mudar de página (ajuste durante o render, sem efeito)
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setIsMenuOpen(false);
    setIsOccasionsOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isOccasionsOpen) return undefined;
    const onDown = (e) => {
      if (occasionsRef.current && !occasionsRef.current.contains(e.target)) setIsOccasionsOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setIsOccasionsOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOccasionsOpen]);

  useEffect(() => {
    let cancelled = false;
    async function carregarPerfil() {
      if (!user) {
        setNomeExibicao('');
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('first_name, role')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setNomeExibicao(data?.first_name || user.user_metadata?.first_name || user.email.split('@')[0]);
      setIsAdmin(data?.role === 'admin');
    }
    carregarPerfil();
    return () => { cancelled = true; };
  }, [user]);

  const occasionsActive = location.pathname.startsWith('/ocasioes');

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-brand-light h-20 flex items-center">
        <div className={`${containerClass} w-full flex items-center justify-between gap-4`}>
          <Link to="/" className="flex items-center gap-3 shrink-0 cursor-pointer" aria-label="Tralalá Criativo, página inicial">
            <img src="/assets/logo.png" alt="" className="w-14 h-14 object-cover rounded-full" />
            <span className="text-xl font-bold text-brand-dark hidden sm:block">Tralalá Criativo</span>
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Principal">
            <NavLink to="/produtos" className={navLinkClass}>Loja</NavLink>

            <div className="relative" ref={occasionsRef}>
              <button
                type="button"
                aria-expanded={isOccasionsOpen}
                aria-haspopup="true"
                onClick={() => setIsOccasionsOpen((v) => !v)}
                className={`${navLinkClass({ isActive: occasionsActive })} inline-flex items-center gap-1`}
              >
                Ocasiões
                <ChevronDown size={16} className={`transition-transform ${isOccasionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOccasionsOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-[0_18px_40px_-16px_rgba(15,23,42,0.35)] p-2 animate-fade-in" /* taste-skill-ignore: menu suspenso */>
                  {OCCASIONS.map((o) => (
                    <Link
                      key={o.slug}
                      to={`/ocasioes/${o.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-brand-light transition-colors"
                    >
                      <img src={o.image} alt="" className="w-11 h-11 rounded-lg object-cover bg-gray-100" loading="lazy" />
                      <span className="font-bold text-gray-800">{o.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/sobre" className={navLinkClass}>Sobre nós</NavLink>
            <NavLink to="/localizacao" className={navLinkClass}>Contactos</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={(s) => `flex items-center gap-1.5 ${navLinkClass(s)}`}>
                <Settings size={15} /> Admin
              </NavLink>
            )}

            <Link
              to="/orcamento"
              className="ml-2 px-5 py-2.5 rounded-full font-bold text-sm bg-pink-ink text-white hover:brightness-110 active:scale-[0.98] transition"
            >
              Pedir orçamento
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Abrir carrinho${cartCount ? `, ${cartCount} artigos` : ''}`}
              className="relative p-2.5 ml-1 hover:bg-gray-100 rounded-full transition cursor-pointer text-gray-800"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-brand-pink text-xs font-bold text-white flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-1 ml-3">
                <Link
                  to="/perfil"
                  className="flex items-center gap-2 text-sm font-bold text-brand-blue hover:bg-brand-blue/10 px-3 py-2 rounded-lg transition-colors"
                >
                  <User size={18} />
                  <span className="max-w-[120px] truncate capitalize">{nomeExibicao || 'Perfil'}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Terminar sessão"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="ml-2 flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-black transition-colors cursor-pointer"
              >
                <User size={16} /> Entrar
              </button>
            )}
          </nav>

          {/* MOBILE */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Abrir carrinho${cartCount ? `, ${cartCount} artigos` : ''}`}
              className="relative p-2.5 text-gray-700 cursor-pointer"
            >
              <ShoppingCart size={26} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-1 rounded-full bg-brand-pink text-[10px] font-bold text-white flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className="p-2.5 text-gray-700 cursor-pointer"
              aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
              <Motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className="fixed top-0 right-0 h-dvh w-[86%] max-w-sm bg-white shadow-2xl z-50 flex flex-col lg:hidden overflow-y-auto" /* taste-skill-ignore: gaveta sobre a página */
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
              >
                <div className="p-5 flex flex-col gap-5 flex-1">
                  <div className="flex justify-between items-center pb-3">
                    <span className="text-xl font-bold text-brand-dark">Menu</span>
                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Fechar menu"
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {user ? (
                    <div className="flex justify-between items-center bg-brand-blue/10 p-3.5 rounded-xl">
                      <Link to="/perfil" className="font-bold text-brand-blue flex items-center gap-2 min-w-0">
                        <User size={18} className="shrink-0" />
                        <span className="truncate">{nomeExibicao || user.email}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => { logout(); setIsMenuOpen(false); }}
                        className="text-sm text-red-700 font-bold px-3 py-1.5 rounded-full bg-paper hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      >
                        Sair
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }}
                      className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors cursor-pointer"
                    >
                      <User size={18} /> Entrar na conta
                    </button>
                  )}

                  <nav className="flex flex-col gap-1" aria-label="Principal">
                    <NavLink to="/" end className={navLinkClass}>Início</NavLink>
                    <NavLink to="/produtos" className={navLinkClass}>Loja</NavLink>
                    <p className="px-3.5 pt-3 pb-1 text-sm font-bold text-gray-500">Ocasiões</p>
                    {OCCASIONS.map((o) => (
                      <NavLink key={o.slug} to={`/ocasioes/${o.slug}`} className={(s) => `pl-6 ${navLinkClass(s)}`}>
                        {o.name}
                      </NavLink>
                    ))}
                    <div className="h-3" aria-hidden="true" />
                    <NavLink to="/sobre" className={navLinkClass}>Sobre nós</NavLink>
                    <NavLink to="/localizacao" className={navLinkClass}>Contactos</NavLink>
                    <NavLink to="/informacoes" className={navLinkClass}>Envios e encomendas</NavLink>
                    {isAdmin && (
                      <NavLink to="/admin" className={(s) => `flex items-center gap-2 ${navLinkClass(s)}`}>
                        <Settings size={16} /> Painel admin
                      </NavLink>
                    )}
                  </nav>

                  <Link
                    to="/orcamento"
                    className="mt-auto w-full text-center bg-brand-pink text-white py-3.5 rounded-xl font-bold hover:brightness-110 transition"
                  >
                    Pedir orçamento
                  </Link>
                </div>
              </Motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <NewPasswordModal />
    </>
  );
};

export default Header;
