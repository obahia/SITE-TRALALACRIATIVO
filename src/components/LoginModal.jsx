import React, { useEffect, useId, useRef, useState } from 'react';
import { X, Mail, Lock, Loader2, User, Sparkles, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPassword, isValidName } from '../utils/validation';
import { describeAuthError } from '../utils/authErrors';
import { logger } from '../utils/logger';

const EMPTY_FORM = { email: '', password: '', firstName: '', lastName: '', confirmPassword: '' };

const inputClass =
  'w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 ' +
  'focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 transition';

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

const Field = ({ id, label, icon, children }) => {
  const Icon = icon;
  return (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} aria-hidden="true" />
      {children}
    </div>
  </div>
  );
};

const PasswordToggle = ({ shown, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={shown ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-blue"
  >
    {shown ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
);

const LoginModal = ({ isOpen, onClose }) => {
  const { signIn, signUp, signInWithGoogle, resetPassword, resendConfirmation } = useAuth();
  const uid = useId();
  const dialogRef = useRef(null);

  // 'login' | 'register' | 'forgot'
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { kind, message }
  const [notice, setNotice] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const isRegistering = view === 'register';

  const setField = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (error) setError(null);
  };

  const goTo = (next) => {
    setView(next);
    setError(null);
    setNotice('');
    setShowPassword(false);
  };

  const handleClose = () => {
    setView('login');
    setError(null);
    setNotice('');
    setShowPassword(false);
    setForm(EMPTY_FORM);
    onClose();
  };

  // Escape fecha; foco entra no diálogo ao abrir.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    const firstInput = dialogRef.current?.querySelector('input');
    firstInput?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, view]);

  const fail = (err, context) => {
    const described = describeAuthError(err);
    setError(described);
    logger.error('Auth error', { context, code: err?.code, error: err?.message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice('');

    if (!isValidEmail(form.email.trim())) {
      setError({ kind: 'email_invalid', message: 'Escreva um email válido, por exemplo nome@gmail.com.' });
      return;
    }

    if (isRegistering) {
      if (!isValidName(form.firstName) || !isValidName(form.lastName)) {
        setError({ kind: 'name', message: 'Preencha o nome e o apelido.' });
        return;
      }
      if (!isValidPassword(form.password)) {
        setError({ kind: 'weak_password', message: 'A palavra-passe precisa de pelo menos 6 caracteres.' });
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError({ kind: 'mismatch', message: 'As duas palavras-passe não são iguais.' });
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await signUp(form.email, form.password, form.firstName, form.lastName);
        setForm((prev) => ({ ...EMPTY_FORM, email: prev.email }));
        setView('login');
        setNotice('Conta criada. Enviámos um email de confirmação: abra o link e depois entre aqui. Se não o encontrar, veja o spam.');
      } else {
        await signIn(form.email, form.password);
        handleClose();
      }
    } catch (err) {
      fail(err, view);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(form.email.trim())) {
      setError({ kind: 'email_invalid', message: 'Escreva o email com que criou a conta.' });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(form.email);
      setNotice(`Se existir uma conta com ${form.email.trim()}, vai receber um link para criar uma nova palavra-passe.`);
    } catch (err) {
      fail(err, 'forgot');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendConfirmation(form.email);
      setError(null);
      setNotice('Reenviámos o email de confirmação. Veja também a pasta de spam.');
    } catch (err) {
      fail(err, 'resend');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      fail(err, 'google');
    }
  };

  if (!isOpen) return null;

  const titles = {
    login: ['Bem-vindo de volta', 'Entre na sua conta para encomendar.'],
    register: ['Criar conta', 'Para acompanhar encomendas e guardar o carrinho.'],
    forgot: ['Recuperar palavra-passe', 'Enviamos um link para o seu email.'],
  };
  const [title, subtitle] = titles[view];

  return (
    <>
      <div onClick={handleClose} className="fixed inset-0 bg-black/70 z-[60] animate-fade-in" aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="fixed inset-x-3 top-1/2 -translate-y-1/2 mx-auto max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto
          bg-white rounded-3xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] z-[70] animate-fade-in"
      >
        <div className="relative bg-gradient-to-r from-brand-blue to-brand-pink px-6 pt-7 pb-10 text-white text-center">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Sparkles size={28} aria-hidden="true" />
          </div>
          <h2 id={`${uid}-title`} className="text-2xl font-bold">{title}</h2>
          <p className="text-white/90 text-sm mt-1">{subtitle}</p>
        </div>

        <div className="px-6 pb-6">
          {view !== 'forgot' ? (
            <div className="bg-gray-100 rounded-2xl p-1.5 flex -mt-6 mb-6 relative z-10 shadow-md" role="tablist">
              {[
                ['login', 'Entrar', 'text-brand-blue'],
                ['register', 'Criar conta', 'text-brand-pink'],
              ].map(([key, label, activeColor]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={view === key}
                  onClick={() => goTo(key)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer
                    ${view === key ? `bg-white ${activeColor} shadow` : 'text-gray-600 hover:text-gray-800'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => goTo('login')}
              className="-mt-2 mb-4 pt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-pink cursor-pointer"
            >
              <ArrowLeft size={16} /> Voltar a entrar
            </button>
          )}

          <div aria-live="polite">
            {error && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl text-sm mb-4 border border-red-100">
                <p className="font-semibold">{error.message}</p>
                {error.kind === 'invalid_credentials' && (
                  <ul className="mt-2 space-y-1 text-red-700/90 list-disc pl-4">
                    <li>Confirme se o email está bem escrito.</li>
                    <li>Se criou a conta com o Google, use “Continuar com Google”.</li>
                    <li>
                      Não se lembra da palavra-passe?{' '}
                      <button type="button" onClick={() => goTo('forgot')} className="underline font-semibold cursor-pointer">
                        Criar uma nova
                      </button>
                    </li>
                  </ul>
                )}
                {error.kind === 'email_not_confirmed' && (
                  <button type="button" onClick={handleResend} disabled={loading} className="mt-2 underline font-semibold cursor-pointer disabled:opacity-60">
                    Reenviar email de confirmação
                  </button>
                )}
                {error.kind === 'user_already_exists' && (
                  <button type="button" onClick={() => goTo('login')} className="mt-2 underline font-semibold cursor-pointer">
                    Ir para Entrar
                  </button>
                )}
              </div>
            )}
            {notice && (
              <div className="bg-green-50 text-green-800 p-3.5 rounded-xl text-sm mb-4 border border-green-100 font-medium">
                {notice}
              </div>
            )}
          </div>

          {view === 'forgot' ? (
            <form onSubmit={handleForgot} className="space-y-4" noValidate>
              <Field id={`${uid}-email`} label="Email" icon={Mail}>
                <input
                  id={`${uid}-email`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="nome@email.com"
                  className={inputClass}
                  value={form.email}
                  onChange={setField('email')}
                />
              </Field>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-3.5 rounded-xl hover:brightness-110 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enviar link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {isRegistering && (
                <div className="grid grid-cols-2 gap-3">
                  <Field id={`${uid}-first`} label="Nome" icon={User}>
                    <input id={`${uid}-first`} type="text" autoComplete="given-name" className={inputClass} value={form.firstName} onChange={setField('firstName')} />
                  </Field>
                  <Field id={`${uid}-last`} label="Apelido" icon={User}>
                    <input id={`${uid}-last`} type="text" autoComplete="family-name" className={inputClass} value={form.lastName} onChange={setField('lastName')} />
                  </Field>
                </div>
              )}

              <Field id={`${uid}-email`} label="Email" icon={Mail}>
                <input
                  id={`${uid}-email`}
                  type="email"
                  inputMode="email"
                  autoComplete={isRegistering ? 'email' : 'username'}
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="nome@email.com"
                  className={inputClass}
                  value={form.email}
                  onChange={setField('email')}
                />
              </Field>

              <Field id={`${uid}-password`} label="Palavra-passe" icon={Lock}>
                <input
                  id={`${uid}-password`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                  autoCapitalize="none"
                  className={`${inputClass} pr-12`}
                  value={form.password}
                  onChange={setField('password')}
                  aria-describedby={isRegistering ? `${uid}-pw-hint` : undefined}
                />
                <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />
              </Field>
              {isRegistering && (
                <p id={`${uid}-pw-hint`} className="text-xs text-gray-600 -mt-2">Pelo menos 6 caracteres.</p>
              )}

              {isRegistering && (
                <Field id={`${uid}-confirm`} label="Repetir palavra-passe" icon={Lock}>
                  <input
                    id={`${uid}-confirm`}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoCapitalize="none"
                    className={inputClass}
                    value={form.confirmPassword}
                    onChange={setField('confirmPassword')}
                  />
                </Field>
              )}

              {!isRegistering && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => goTo('forgot')}
                    className="text-sm text-brand-blue hover:text-brand-pink font-semibold transition-colors cursor-pointer"
                  >
                    Esqueci-me da palavra-passe
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-bold py-4 rounded-xl shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110
                  ${isRegistering ? 'bg-gradient-to-r from-brand-pink to-brand-purple' : 'bg-gradient-to-r from-brand-blue to-brand-purple'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : isRegistering ? 'Criar conta' : 'Entrar'}
              </button>
            </form>
          )}

          {view !== 'forgot' && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-600 font-semibold">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-semibold text-gray-700 cursor-pointer active:scale-[0.98]"
              >
                <GoogleIcon />
                Continuar com Google
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginModal;
