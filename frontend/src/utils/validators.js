// Form validation utility functions

export const validators = {
  // Email validation
  email: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  // Phone validation (US format)
  phone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  },

  // Required field validation
  required: (value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  // Minimum length validation
  minLength: (value, min) => {
    return value.length >= min;
  },

  // Maximum length validation
  maxLength: (value, max) => {
    return value.length <= max;
  },

  // Zip code validation (US format)
  zipCode: (zip) => {
    const re = /^\d{5}(-\d{4})?$/;
    return re.test(zip);
  },

  // Date validation
  date: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  // Password strength validation
  password: (password) => {
    // At least 8 characters, one uppercase, one lowercase, one number, one special char
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  },

  // URL validation
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Number validation
  number: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  // Integer validation
  integer: (value) => {
    return Number.isInteger(Number(value));
  },

  // Range validation
  range: (value, min, max) => {
    const num = Number(value);
    return num >= min && num <= max;
  },

  // File size validation (in bytes)
  fileSize: (file, maxSize) => {
    return file.size <= maxSize;
  },

  // File type validation
  fileType: (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
  },

  // Image file validation
  imageFile: (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    return validators.fileType(file, allowedTypes) && validators.fileSize(file, maxSize);
  },

  // Match validation (e.g., password confirmation)
  match: (value1, value2) => {
    return value1 === value2;
  },
};

// Validation error messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  zipCode: 'Please enter a valid zip code',
  password: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  url: 'Please enter a valid URL',
  number: 'Please enter a valid number',
  integer: 'Please enter a valid integer',
  date: 'Please enter a valid date',
  fileSize: 'File size exceeds maximum allowed size',
  fileType: 'File type not allowed',
  match: 'Values do not match',
};

export default validators;


