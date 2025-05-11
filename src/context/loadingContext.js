"use client";
import { createContext, useContext, useState } from "react";
import CircularLoading from "@/Components/Loader";

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <LoadingContext.Provider
      value={{ isLoading: isLoading, setIsLoading: setIsLoading }}
    >
      {isLoading && <CircularLoading />}
      {children}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = () => useContext(LoadingContext);
