import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail, LogOut, Package, MapPin, Settings, Sparkles } from 'lucide-react';
import { CONTAINER_CLASS } from '../constants';

const Profile = () => {
    const { user, logout } = useAuth();

    const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Usuário';
    const userFullName = user?.user_metadata?.full_name || user?.user_metadata?.first_name || userName;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${CONTAINER_CLASS} pt-12 pb-20 min-h-screen`}
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                    Meu Perfil
                </h1>
                <p className="text-gray-500">Gerencie suas informações e pedidos</p>
            </div>

            {/* Card do Usuário */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-blue to-brand-pink flex items-center justify-center shrink-0">
                        <span className="text-3xl font-bold text-white">
                            {userName.charAt(0).toUpperCase()}
                        </span>
                    </div>

                    {/* Informações */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">{userFullName}</h2>
                        <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2">
                            <Mail size={16} />
                            {user?.email}
                        </p>
                    </div>

                    {/* Botão Configurações */}
                    <Link
                        to="/admin"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                        <Settings size={18} />
                        Admin
                    </Link>
                </div>
            </div>

            {/* Grid de Opções */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meus Pedidos */}
                <Link
                    to="/admin/pedidos"
                    className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-brand-blue/30 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package className="text-brand-blue" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Meus Pedidos</h3>
                            <p className="text-sm text-gray-500">Ver histórico de compras</p>
                        </div>
                    </div>
                </Link>

                {/* Endereços */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-brand-pink/30 transition-all group cursor-not-allowed opacity-60">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl pink-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MapPin className="text-brand-pink" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Endereços</h3>
                            <p className="text-sm text-gray-500">Gerenciar endereços (em breve)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botão Sair */}
            <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                    <LogOut size={20} />
                    Sair da Conta
                </button>
            </div>

            {/* Mensagem de Boas-vindas */}
            <div className="mt-8 bg-gradient-to-r from-brand-blue/10 to-brand-pink/10 rounded-[2rem] p-6 text-center">
                <Sparkles className="mx-auto text-brand-pink mb-2" size={24} />
                <p className="text-gray-700 font-medium">
                    Obrigado por fazer parte da família Tralalá Criativo!
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    Transforme suas ideias em presentes inesquecíveis.
                </p>
            </div>
        </motion.div>
    );
};

export default Profile;
