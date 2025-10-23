// LoaderContext.jsx
import React, { createContext, useContext, useState } from 'react';
import Loader from '../components/Common/Loader';

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      <Loader isLoading={isLoading} /> {/* Loader rendered globally */}
    </LoaderContext.Provider>
  );
};

// Custom hook to use the loader
export const useLoader = () => useContext(LoaderContext);
