import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, User, Phone, MapPin, Lock, Save, Loader2, Package, ChevronDown, ChevronUp, Eye, EyeOff, Truck } from 'lucide-react';
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

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
            country: data.country || 'Portugal',
          });
        }
       } catch (err) {
         // Error already handled by state
       } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      setOrdersLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setOrders(data || []);
       } catch (err) {
         setOrders([]);
       } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  const validateName = (name) => {
    if (!name || name.trim().length < 2) return false;
    return /^[^0-9]+$/.test(name);
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const cleanPhone = phone.replace(/\s+/g, '');
    return /^(?:\+351)?9[1236]\d{7}$/.test(cleanPhone);
  };

  const validatePostalCode = (postalCode) => {
    if (!postalCode) return true;
    return /^\d{4}-\d{3}$/.test(postalCode);
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: 'bg-gray-200', width: 'w-0' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    
    if (score === 1) return { score, text: 'Fraca', color: 'bg-red-500', width: 'w-1/3' };
    if (score === 2) return { score, text: 'Média', color: 'bg-yellow-500', width: 'w-2/3' };
    if (score === 3) return { score, text: 'Forte', color: 'bg-green-500', width: 'w-full' };
    return { score: 0, text: '', color: 'bg-gray-200', width: 'w-0' };
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0,00 €';
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handleSavePersonalData = async (e) => {
    e.preventDefault();
    
    const newErrors = { ...errors };
    let hasError = false;

    if (!validateName(personalData.first_name)) {
      newErrors.first_name = 'Nome inválido. Mínimo 2 caracteres, sem números.';
      hasError = true;
    } else {
      delete newErrors.first_name;
    }

    if (!validateName(personalData.last_name)) {
      newErrors.last_name = 'Apelido inválido. Mínimo 2 caracteres, sem números.';
      hasError = true;
    } else {
      delete newErrors.last_name;
    }

    setErrors(newErrors);
    if (hasError) return;

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

      setMessage({ type: 'success', text: 'Dados pessoais atualizados com sucesso' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao guardar dados pessoais' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    
    const newErrors = { ...errors };
    let hasError = false;

    if (!validatePhone(addressData.phone)) {
      newErrors.phone = 'Telefone inválido. Formato: 9XXXXXXXX ou +3519XXXXXXXX';
      hasError = true;
    } else {
      delete newErrors.phone;
    }

    if (!validatePostalCode(addressData.postal_code)) {
      newErrors.postal_code = 'Código postal inválido. Formato: XXXX-XXX';
      hasError = true;
    } else {
      delete newErrors.postal_code;
    }

    setErrors(newErrors);
    if (hasError) return;

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
          country: addressData.country || 'Portugal',
        })
        .eq('id', user.id);

      if (error) {
        if (error.message.includes('column')) {
          setMessage({ 
            type: 'warning', 
            text: 'Funcionalidade de morada em breve disponível' 
          });
        } else {
          throw error;
        }
      } else {
        setMessage({ type: 'success', text: 'Morada atualizada com sucesso' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao guardar morada' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    const newErrors = { ...errors };
    let hasError = false;

    const pass = passwordData.newPassword;
    if (pass.length < 8 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) {
      newErrors.newPassword = 'A palavra-passe deve ter no mínimo 8 caracteres, 1 maiúscula e 1 número.';
      hasError = true;
    } else {
      delete newErrors.newPassword;
    }

    if (pass !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'As palavras-passe não coincidem.';
      hasError = true;
    } else {
      delete newErrors.confirmPassword;
    }

    setErrors(newErrors);
    if (hasError) return;

    setPasswordLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Palavra-passe alterada com sucesso' });
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao alterar palavra-passe' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pendente: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendente' },
      pago: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pago' },
      enviado: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Enviado' },
      entregue: { bg: 'bg-green-100', text: 'text-green-700', label: 'Entregue' }
    };

    const config = statusConfig[status] || statusConfig.pendente;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (!user) return null;

  const pwdStrength = getPasswordStrength(passwordData.newPassword);

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
            O Meu Perfil
          </h1>
          <p className="text-gray-500">Faça a gestão das suas informações pessoais</p>
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
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="first_name">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    id="first_name"
                    type="text"
                    placeholder="Nome"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border ${errors.first_name ? 'border-red-500' : 'border-gray-200'} focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all`}
                    value={personalData.first_name}
                    onChange={(e) => {
                      setPersonalData({ ...personalData, first_name: e.target.value });
                      if (errors.first_name) setErrors({...errors, first_name: null});
                    }}
                    required
                  />
                </div>
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>

              {/* Apelido */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="last_name">
                  Apelido
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    id="last_name"
                    type="text"
                    placeholder="Apelido"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border ${errors.last_name ? 'border-red-500' : 'border-gray-200'} focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all`}
                    value={personalData.last_name}
                    onChange={(e) => {
                      setPersonalData({ ...personalData, last_name: e.target.value });
                      if (errors.last_name) setErrors({...errors, last_name: null});
                    }}
                    required
                  />
                </div>
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  id="email"
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
            </div>

            {/* Botão Guardar */}
            <button
              type="submit"
              disabled={saveLoading}
              className="w-full mt-4 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-3.5 rounded-xl shadow-md hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={18} />
                  Guardar Dados Pessoais
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
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  id="phone"
                  type="tel"
                  placeholder="Telefone"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all`}
                  value={addressData.phone}
                  onChange={(e) => {
                    setAddressData({ ...addressData, phone: e.target.value });
                    if (errors.phone) setErrors({...errors, phone: null});
                  }}
                  onBlur={(e) => {
                    if (e.target.value && !validatePhone(e.target.value)) {
                      setErrors({...errors, phone: 'Telefone inválido. Formato: 9XXXXXXXX ou +3519XXXXXXXX'});
                    }
                  }}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Morada */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="street">
                Morada
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  id="street"
                  type="text"
                  placeholder="Morada"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                  value={addressData.street}
                  onChange={(e) =>
                    setAddressData({ ...addressData, street: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cidade */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                  Cidade
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    id="city"
                    type="text"
                    placeholder="Cidade"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                    value={addressData.city}
                    onChange={(e) =>
                      setAddressData({ ...addressData, city: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Código Postal */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="postal_code">
                  Código Postal
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input
                    id="postal_code"
                    type="text"
                    placeholder="Código Postal"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border ${errors.postal_code ? 'border-red-500' : 'border-gray-200'} focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all`}
                    value={addressData.postal_code}
                    onChange={(e) => {
                      setAddressData({ ...addressData, postal_code: e.target.value });
                      if (errors.postal_code) setErrors({...errors, postal_code: null});
                    }}
                    onBlur={(e) => {
                      if (e.target.value && !validatePostalCode(e.target.value)) {
                        setErrors({...errors, postal_code: 'Código postal inválido. Formato: XXXX-XXX'});
                      }
                    }}
                  />
                </div>
                {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
              </div>
            </div>

            {/* País */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="country">
                País
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  id="country"
                  type="text"
                  placeholder="País"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                  value={addressData.country}
                  onChange={(e) =>
                    setAddressData({ ...addressData, country: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Botão Guardar */}
            <button
              type="submit"
              disabled={saveLoading}
              className="w-full mt-4 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold py-3.5 rounded-xl shadow-md hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={18} />
                  Guardar Endereço
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
            Alterar Palavra-passe
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Nova Palavra-passe */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
                Nova Palavra-passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nova Palavra-passe"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl bg-gray-50 border ${errors.newPassword ? 'border-red-500' : 'border-gray-200'} focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all`}
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, newPassword: e.target.value });
                    if (errors.newPassword) setErrors({...errors, newPassword: null});
                  }}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordData.newPassword && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${pwdStrength.color} transition-all duration-300 ${pwdStrength.width}`} 
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Força: {pwdStrength.text}</p>
                </div>
              )}
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
            </div>

            {/* Confirmar Palavra-passe */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                Confirmar Palavra-passe
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar Palavra-passe"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl bg-gray-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all`}
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: null});
                  }}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Botão Alterar */}
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full mt-4 bg-gradient-to-r from-brand-pink to-brand-purple text-white font-bold py-3.5 rounded-xl shadow-md hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {passwordLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Lock size={18} />
                  Alterar Palavra-passe
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Histórico de Encomendas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Package className="text-brand-blue" size={24} />
            Histórico de Encomendas
          </h2>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-brand-blue" size={32} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 mb-4">Ainda não fez nenhuma encomenda</p>
              <Link
                to="/produtos"
                className="inline-block bg-gradient-to-r from-brand-blue to-brand-purple text-white font-bold px-6 py-3 rounded-xl shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                Explorar Produtos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Cabeçalho da Encomenda */}
                  <div
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 font-medium">
                        {formatDate(order.created_at)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">
                        {formatCurrency(order.total_amount)}
                      </span>
                      {expandedOrders[order.id] ? (
                        <ChevronUp className="text-gray-400" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-400" size={20} />
                      )}
                    </div>
                  </div>

                  {/* Detalhes Expandidos */}
                  {expandedOrders[order.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 p-4 bg-white"
                    >
                      <h3 className="font-semibold text-gray-700 mb-3">Itens da Encomenda:</h3>
                      <div className="space-y-2">
                        {order.order_items?.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-start text-sm"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{item.name}</p>
                              {item.customization && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {Object.entries(item.customization).map(([key, value]) => (
                                    <span key={key} className="mr-2">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-gray-600">
                                {item.quantity}x {formatCurrency(item.price)}
                              </p>
                              <p className="font-semibold text-gray-800">
                                {formatCurrency(item.quantity * item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {order.tracking_code && (
                        <div className="border-t border-gray-200 mt-4 pt-4">
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                              <Truck className="text-brand-blue" size={20} />
                              Rastreio da Encomenda
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <p className="text-gray-700">
                                Código: <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200">{order.tracking_code}</span>
                              </p>
                              <a
                                href={order.tracking_url || `https://www.ctt.pt/feapl_2/app/open/cttexpresso/objectSearch/objectSearch.jspx?objects=${order.tracking_code}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-brand-blue text-white px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all text-center"
                              >
                                Acompanhar Encomenda
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Perfil;
