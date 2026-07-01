import React, { createContext, useContext, useEffect, useState } from 'react';

interface LocalOnlyModeContextType {
  localOnly: boolean;
  setLocalOnly: (v: boolean) => void;
}

const LocalOnlyModeContext = createContext<LocalOnlyModeContextType>({
  localOnly: false,
  setLocalOnly: () => {},
});

const KEY = 'local_only_mode';

export const LocalOnlyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localOnly, setLocalOnlyState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(KEY, localOnly ? 'true' : 'false');
  }, [localOnly]);

  return (
    <LocalOnlyModeContext.Provider value={{ localOnly, setLocalOnly: setLocalOnlyState }}>
      {children}
    </LocalOnlyModeContext.Provider>
  );
};

export const useLocalOnlyMode = () => useContext(LocalOnlyModeContext);
