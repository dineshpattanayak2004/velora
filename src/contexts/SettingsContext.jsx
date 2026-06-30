import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("velora-settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultSettings();
      }
    }
    return getDefaultSettings();
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      applySettingsToDOM(settings);
      setIsInitialized(true);
    }
  }, [settings, isInitialized]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "velora-settings" && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setSettings(newSettings);
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem("velora-settings", JSON.stringify(newSettings));
      applySettingsToDOM(newSettings);
      return newSettings;
    });
  };

  const resetSettings = () => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    localStorage.setItem("velora-settings", JSON.stringify(defaults));
    applySettingsToDOM(defaults);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

const getDefaultSettings = () => ({
  username: "User",
  email: "user@velora.ai",
  avatar: "",
  notifications: true,
  emailNotifications: true,
  pushNotifications: false,
  soundEnabled: true,
  theme: "dark",
  fontSize: "medium",
  compactMode: false,
  animationsEnabled: true,
  twoFactorAuth: false,
  dataCollection: true,
  shareUsageData: false,
  defaultModel: "gemini-2.5-flash",
  temperature: 0.7,
  maxTokens: 2048,
  responseStyle: "balanced",
  language: "english",
  timezone: "Asia/Calcutta",
  apiKey: "",
  debugMode: false,
  autoSave: true,
});

const applySettingsToDOM = (settings) => {
  const root = document.documentElement;
  const body = document.body;

  // Theme
  if (settings.theme === "light") {
    root.classList.add("light-theme");
    root.classList.remove("dark-theme");
  } else if (settings.theme === "dark") {
    root.classList.add("dark-theme");
    root.classList.remove("light-theme");
  }

  // Font Size
  root.classList.remove("font-small", "font-medium", "font-large");
  if (settings.fontSize === "small") {
    root.classList.add("font-small");
  } else if (settings.fontSize === "medium") {
    root.classList.add("font-medium");
  } else if (settings.fontSize === "large") {
    root.classList.add("font-large");
  }

  // Compact Mode
  if (settings.compactMode) {
    root.classList.add("compact-mode");
  } else {
    root.classList.remove("compact-mode");
  }

  // Animations
  if (settings.animationsEnabled === false) {
    root.classList.add("no-animations");
  } else {
    root.classList.remove("no-animations");
  }
};
