import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, User, Phone, MapPin, Lock, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const Perfil = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [personalData, setPersonalData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  const [addressData, setAddressData] = useState({
    phone: '',
    street: '',
    city: '',
    postal_code: '',
    country: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Proteção de rota - redireciona se não logado
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Carrega dados do perfil ao montar
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setPersonalData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: user.email,
          });

          setAddressData({
            phone: data.phone || '',
            street: data.street || '',
            city: data.city || '',
            postal_code: data.postal_code || '',
            country: data.country || '',
          });
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Salva dados pessoais
  const handleSavePersonalData = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: personalData.first_name,
          last_name: personalData.last_name,
        })
        .eq('id', user.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Dados pessoais atualizados com sucesso! ✨' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar dados pessoais' });
    } finally {
      setSaveLoading(false);
    }
  };

  // Salva endereço
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: addressData.phone,
          street: addressData.street,
          city: addressData.city,
          postal_code: addressData.postal_code,
          country: addressData.country,
        })
        .eq('id', user.id);

      if (error) {
        // Se falhar por erro de coluna, mostra mensagem específica
        if (error.message.includes('column')) {
          setMessage({ 
            type: 'warning', 
            text: 'Funcionalidade de endereço em breve disponível 🚧' 
          });
        } else {
          throw error;
        }
      } else {
        setMessage({ type: 'success', text: 'Endereço atualizado com sucesso! 📍' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar endereço' });
    } finally {
      setSaveLoading(false);
    }
  };

  // Altera senha
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres');
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Senha alterada com sucesso! 🔒' });
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao alterar senha' });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-8 md:px-16 lg:px-32 py-12 md:py-20"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Meu Perfil
          </h1>
          <p className="text-gray-500">Gerencie as suas informações pessoais</p>
        </div>

        {/* Mensagem de Feedback */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border font-medium text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : message.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Dados Pessoais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="text-brand-blue" size={24} />
            Dados Pessoais
          </h2>

          <form onSubmit={handleSavePersonalData} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Nome"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                  value={personalData.first_name}
                  onChange={(e) =>
                    setPersonalData({ ...personalData, first_name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Sobrenome */}
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Sobrenome"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                  value={personalData.last_name}
                  onChange={(e) =>
                    setPersonalData({ ...personalData, last_name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-100 border border-gray-200 outline-none cursor-not-allowed"
                value={personalData.email}
                disabled
              />
              <span className="absolute right-4 top-3.5 text-xs text-gray-400 font-medium">
                Apenas leitura
              </span>
            </div>

            {/* Botão Salvar */}
            <button
              type="submit"
              disabled={saveLoading}
              className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-3.5 rounded-xl shadow-md hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={18} />
                  Salvar Dados Pessoais
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Endereço de Envio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="text-brand-blue" size={24} />
            Endereço de Envio
          </h2>

          <form onSubmit={handleSaveAddress} className="space-y-4">
            {/* Telefone */}
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="tel"
                placeholder="Telefone"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                value={addressData.phone}
                onChange={(e) =>
                  setAddressData({ ...addressData, phone: e.target.value })
                }
              />
            </div>

            {/* Rua */}
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rua e Número"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                value={addressData.street}
                onChange={(e) =>
                  setAddressData({ ...addressData, street: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cidade */}
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cidade"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                  value={addressData.city}
                  onChange={(e) =>
                    setAddressData({ ...addressData, city: e.target.value })
                  }
                />
              </div>

              {/* Código Postal */}
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Código Postal"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                  value={addressData.postal_code}
                  onChange={(e) =>
                    setAddressData({ ...addressData, postal_code: e.target.value })
                  }
                />
              </div>
            </div>

            {/* País */}
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="País"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                value={addressData.country}
                onChange={(e) =>
                  setAddressData({ ...addressData, country: e.target.value })
                }
              />
            </div>

            {/* Botão Salvar */}
            <button
              type="submit"
              disabled={saveLoading}
              className="w-full bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-3.5 rounded-xl shadow-md hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={18} />
                  Salvar Endereço
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Alterar Senha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Lock className="text-brand-blue" size={24} />
            Alterar Senha
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Nova Senha */}
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Nova Senha"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
              />
            </div>

            {/* Confirmar Senha */}
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Confirmar Nova Senha"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />
            </div>

            {/* Botão Alterar */}
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-3.5 rounded-xl shadow-md hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {passwordLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Lock size={18} />
                  Alterar Senha
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Perfil;
