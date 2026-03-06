import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "ru" | "en";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (ru: string, en: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "ru",
  setLang: () => {},
  t: (ru) => ru,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("lang") as Language) || "ru";
  });

  const handleSetLang = (l: Language) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  const t = (ru: string, en: string) => lang === "ru" ? ru : en;

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
