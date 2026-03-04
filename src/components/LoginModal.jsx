import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, User, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (!formData.firstName || !formData.lastName) {
          throw new Error('Preenche nome e sobrenome');
        }

        if (formData.password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem');
        }

        await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );

        alert('Conta criada! Confirma o e-mail');
        onClose();
      } else {
        await signIn(formData.email, formData.password);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 z-[60] animate-fade-in"
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        w-[95%] max-w-md bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden
        animate-fade-in"
      >
        {/* Header com gradiente */}
        <div className="relative bg-gradient-to-r from-brand-blue to-brand-pink p-6 pb-8">
          {/* Botão X */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} className="text-white" />
          </button>

          {/* Ícone e título */}
          <div className="flex flex-col items-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
              <Sparkles size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">
              {isRegistering ? 'Criar Conta' : 'Bem-vindo de Volta!'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {isRegistering ? 'Junta-te à família Tralalá' : 'Entra na tua conta'}
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 pt-4">
          {/* Tabs - transição rápida com CSS */}
          <div className="bg-gray-100 rounded-2xl p-1.5 flex mb-6 -mt-8 relative z-10 shadow-lg">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors duration-150
                ${!isRegistering
                  ? 'bg-white text-brand-blue shadow-md cursor-default'
                  : 'text-gray-600 hover:text-gray-900 cursor-pointer'
                }`}
            >
              ENTRAR
            </button>

            <button
              type="button"
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors duration-150
                ${isRegistering
                  ? 'bg-white text-brand-pink shadow-md cursor-default'
                  : 'text-gray-600 hover:text-gray-900 cursor-pointer'
                }`}
            >
              REGISTAR
            </button>
          </div>

          {/* Erro - sem animação */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100 font-medium flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome / Sobrenome - sempre visível quando registro, visível quando não */}
            <div
              className={`flex gap-3 transition-all duration-200 ${isRegistering ? 'opacity-100 visible' : 'max-md:max-h-0 max-md:opacity-0 max-md:invisible'
                }`}
              style={{ minHeight: isRegistering ? 'auto' : '0' }}
            >
              <div className="relative flex-1">
                <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Nome"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue transition-colors"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="relative flex-1">
                <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Sobrenome"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue transition-colors"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue transition-colors"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Senha"
                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue transition-colors"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirmar Password - só mostra no registro */}
            <div
              className={`relative overflow-hidden transition-all duration-200 ${isRegistering ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required={isRegistering}
                  placeholder="Confirmar Senha"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue transition-colors"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão principal */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
                ${isRegistering
                  ? 'bg-gradient-to-r from-brand-pink to-brand-purple hover:brightness-110'
                  : 'bg-gradient-to-r from-brand-blue to-brand-purple hover:brightness-110'
                }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isRegistering ? (
                <>
                  <Sparkles size={18} />
                  CRIAR CONTA
                </>
              ) : (
                'ENTRAR'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-semibold uppercase">
              Ou continuar com
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl
            border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors duration-150 font-semibold text-gray-700 cursor-pointer active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
