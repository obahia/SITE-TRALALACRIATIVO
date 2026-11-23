import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { normalizeEmail } from '../utils/authErrors';

const AuthContext = createContext();

const siteOrigin = () => window.location.origin;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  // true quando o utilizador chega pelo link "recuperar palavra-passe" do email
  // Lido no primeiro render: o Supabase pode emitir PASSWORD_RECOVERY antes de a subscrição existir.
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(
    () => typeof window !== 'undefined' && window.location.hash.includes('type=recovery')
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        setIsLoginModalOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async (email, password, firstName, lastName) => {
    const first = firstName.trim();
    const last = lastName.trim();
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: {
        emailRedirectTo: siteOrigin(),
        data: {
          first_name: first,
          last_name: last,
          full_name: `${first} ${last}`,
        },
      },
    });
    if (error) throw error;

    // Com confirmação de email ativa, o Supabase não devolve erro para um email
    // já registado: devolve um utilizador sem identidades. Tratamos como erro.
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      const exists = new Error('User already registered');
      exists.code = 'user_already_exists';
      throw exists;
    }
    return data;
  }, []);

  const resendConfirmation = useCallback(async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizeEmail(email),
      options: { emailRedirectTo: siteOrigin() },
    });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: siteOrigin() },
    });
    if (error) throw error;
    return data;
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
      redirectTo: siteOrigin(),
    });
    if (error) throw error;
    return data;
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setIsPasswordRecovery(false);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({
    user,
    signIn,
    signUp,
    signInWithGoogle,
    resendConfirmation,
    resetPassword,
    updatePassword,
    logout,
    loading,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isPasswordRecovery,
    setIsPasswordRecovery,
  }), [user, signIn, signUp, signInWithGoogle, resendConfirmation, resetPassword, updatePassword, logout, loading, isLoginModalOpen, isPasswordRecovery]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
