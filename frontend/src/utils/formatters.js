// Data formatting utility functions

export const formatters = {
  // Format phone number to (XXX) XXX-XXXX
  phone: (phoneNumber) => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumber;
  },

  // Format date to locale string
  date: (date, locale = 'en-US', options = {}) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, options);
  },

  // Format date to ISO string (YYYY-MM-DD)
  dateISO: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  },

  // Format time
  time: (date, locale = 'en-US', options = {}) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(locale, options);
  },

  // Format currency
  currency: (amount, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  // Format number
  number: (number, decimals = 0) => {
    return Number(number).toFixed(decimals);
  },

  // Format number with commas
  numberWithCommas: (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // Format file size
  fileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Capitalize first letter
  capitalize: (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  // Convert to title case
  titleCase: (string) => {
    if (!string) return '';
    return string.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  },

  // Truncate text
  truncate: (text, length, suffix = '...') => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  },

  // Format name (First Last)
  name: (firstName, lastName) => {
    return [firstName, lastName].filter(Boolean).join(' ');
  },

  // Format full name with title
  fullName: (title, firstName, middleName, lastName, suffix) => {
    return [title, firstName, middleName, lastName, suffix].filter(Boolean).join(' ');
  },

  // Format address
  address: (street, city, state, zip) => {
    const parts = [street, city, state, zip].filter(Boolean);
    return parts.join(', ');
  },

  // Mask sensitive data (e.g., credit card)
  mask: (value, visibleChars = 4, maskChar = '*') => {
    if (!value) return '';
    const str = String(value);
    if (str.length <= visibleChars) return str;
    return maskChar.repeat(str.length - visibleChars) + str.slice(-visibleChars);
  },

  // Format SSN
  ssn: (ssn) => {
    const cleaned = ('' + ssn).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{4})$/);
    if (match) {
      return match[1] + '-' + match[2] + '-' + match[3];
    }
    return ssn;
  },

  // Mask SSN
  maskSSN: (ssn) => {
    const cleaned = ('' + ssn).replace(/\D/g, '');
    if (cleaned.length === 9) {
      return 'XXX-XX-' + cleaned.slice(-4);
    }
    return ssn;
  },

  // Format percentage
  percentage: (value, decimals = 0) => {
    return (value * 100).toFixed(decimals) + '%';
  },

  // Format relative time (e.g., "2 hours ago")
  relativeTime: (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((new Date() - dateObj) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  },
};

export default formatters;


