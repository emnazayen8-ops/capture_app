import React, { createContext, useContext, useEffect, useState } from "react";

const ModuleContext = createContext(null);
const STORAGE_KEY = "capture-app:selected-module";

export function ModuleProvider({ children }) {
  const [selectedModule, setSelectedModuleState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setSelectedModuleState(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const selectModule = (module) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(module));
    setSelectedModuleState(module);
  };

  const clearModule = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSelectedModuleState(null);
  };

  return (
    <ModuleContext.Provider
      value={{ selectedModule, isLoading, selectModule, clearModule }}
    >
      {children}
    </ModuleContext.Provider>
  );
}

export function useModule() {
  const ctx = useContext(ModuleContext);
  if (!ctx) throw new Error("useModule doit être utilisé dans un <ModuleProvider>");
  return ctx;
}
