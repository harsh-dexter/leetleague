import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
    let storedTheme: Theme | null = null;
    if (isLocalStorageAvailable) {
      storedTheme = localStorage.getItem("theme") as Theme | null;
    }
    
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

    root.classList.remove("light", "dark");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    root.classList.add(effectiveTheme);

    if (isLocalStorageAvailable) {
      localStorage.setItem("theme", theme); // Store the user's explicit choice ('light', 'dark', or 'system')
    }
  }, [theme]);

  const toggleTheme = () => {
    // Cycle through themes: system -> light -> dark -> system
    if (theme === "system") {
      setThemeState("light");
    } else if (theme === "light") {
      setThemeState("dark");
    } else {
      setThemeState("system");
    }
  };
  
  // Determine current effective theme for icon display
  const getCurrentEffectiveTheme = () => {
    if (typeof window === 'undefined') return 'light'; // Default for SSR or non-browser env
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  };

  // Call this once to get the initial effective theme for icon display
  // Note: This might cause a flicker if system theme changes before hydration,
  // but for typical client-side toggle, it's acceptable.
  // A more robust solution might involve a CSS-only approach for initial icon or a theme provider context.
  // const [effectiveIconTheme, setEffectiveIconTheme] = useState(getCurrentEffectiveTheme()); // Removed state for icon

  // useEffect(() => { // Removed useEffect for icon state
  //   setEffectiveIconTheme(getCurrentEffectiveTheme());
    
  //   if (theme === "system") {
  //     const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  //     const handleChange = () => setEffectiveIconTheme(mediaQuery.matches ? "dark" : "light");
  //     mediaQuery.addEventListener("change", handleChange);
  //     return () => mediaQuery.removeEventListener("change", handleChange);
  //   }
  // }, [theme]);

  // Re-render will call getCurrentEffectiveTheme directly for icon choice
  // To ensure the icon updates when the system theme changes (if theme is 'system'),
  // we need to trigger a re-render. The existing useEffect that handles the 'dark' class
  // already depends on 'theme'. If 'theme' is 'system', its effective value depends on matchMedia.
  // We need a way to re-render if matchMedia changes *while* theme is 'system'.
  // The simplest way is to add a listener that forces a re-render or updates a dummy state.

  const [, forceUpdate] = useState({}); // Dummy state for re-render

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => forceUpdate({}); // Force re-render on system theme change
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);


  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {getCurrentEffectiveTheme() === "dark" ? ( // Call directly in render
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
       <span className="sr-only">Toggle theme ({theme})</span>
    </Button>
  );
}
