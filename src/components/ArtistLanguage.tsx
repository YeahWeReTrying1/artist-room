"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Language = "ru" | "en";
const storageKey = "artist-language";
const LanguageContext = createContext<{ language: Language; toggleLanguage: () => void }>({
  language: "ru",
  toggleLanguage: () => {}
});

export function ArtistLanguage({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ru");
  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === "en") setLanguage("en");
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function toggleLanguage() {
    const next = language === "ru" ? "en" : "ru";
    setLanguage(next);
    try { localStorage.setItem(storageKey, next); } catch {}
  }

  return <LanguageContext.Provider value={{ language, toggleLanguage }}>{children}</LanguageContext.Provider>;
}

export function useArtistLanguage() {
  return useContext(LanguageContext);
}
