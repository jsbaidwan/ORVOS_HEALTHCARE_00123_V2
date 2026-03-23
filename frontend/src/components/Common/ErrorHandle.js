import React, { useState, useEffect } from 'react';

const ErrorHandle = ({
  errors,
  className = "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg",
  errorTextClass = "text-red-600 text-sm",
  showIcon = true,
  title = "Error"
}) => {
  const [isVisible, setIsVisible] = useState(true);
    
  // Reset visibility when errors change
  useEffect(() => {
     
    if (errors) {
      setIsVisible(true);
    }
  }, [errors]);
  
  if (!isVisible) return null;

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

  const extractMessages = (value, depth = 0) => {
    if (depth > 5) return [];
    if (typeof value === 'string') return [value];
    if (React.isValidElement(value)) return [value];
    if (value?.message && typeof value.message === 'string') return [value.message];
    if (value?.nodeType || value instanceof Element) return [];
    if (Array.isArray(value)) return value.flatMap(item => extractMessages(item, depth + 1));
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value)
        .filter(([key]) => key !== 'ref' && key !== 'root')
        .flatMap(([, v]) => extractMessages(v, depth + 1));
    }
    return [];
  };

  const renderErrors = () => {
    if (React.isValidElement(errors)) return errors;

    if (typeof errors === 'string') {
      return (
        <div className="flex items-start">
          {renderIcon()}
          <p className={errorTextClass}>{errors}</p>
        </div>
      );
    }
   
    if (Array.isArray(errors)) {
      const msgs = errors.flatMap(item => extractMessages(item));
      return msgs.map((msg, i) => (
        <div key={i} className="flex items-start">
          {renderIcon()}
          <p className={errorTextClass}>{msg}</p>
        </div>
      ));
    }

    if (typeof errors === 'object') {
      return Object.entries(errors).map(([field, value], i) => {
        const messages = extractMessages(value);
        if (messages.length === 0) return null;
        const filteredMessages = messages.filter(msg => msg !== 'manual');
        
        return (
          <div key={field || i} className="mb-2">
            {field !== 'general' && (
              <p className="font-medium text-red-800 text-xs uppercase tracking-wide">{field}</p>
            )}
            {filteredMessages.map((msg, j) => (
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
    <div className={`${className} relative`} role="alert">
      {/* Close button */}
      <button
        type="button"
        className="absolute top-2 right-2 text-red-800 hover:text-red-600 font-bold text-xl"
        onClick={() => setIsVisible(false)}
      >
        &times;
      </button>

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
