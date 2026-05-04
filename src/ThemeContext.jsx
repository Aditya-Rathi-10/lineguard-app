import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isLight, setIsLight] = useState(() => {
    return document.body.classList.contains('light-theme');
  });

  const toggleTheme = () => {
    setIsLight(!isLight);
  };

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isLight]);

  return (
    <ThemeContext.Provider value={{ isLight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
