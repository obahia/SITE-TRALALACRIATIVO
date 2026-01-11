import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading, setIsLoginModalOpen } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setIsLoginModalOpen(true);
    }
  }, [user, loading, setIsLoginModalOpen]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redireciona para home mas mantém o estado, ou apenas mostra nada enquanto o modal abre
    // A opção mais amigável é redirecionar para Home se ele tentar acessar direto pela URL
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
