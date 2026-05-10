import React, { createContext, useContext, useCallback, useEffect, useMemo } from "react";
import type { Lang, TranslationDict } from "./translations";
import { translations } from "./translations";

const STORAGE_KEY = "ai-thought-flow-pro-lang";

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh-CN") return stored;
  } catch {}
  // Default to zh-CN for Chinese users
  return "zh-CN";
}

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslationDict;
}

export const I18nContext = createContext<I18nContextValue>({
  lang: "zh-CN",
  setLang: () => {},
  t: translations["zh-CN"],
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = React.useState<Lang>(detectLang);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {}
    // Update HTML lang attribute
    document.documentElement.lang = newLang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value: I18nContextValue = useMemo(() => ({
    lang,
    setLang,
    t: translations[lang],
  }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useTranslation(): I18nContextValue {
  return useContext(I18nContext);
}
