import React, { useState, useEffect } from 'react';

type EffectiveTheme = "light" | "dark";

export const ThemeAwareLogo: React.FC<{ className?: string }> = ({ className }) => {
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>(() => {
    // Initialize based on current class on <html> or system preference as fallback
    if (typeof window !== 'undefined') {
      if (document.documentElement.classList.contains('dark')) {
        return 'dark';
      }
      // If no 'dark' class, check system preference for initial state before ThemeToggle might have run
      // This helps if ThemeAwareLogo renders before ThemeToggle's first effect.
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const storedUserChoice = localStorage.getItem("theme");
      if (storedUserChoice === 'dark') return 'dark';
      if (storedUserChoice === 'light') return 'light';
      // If 'system' or no choice, use system preference
      if (systemPrefersDark) return 'dark';
    }
    return 'light'; // Default to light
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Function to update theme based on <html> class
    const updateThemeFromHtmlClass = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setEffectiveTheme(isDark ? 'dark' : 'light');
    };

    // Initial check
    updateThemeFromHtmlClass();

    // Observe changes to the class attribute of the <html> element
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateThemeFromHtmlClass();
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []); // Runs once on mount

  const logoSrc = effectiveTheme === 'dark' ? '/leetleague-logo-dark.svg' : '/leetleague-logo-light.svg';

  return <img src={logoSrc} alt="LeetLeague Logo" className={className} />;
};
