import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase'; // Importe o supabase
import { useCart } from '../context/CartContext';
import { Minus, Plus, Upload, ArrowLeft, X, Check, ShieldCheck, MessageSquare, Edit3, ImageIcon, Loader2, Package } from 'lucide-react';

const ProdutoDetalhe = () => {
    const { id } = useParams(); // Pega o ID da URL (ex: /produto/1)
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // Estado para guardar o produto que veio do banco
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Estados do formulário
    const [quantity, setQuantity] = useState(1);
    const [selectedOption, setSelectedOption] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [instructions, setInstructions] = useState('');
    const fileInputRef = useRef(null);

    // --- 1. BUSCAR PRODUTO NO SUPABASE ---
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single(); // Pega apenas um

            if (error || !data) {
                console.error("Produto não encontrado", error);
                navigate('/produtos'); // Volta se der erro
            } else {
                setProduct(data);
                // Define a primeira opção como padrão se existir e for um array
                if (Array.isArray(data.customization_options) && data.customization_options.length > 0) {
                    setSelectedOption(data.customization_options[0]);
                }
            }
            setLoading(false);
        };

        fetchProduct();
    }, [id, navigate]);

    // Funções de manipulação do formulário (iguais as anteriores)
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setUploadedImage(e.target.result);
        reader.readAsDataURL(file);
    };

    const removeImage = (e) => { e.stopPropagation(); setUploadedImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; };
    const triggerFileInput = () => fileInputRef.current.click();
    const handleDecrease = () => quantity > 1 && setQuantity(quantity - 1);
    const handleIncrease = () => setQuantity(quantity + 1);

    const handleAddToCart = () => {
        if (!product) return;

        // Usamos o preço da opção selecionada ou o preço base
        const finalPrice = selectedOption ? selectedOption.price : product.price;

        addToCart(
            { ...product, price: finalPrice },
            quantity,
            {
                uploadedImage,
                instructions,
                personalizationType: selectedOption?.label || 'Padrão'
            }
        );
    };

    // Preço unitário atual
    const currentUnitPrice = selectedOption ? selectedOption.price : (product?.price || 0);

    // Lógica para verificar se a opção exige/permite imagem (Vindo do Banco)
    const isImageRequired = useMemo(() => {
        return selectedOption?.allows_image === true;
    }, [selectedOption]);

    // Tela de Carregamento enquanto busca no banco
    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>;

    if (!product) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 md:px-16 lg:px-32 py-12">
            <Link to="/produtos" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-blue mb-8 transition-colors font-medium">
                <ArrowLeft size={20} /> Voltar para produtos
            </Link>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                {/* LADO ESQUERDO: IMAGEM */}
                <div className="flex-1">
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden relative group h-[500px] lg:h-[600px] sticky top-8">
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Package size={64} className="text-gray-400" />
                            </div>
                        )}
                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-green-500" />
                            <span>Qualidade Premium</span>
                        </div>
                    </div>
                </div>

                {/* LADO DIREITO */}
                <div className="flex-1 flex flex-col justify-center space-y-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">{product.name}</h1>
                        <p className="text-gray-600 text-lg leading-relaxed mb-4">{product.description}</p>
                        <div className="text-4xl font-bold text-brand-blue">
                            {(currentUnitPrice * quantity).toFixed(2).replace('.', ',')} €
                        </div>
                    </div>

                    {/* BOX DE PERSONALIZAÇÃO */}
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-brand-blue rounded-lg"><Edit3 size={20} /></div>
                                <h3 className="text-xl font-bold text-gray-800">Personalize</h3>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-500 pl-2 uppercase tracking-wider">Qtd:</span>
                                <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-100">
                                    <button type="button" onClick={handleDecrease} disabled={quantity <= 1} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-brand-pink active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"><Minus size={16} /></button>
                                    <span className="w-8 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                                    <button type="button" onClick={handleIncrease} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-brand-blue active:scale-95 transition cursor-pointer"><Plus size={16} /></button>
                                </div>
                            </div>
                        </div>

                        {/* OPÇÕES DE PERSONALIZAÇÃO */}
                        {product.customization_options && product.customization_options.length > 1 && (
                            <div className="mb-8">
                                <label className="text-sm font-bold text-gray-700 mb-4 block uppercase tracking-wider">
                                    Escolha o Tipo de Personalização
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {product.customization_options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedOption(option)}
                                            className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all duration-300 text-left cursor-pointer ${selectedOption?.label === option.label
                                                ? 'border-brand-blue bg-blue-50/50 shadow-md ring-4 ring-blue-50/20'
                                                : 'border-gray-100 hover:border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex-1 pr-4">
                                                <span className={`font-bold transition-colors ${selectedOption?.label === option.label ? 'text-brand-blue' : 'text-gray-700'}`}>
                                                    {option.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <span className="font-bold text-gray-900">{option.price.toFixed(2).replace('.', ',')}€</span>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption?.label === option.label
                                                    ? 'bg-brand-blue border-brand-blue shadow-sm'
                                                    : 'border-gray-300'
                                                    }`}>
                                                    {selectedOption?.label === option.label && <Check size={14} className="text-white" />}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload e Texto */}
                        <div className={`mb-8 transition-all duration-300 ${!isImageRequired ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                            <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <ImageIcon size={16} className="text-gray-400" />
                                <span>{isImageRequired ? 'Envie sua arte (Opcional)' : 'Imagem não disponível para esta opção'}</span>
                                {uploadedImage && isImageRequired && <span className="ml-auto text-green-600 text-xs bg-green-50 px-2 py-1 rounded-md flex items-center gap-1"><Check size={12} /> Anexado</span>}
                            </label>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            <div
                                onClick={isImageRequired ? triggerFileInput : undefined}
                                className={`relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden group ${!isImageRequired ? 'bg-gray-100 border-gray-200 cursor-not-allowed' :
                                    uploadedImage ? 'border-brand-blue bg-blue-50/20 cursor-pointer' :
                                        'border-gray-200 hover:border-brand-blue hover:bg-gray-50 cursor-pointer'
                                    }`}
                            >
                                {uploadedImage && isImageRequired ? (
                                    <div className="flex items-center gap-4 p-4 w-full h-full">
                                        <div className="h-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"><img src={uploadedImage} alt="Upload" className="w-full h-full object-cover" /></div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-sm">Imagem recebida!</p>
                                            <button onClick={removeImage} className="mt-2 text-red-500 text-xs font-bold hover:text-red-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 shadow-sm hover:bg-red-50"><X size={14} /> Remover</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center p-4 text-center">
                                        <Upload size={24} className="text-gray-400 group-hover:text-brand-blue mb-2 transition-colors" />
                                        <span className="text-gray-500 font-medium text-sm group-hover:text-brand-blue transition-colors px-4">
                                            {isImageRequired ? 'Clique para carregar imagem' : 'Esta opção utiliza apenas texto'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-100 mb-8"></div>

                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <MessageSquare size={16} className="text-gray-400" />
                                <span>Instruções Especiais</span>
                            </label>
                            <textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Ex: Nome, frase, cor..."
                                className="w-full h-28 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all resize-none text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full bg-gray-900 text-white text-lg font-bold py-5 rounded-2xl shadow-xl hover:bg-black hover:scale-[1.01] transition-all active:scale-95 cursor-pointer"
                    >
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProdutoDetalhe;
