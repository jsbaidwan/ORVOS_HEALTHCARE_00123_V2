import React, { createContext, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showToast = (message, type = "success") => {
    toast(message, {
      type, // success, error, info, warning
      position: "bottom-right",
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
