export const validateProduct = (productName, categoryId, products) => {
  const existingProduct = products.find(
    (p) => p.name.toLowerCase() === productName.toLowerCase() && p.category_id === categoryId
  );

  if (existingProduct) {
    return {
      isValid: false,
      message: `Bu məhsul artıq ${existingProduct.categories?.name || 'bu'} kateqoriyasına təyin edilib`
    };
  }

  return { isValid: true };
};

export const validateTableNumber = (tableNumber, restaurantId, tables, excludeId = null) => {
  const existingTable = tables.find(
    (t) => t.number === parseInt(tableNumber) && t.restaurant_id === restaurantId && t.id !== excludeId
  );

  if (existingTable) {
    return {
      isValid: false,
      message: `${tableNumber} nömrəli masa artıq mövcuddur`
    };
  }

  return { isValid: true };
};

export const validateUsername = async (username, type = 'restaurant') => {
  if (!username || username.length < 3) {
    return {
      isValid: false,
      message: 'İstifadəçi adı ən azı 3 simvol olmalıdır'
    };
  }

  return { isValid: true };
};

export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'Şifrə ən azı 6 simvol olmalıdır'
    };
  }

  return { isValid: true };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Düzgün email daxil edin'
    };
  }

  return { isValid: true };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;

  if (!phone || !phoneRegex.test(phone.replace(/[\s-()]/g, ''))) {
    return {
      isValid: false,
      message: 'Düzgün telefon nömrəsi daxil edin'
    };
  }

  return { isValid: true };
};

export const validatePrice = (price) => {
  const numPrice = parseFloat(price);

  if (isNaN(numPrice) || numPrice <= 0) {
    return {
      isValid: false,
      message: 'Qiymət 0-dan böyük olmalıdır'
    };
  }

  return { isValid: true };
};
