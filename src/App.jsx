// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
// --- IMPORTANTE: O Carrinho ---
import { CartProvider } from './context/CartContext';
import CartSidebar from './components/CartSideBar';
import Home from './pages/home';
import Produtos from './pages/produtos';
import Sobre from './pages/Sobre';
import ProdutoDetalhe from './pages/produtodetalhe';

import Sucesso from './pages/sucesso';
import Cancelado from './pages/cancelado';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/produto/:id" element={<ProdutoDetalhe />} />
        <Route path="/sucesso" element={<Sucesso />} />
        <Route path="/cancelado" element={<Cancelado />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* 1. O CartProvider envolve TUDO dentro do Router */}
        {/* Assim, o Header sabe a quantidade e a página de Detalhe consegue adicionar itens */}
        <CartProvider>

          <Header />

          {/* 2. A Gaveta do Carrinho fica aqui (escondida até clicar) */}
          <CartSidebar />

          <main className="flex-grow">
            <AnimatedRoutes />
          </main>

          <Footer />

        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;