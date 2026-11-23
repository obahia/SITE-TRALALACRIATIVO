import React, { useEffect, useId, useRef, useState } from 'react';
import { Lock, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { describeAuthError } from '../utils/authErrors';

// Aparece quando o utilizador abre o link "recuperar palavra-passe" do email.
const NewPasswordModal = () => {
  const { isPasswordRecovery, setIsPasswordRecovery, updatePassword } = useAuth();
  const uid = useId();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef(null);

  const visible = isPasswordRecovery || done;
  useEffect(() => {
    if (visible) dialogRef.current?.querySelector('input')?.focus();
  }, [visible]);

  useEffect(() => {
    if (!done) return undefined;
    const timer = setTimeout(() => {
      setDone(false);
      setIsPasswordRecovery(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [done, setIsPasswordRecovery]);

  if (!isPasswordRecovery && !done) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('A palavra-passe precisa de pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As duas palavras-passe não são iguais.');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setPassword('');
      setConfirm('');
    } catch (err) {
      setError(describeAuthError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15 transition';

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[80]" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="fixed inset-x-3 top-1/2 -translate-y-1/2 mx-auto max-w-md bg-white rounded-3xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] z-[90] p-6"
      >
        {done ? (
          <div className="text-center py-6" aria-live="polite">
            <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
              <Check size={28} />
            </div>
            <h2 id={`${uid}-title`} className="text-2xl font-bold text-gray-800">Palavra-passe alterada</h2>
            <p className="text-gray-600 mt-2">Já tem sessão iniciada.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <h2 id={`${uid}-title`} className="text-2xl font-bold text-gray-800">Criar nova palavra-passe</h2>
              <p className="text-gray-600 text-sm mt-1">Escolha uma palavra-passe nova para a sua conta.</p>
            </div>
            {error && (
              <p className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100 font-semibold" aria-live="polite">{error}</p>
            )}
            {[
              ['new', 'Nova palavra-passe', password, setPassword],
              ['confirm', 'Repetir palavra-passe', confirm, setConfirm],
            ].map(([key, label, value, setter]) => (
              <div key={key}>
                <label htmlFor={`${uid}-${key}`} className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden="true" />
                  <input
                    id={`${uid}-${key}`}
                    type="password"
                    autoComplete="new-password"
                    className={inputClass}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-3.5 rounded-xl hover:brightness-110 transition disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Guardar palavra-passe'}
            </button>
            <button
              type="button"
              onClick={() => setIsPasswordRecovery(false)}
              className="w-full py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Agora não
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default NewPasswordModal;
