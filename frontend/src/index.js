// MUST be the first import — installs a global filter that silences the
// harmless "reCAPTCHA Timeout (b)" errors Google's script throws, before
// react-error-overlay has a chance to register its own listeners.
import './utils/suppressRecaptchaErrors';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LoaderProvider } from './context/LoaderContext';
import { ToastProvider } from './context/ToastContext';
import { Toaster } from 'sonner';
import { TitleProvider } from "./context/TitleContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <LoaderProvider>
      <ToastProvider>
       <TitleProvider>
        <Toaster  position="top-right" richColors closeButton animation="zoom" />
        <App />
       </TitleProvider>
      </ToastProvider>
    </LoaderProvider>
  // </React.StrictMode>
 
);


