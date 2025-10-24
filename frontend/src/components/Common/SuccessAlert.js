import React, { useState, useEffect } from 'react';

const SuccessAlert = ({
  message,
  className = "mb-4 p-4 bg-green-50 border border-green-200 rounded-lg",
  textClass = "text-green-700 text-sm",
  showIcon = true,
  title = "Success",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
    }
  }, [message]);

  if (!isVisible || !message) return null;

  const renderIcon = () =>
    showIcon ? (
      <svg
        className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L9 13.414l4.707-4.707z"
          clipRule="evenodd"
        />
      </svg>
    ) : null;

  const renderMessage = () => {
    if (React.isValidElement(message)) return message;

    if (typeof message === 'string') {
      return (
        <div className="flex items-start">
          {renderIcon()}
          <p className={textClass}>{message}</p>
        </div>
      );
    }

    if (Array.isArray(message)) {
      return message.map((msg, i) => (
        <div key={i} className="flex items-start">
          {renderIcon()}
          <p className={textClass}>{msg}</p>
        </div>
      ));
    }

    return null;
  };

  return (
    <div className={`${className} relative`} role="alert">
      {/* Close button */}
      <button
        type="button"
        className="absolute top-2 right-2 text-green-800 hover:text-green-600 font-bold text-xl"
        onClick={() => setIsVisible(false)}
      >
        &times;
      </button>

      {title && (
        <div className="flex items-center mb-2">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
        </div>
      )}

      {renderMessage()}
    </div>
  );
};

export default SuccessAlert;
