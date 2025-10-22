import React from 'react';

/**
 * Reusable Error Handling Component
 * Supports react-hook-form errors, API errors, arrays, strings, and React elements
 */
const ErrorHandle = ({
  errors,
  className = "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg",
  errorTextClass = "text-red-600 text-sm",
  showIcon = true,
  title = "Error"
}) => {
  if (!errors || (typeof errors === 'object' && Object.keys(errors).length === 0)) {
    return null;
  }

  const renderIcon = () => (
    showIcon ? (
      <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ) : null
  );

  const renderErrors = () => {
 
    // React element
    if (React.isValidElement(errors)) return errors;

    // String
    if (typeof errors === 'string') {
      return (
        <div className="flex items-start">
          {renderIcon()}
          <p className={errorTextClass}>{errors}</p>
        </div>
      );
    }

    // Array of strings
    if (Array.isArray(errors)) {
      return errors.map((msg, i) => (
        <div key={i} className="flex items-start">
          {renderIcon()}
          <p className={errorTextClass}>{msg}</p>
        </div>
      ));
    }

    // Object (react-hook-form or API error format)
    if (typeof errors === 'object') {
      return Object.entries(errors).map(([field, value], i) => {
        // react-hook-form error object { type, message, ref }
        const messages = value?.message
          ? Array.isArray(value.message) ? value.message : [value.message]
          : Array.isArray(value) ? value : [value]; // API error array

        return (
          <div key={field || i} className="mb-2">
            {field !== 'general' && (
              <p className="font-medium text-red-800 text-xs uppercase tracking-wide">{field}</p>
            )}
            {messages.map((msg, j) => (
              <div key={j} className="flex items-start">
                {renderIcon()}
                <p className={errorTextClass}>{msg}</p>
              </div>
            ))}
          </div>
        );
      });
    }

    return null;
  };

  return (
    <div className={className} role="alert">
      {title && (
        <div className="flex items-center mb-2">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
        </div>
      )}
      {renderErrors()}
    </div>
  );
};

export default ErrorHandle;
