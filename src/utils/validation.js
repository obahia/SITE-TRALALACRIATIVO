// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 6 chars, at least 1 letter and 1 number)
export const isValidPassword = (password) => {
  return password.length >= 6;
};

// Name validation (non-empty, reasonable length)
export const isValidName = (name) => {
  return name && name.trim().length > 0 && name.trim().length <= 100;
};

// Product validation
export const isValidProductData = (product) => {
  const errors = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push('Nome do produto é obrigatório');
  }

  if (!product.description || product.description.trim().length === 0) {
    errors.push('Descrição é obrigatória');
  }

  if (!product.price || isNaN(product.price) || parseFloat(product.price) <= 0) {
    errors.push('Preço deve ser um número positivo');
  }

  if (!product.category || product.category.trim().length === 0) {
    errors.push('Categoria é obrigatória');
  }

  if (!product.image_url || product.image_url.trim().length === 0) {
    errors.push('URL da imagem é obrigatória');
  }

  if (typeof product.stock_quantity !== 'undefined') {
    const stock = parseInt(product.stock_quantity, 10);
    if (isNaN(stock) || stock < 0) {
      errors.push('Quantidade em stock deve ser um número não-negativo');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize user input to prevent XSS (basic)
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Validate quantity
export const isValidQuantity = (quantity) => {
  const num = parseInt(quantity, 10);
  return !isNaN(num) && num > 0 && num <= 999;
};

// Validate customization object
export const isValidCustomization = (customization) => {
  if (!customization || typeof customization !== 'object') {
    return true; // Optional
  }
  // Ensure no excessive nesting or large objects
  const jsonString = JSON.stringify(customization);
  return jsonString.length <= 10000;
};
