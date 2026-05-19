// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext';
import CartSidebar from './components/CartSideBar';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminLayout from './components/AdminLayout';
import { LoadingSpinner } from './components/ui';

// Core pages (loaded immediately)
import Home from './pages/home';
import Produtos from './pages/produtos';
import NotFound from './pages/NotFound';

// Lazy-loaded pages
const Sobre = lazy(() => import('./pages/Sobre'));
const ProdutoDetalhe = lazy(() => import('./pages/produtodetalhe'));
const Sucesso = lazy(() => import('./pages/sucesso'));
const Cancelado = lazy(() => import('./pages/cancelado'));
const Perfil = lazy(() => import('./pages/perfil'));
const Localizacao = lazy(() => import('./pages/localizacao'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingSpinner size={32} />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/sobre" element={<Suspense fallback={<LoadingFallback />}><Sobre /></Suspense>} />
        <Route path="/localizacao" element={<Suspense fallback={<LoadingFallback />}><Localizacao /></Suspense>} />
        <Route path="/produto/:id" element={<Suspense fallback={<LoadingFallback />}><ProdutoDetalhe /></Suspense>} />
        <Route path="/sucesso" element={<Suspense fallback={<LoadingFallback />}><Sucesso /></Suspense>} />
        <Route path="/cancelado" element={<Suspense fallback={<LoadingFallback />}><Cancelado /></Suspense>} />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <Perfil />
              </Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminOrders />
                </Suspense>
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/produtos"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminProducts />
                </Suspense>
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminUsers />
                </Suspense>
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;