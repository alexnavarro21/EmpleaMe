import { createContext, useContext, useState } from "react";

const Ctx = createContext(null);

export function DarkModeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const isDark = theme === "dark";
  const isContrast = theme === "colorblind";

  // Backward compat: setIsDark(true) → dark, setIsDark(false) → light
  function setIsDark(val) {
    const next = val ? "dark" : "light";
    setThemeState(next);
    localStorage.setItem("theme", next);
  }

  function setTheme(next) {
    setThemeState(next);
    localStorage.setItem("theme", next);
  }

  return (
    <Ctx.Provider value={{ isDark, setIsDark, isContrast, theme, setTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export const useDark = () => useContext(Ctx);
