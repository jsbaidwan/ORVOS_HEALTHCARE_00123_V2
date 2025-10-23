import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LoaderProvider } from './context/LoaderContext';
import { ToastProvider } from './context/ToastContext';
import { Toaster } from 'sonner';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LoaderProvider>
      <ToastProvider>
        <Toaster  position="top-right" richColors closeButton animation="fade" />
        <App />
      </ToastProvider>
    </LoaderProvider>
  </React.StrictMode>
 
);


