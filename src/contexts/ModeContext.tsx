import React, { createContext, useContext, useState, useEffect } from 'react';

type Mode = 'easy' | 'pro';

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>(() => {
    const stored = localStorage.getItem('aetherium-mode');
    return stored === 'pro' ? 'pro' : 'easy';
  });

  useEffect(() => {
    localStorage.setItem('aetherium-mode', mode);
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode must be used within ModeProvider');
  return context;
};
