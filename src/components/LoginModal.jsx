import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, User, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose }) => {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        if (!formData.firstName || !formData.lastName) {
          throw new Error('Preenche o nome e o apelido');
        }
        if (formData.password.length < 6) {
          setPasswordError('A palavra-passe deve ter pelo menos 6 caracteres');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setPasswordError('As palavras-passe nao coincidem');
          return;
        }

        await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );

        setSuccessMessage('Conta criada com sucesso! Verifica o teu email para confirmar a conta.');
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 3000);
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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetSuccess('');

    try {
      if (!resetEmail) {
        throw new Error('Preenche o email');
      }

      await resetPassword(resetEmail);
      setResetSuccess(`Link de recuperacao enviado para ${resetEmail}`);
      setResetEmail('');
      setTimeout(() => {
        setIsForgotPassword(false);
        setResetSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Erro ao enviar link de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setResetSuccess('');
    setSuccessMessage('');
    setPasswordError('');
    setIsForgotPassword(false);
    setResetEmail('');
    setFormData({ email: '', password: '', firstName: '', lastName: '', confirmPassword: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - sem animação, aparece instantaneamente */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 z-[60] animate-[fadeIn_0.1s_ease-out]"
        style={{ animationFillMode: 'forwards' }}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
        w-[95%] max-w-md bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden
        animate-[fadeIn_0.15s_ease-out]"
        style={{ animationFillMode: 'forwards' }}
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
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors duration-150 cursor-pointer
                ${!isRegistering
                  ? 'bg-white text-brand-blue shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              ENTRAR
            </button>

            <button
              type="button"
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors duration-150 cursor-pointer
                ${isRegistering
                  ? 'bg-white text-brand-pink shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              REGISTAR
            </button>
          </div>

          {/* Erro - sem animação */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100 font-medium flex items-center gap-2">
              {error}
            </div>
          )}

          {/* Sucesso In-App */}
          {successMessage && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-4 border border-green-100 font-medium flex items-center gap-2">
              {successMessage}
            </div>
          )}

          {/* Sucesso - sem animação */}
          {resetSuccess && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-4 border border-green-100 font-medium flex items-center gap-2">
              {resetSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome / Sobrenome - transição de altura com CSS */}
            <div
              className={`flex gap-3 overflow-hidden transition-all duration-150 ${isRegistering ? 'max-h-20 opacity-100 mb-4' : 'max-h-0 opacity-0 -mb-4'
                }`}
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
                  placeholder="Apelido"
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
            <div className="space-y-4 transition-all duration-150">
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Palavra-passe"
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue transition-colors"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (passwordError) setPasswordError('');
                  }}
                  onBlur={() => {
                    if (formData.password && formData.password.length < 6) {
                      setPasswordError('A palavra-passe deve ter pelo menos 6 caracteres');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password - only visible in register mode */}
              <div
                className={`relative overflow-hidden transition-all duration-150 ${isRegistering ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required={isRegistering}
                  placeholder="Confirmar palavra-passe"
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue transition-colors"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (passwordError) setPasswordError('');
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Error */}
              {passwordError && (
                <p className="text-red-500 text-sm font-medium pl-1 -mt-2 mb-2">{passwordError}</p>
              )}
            </div>

            {/* Esqueci a senha - apenas no tab ENTRAR */}
            {!isRegistering && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                  }}
                  className="text-sm text-brand-blue hover:text-brand-pink font-semibold transition-colors cursor-pointer"
                >
                  Esqueci a senha
                </button>
              </div>
            )}

            {/* Formulário de Reset Password - mostrado quando isForgotPassword é true */}
            {isForgotPassword && (
              <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-700 font-medium">Recuperar Senha</p>
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input
                      type="email"
                      placeholder="exemplo@email.com"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue transition-colors"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-2.5 rounded-xl hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        'Enviar link'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setResetEmail('');
                        setError('');
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-300 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

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
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continuar com Google
          </button>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default LoginModal;
