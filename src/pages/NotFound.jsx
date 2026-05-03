import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center px-8 md:px-16 lg:px-32"
    >
      <div className="text-center">
        <h1 className="text-8xl font-bold text-brand-blue mb-4">404</h1>
        <h2 className="text-3xl font-fredoka font-bold text-gray-800 mb-4">
          Página não encontrada
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Desculpe, a página que você está procurando não existe.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-brand-blue text-white font-fredoka font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-300"
        >
          Voltar à Home
        </Link>
      </div>
    </motion.div>
  );
}
