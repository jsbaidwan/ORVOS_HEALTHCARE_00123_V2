
import React, { createContext, useContext, useState, useEffect } from "react";
import { Helmet } from "react-helmet";

const TitleContext = createContext();

export const useTitle = () => useContext(TitleContext);

export const TitleProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState("Home");

  // Update document title whenever pageTitle changes
  useEffect(() => {
    document.title = `${process.env.REACT_APP_APP_NAME} - ${pageTitle}`;
  }, [pageTitle]);

  return (
    <TitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {/* Optional: also use Helmet for meta description */}
      <Helmet>
        <title>{`${process.env.REACT_APP_APP_NAME} - ${pageTitle}`}</title>
        <meta
          name="description"
          content={process.env.REACT_APP_APP_DESCRIPTION}
        />
      </Helmet>
      {children}
    </TitleContext.Provider>
  );
};
