import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Package,
  Upload,
  AlertTriangle,
  Hash,
} from 'lucide-react';
import { supabase } from '../../services/supabase';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const CATEGORY_OPTIONS = ['Canecas', 'Camisetas', 'Azulejos', 'Acessórios'];

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_active: true,
    stock_quantity: '',
    customization_options: [],
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData(emptyForm);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      image_url: product.image_url || '',
      is_active: product.is_active ?? true,
      stock_quantity: product.stock_quantity?.toString() ?? '',
      customization_options: product.customization_options || [],
    });
    setSelectedProduct(product);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Tens a certeza que queres eliminar este produto?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      setProducts(products.filter((p) => p.id !== productId));
    } catch (_error) {
      alert('Erro ao eliminar produto');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, image_url: urlData.publicUrl }));
    } catch (_error) {
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      alert('Preenche o nome e o preço');
      return;
    }

    setSaving(true);
    try {
      const stockVal = formData.stock_quantity === '' ? null : parseInt(formData.stock_quantity, 10);

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category || null,
        image_url: formData.image_url,
        is_active: formData.is_active,
        stock_quantity: isNaN(stockVal) ? null : stockVal,
        customization_options: formData.customization_options,
      };

      if (isCreating) {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();
        if (error) throw error;
        setProducts([data, ...products]);
      } else {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id)
          .select()
          .single();
        if (error) throw error;
        setProducts(products.map((p) => (p.id === selectedProduct.id ? data : p)));
      }

      handleCancel();
    } catch (_error) {
      alert('Erro ao guardar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const addCustomizationOption = () => {
    setFormData({
      ...formData,
      customization_options: [
        ...formData.customization_options,
        { label: '', price: 0, allows_image: false },
      ],
    });
  };

  const updateCustomizationOption = (index, field, value) => {
    const updated = [...formData.customization_options];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, customization_options: updated });
  };

  const removeCustomizationOption = (index) => {
    setFormData({
      ...formData,
      customization_options: formData.customization_options.filter((_, i) => i !== index),
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value || 0);

  const getStockLabel = (qty) => {
    if (qty === null || qty === undefined) return null;
    if (qty === 0) return { text: 'Esgotado', cls: 'bg-red-500 text-white' };
    if (qty <= 5) return { text: `${qty} restantes`, cls: 'bg-orange-400 text-white' };
    return { text: `${qty} em stock`, cls: 'bg-green-500 text-white' };
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = showInactive || product.is_active;
    return matchesSearch && matchesActive;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Produtos</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
          />
          <span className="text-gray-700">Mostrar inativos</span>
        </label>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const stockLabel = getStockLabel(product.stock_quantity);
          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${!product.is_active ? 'opacity-60' : ''}`}
            >
              <div className="aspect-square bg-gray-100 relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className={`w-full h-full object-cover ${product.stock_quantity === 0 ? 'grayscale opacity-60' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={48} className="text-gray-300" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {!product.is_active && (
                    <span className="bg-gray-700 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                      Inativo
                    </span>
                  )}
                  {stockLabel && (
                    <span className={`${stockLabel.cls} px-2 py-0.5 rounded-full text-xs font-bold`}>
                      {stockLabel.text}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1 truncate">{product.name}</h3>
                <p className="text-brand-blue font-bold text-lg mb-3">
                  {formatCurrency(product.price)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-400 py-8">Nenhum produto encontrado</p>
      )}

      {/* Edit/Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {isCreating ? 'Novo Produto' : 'Editar Produto'}
              </h2>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
                  placeholder="Nome do produto"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
                  rows={3}
                  placeholder="Descrição do produto"
                />
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Hash size={14} /> Stock (vazio = ilimitado)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
                    placeholder="Ex: 10"
                  />
                </div>
              </div>

              {/* Esgotado quick toggle */}
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    stock_quantity: formData.stock_quantity === '0' ? '' : '0',
                  })
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  formData.stock_quantity === '0'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <AlertTriangle size={16} />
                {formData.stock_quantity === '0' ? 'Marcado como Esgotado' : 'Marcar como Esgotado'}
              </button>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue"
                >
                  <option value="">Sem categoria</option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image — upload ou URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue/20 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    {uploadingImage ? 'A fazer upload...' : 'Upload de Foto'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue text-sm"
                  placeholder="Ou cola um URL de imagem..."
                />
                {formData.image_url && (
                  <div className="mt-3 relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    formData.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {formData.is_active ? (
                    <><Eye size={18} /> Visível na loja</>
                  ) : (
                    <><EyeOff size={18} /> Oculto na loja</>
                  )}
                </button>
              </div>

              {/* Customization Options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Opções de Personalização
                  </label>
                  <button
                    type="button"
                    onClick={addCustomizationOption}
                    className="text-brand-blue text-sm font-medium hover:underline"
                  >
                    + Adicionar opção
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.customization_options.map((option, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Opção {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomizationOption(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => updateCustomizationOption(index, 'label', e.target.value)}
                          placeholder="Nome (ex: Texto)"
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue text-sm"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={option.price}
                          onChange={(e) =>
                            updateCustomizationOption(index, 'price', parseFloat(e.target.value) || 0)
                          }
                          placeholder="Preço extra"
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue text-sm"
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={option.allows_image}
                            onChange={(e) =>
                              updateCustomizationOption(index, 'allows_image', e.target.checked)
                            }
                            className="w-4 h-4 rounded"
                          />
                          <span className="text-sm">Permite imagem</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <><Save size={20} /> Guardar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
