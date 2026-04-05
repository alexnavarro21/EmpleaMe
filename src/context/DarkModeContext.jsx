import { createContext, useContext, useState } from "react";

const Ctx = createContext(null);

export function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  return <Ctx.Provider value={{ isDark, setIsDark }}>{children}</Ctx.Provider>;
}

export const useDark = () => useContext(Ctx);
