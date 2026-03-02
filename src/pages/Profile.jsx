import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, LogOut } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();

    return (
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white shadow rounded-lg overflow-hidden"
                >
                    <div className="px-6 py-8 sm:p-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">
                            Meu Perfil
                        </h1>

                        <div className="space-y-6">
                            {/* Card de Informação do Usuário */}
                            <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
                                <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-full">
                                    <User className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Nome / Identificador
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {user?.user_metadata?.full_name || 'Usuário'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
                                <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-full">
                                    <Mail className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        Email
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <button
                                    onClick={logout}
                                    className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sair da Conta
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
