import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  rows = 4,
  error,
  disabled = false,
  inputClassName = '',
  registration,
}) => {
  const inputProps = registration
    ? { ...registration }
    : type === 'checkbox'
    ? { name, checked: value, onChange }
    : type === 'file'
    ? { name, onChange }
    : { name, value, onChange };

  const [showPassword, setShowPassword] = useState(false);

  const errorClass = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  const disabledClass = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  const renderInput = () => {
    switch (type) {
      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id={name}
              {...inputProps}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              className={`input-field pr-10 ${errorClass} ${disabledClass} ${inputClassName}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        );
      case 'textarea':
        return (
          <textarea
            id={name}
            {...inputProps}
            placeholder={placeholder}
            required={required}
            rows={rows}
            disabled={disabled}
            className={`input-field resize-none ${errorClass} ${disabledClass} ${inputClassName}`}
          />
        );

      case 'select':
        return (
          <select
            id={name}
            {...inputProps}
            required={required}
            disabled={disabled}
            className={`input-field ${errorClass} ${disabledClass} ${inputClassName}`}
          >
            <option value="">Select {label}</option>
            {options.map((option, index) => {
              const optValue = option?.value != null ? option.value : (typeof option !== 'object' ? option : '');
              return (
               
                <option key={index} value={optValue}>
                  {option?.label || optValue || option}
                </option>
              );
            })}
          </select>
        );

      case 'file':
        return (
          <input
            type="file"
            id={name}
            {...inputProps}
            required={required}
            disabled={disabled}
            multiple={placeholder?.includes('multiple')}
            className={`input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 ${error ? 'border-red-500' : ''} ${disabledClass} ${inputClassName}`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            id={name}
            {...inputProps}
            required={required}
            disabled={disabled}
            className={`input-field ${errorClass} ${disabledClass} ${inputClassName}`}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={name}
              {...inputProps}
              disabled={disabled}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <label htmlFor={name} className="ml-3 text-sm font-medium text-gray-700">
              {label}
            </label>
          </div>
        );

      default:
        return (
          <input
            type={type}
            id={name}
            {...inputProps}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`input-field ${errorClass} ${disabledClass} ${inputClassName}`}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className="mb-4">
        {renderInput()}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default FormField;
