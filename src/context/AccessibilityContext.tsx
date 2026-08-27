import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AccessibilitySettings, FontSizeOption } from '../types/accessibility';
import { storageService } from '../services/storageService';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  setFontSize: (size: FontSizeOption) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setScreenReaderMode: (enabled: boolean) => void;
  setSimplifiedUI: (enabled: boolean) => void;
  setAudioFeedback: (enabled: boolean) => void;
  toggleHighContrast: () => void;
  speakText: (text: string) => void;
  announce: (message: string) => void;
  liveAnnouncement: string;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => storageService.getAccessibilitySettings());
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  useEffect(() => {
    storageService.saveAccessibilitySettings(settings);

    // Apply document level root classes
    const root = document.documentElement;

    // Font size classes
    root.classList.remove('font-normal', 'font-large', 'font-extralarge');
    root.classList.add(`font-${settings.fontSize}`);

    // High contrast class
    if (settings.highContrast) {
      root.classList.add('theme-high-contrast');
    } else {
      root.classList.remove('theme-high-contrast');
    }

    // Reduce motion class
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Simplified UI class
    if (settings.simplifiedUI) {
      root.classList.add('simplified-view');
    } else {
      root.classList.remove('simplified-view');
    }
  }, [settings]);

  const setFontSize = (fontSize: FontSizeOption) => {
    setSettings((prev) => ({ ...prev, fontSize }));
    announce(`Font size changed to ${fontSize}`);
  };

  const setHighContrast = (highContrast: boolean) => {
    setSettings((prev) => ({ ...prev, highContrast }));
    announce(`High contrast mode ${highContrast ? 'enabled' : 'disabled'}`);
  };

  const toggleHighContrast = () => {
    setHighContrast(!settings.highContrast);
  };

  const setReduceMotion = (reduceMotion: boolean) => {
    setSettings((prev) => ({ ...prev, reduceMotion }));
    announce(`Animations ${reduceMotion ? 'reduced' : 'normal'}`);
  };

  const setScreenReaderMode = (screenReaderMode: boolean) => {
    setSettings((prev) => ({ ...prev, screenReaderMode }));
    announce(`Enhanced screen reader labels ${screenReaderMode ? 'enabled' : 'disabled'}`);
  };

  const setSimplifiedUI = (simplifiedUI: boolean) => {
    setSettings((prev) => ({ ...prev, simplifiedUI }));
    announce(`Simplified interface ${simplifiedUI ? 'enabled' : 'disabled'}`);
  };

  const setAudioFeedback = (audioFeedback: boolean) => {
    setSettings((prev) => ({ ...prev, audioFeedback }));
    announce(`Audio guidance ${audioFeedback ? 'enabled' : 'disabled'}`);
  };

  const speakText = (text: string) => {
    if (!settings.audioFeedback) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Gentle, clear speed
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const announce = (message: string) => {
    setLiveAnnouncement(message);
    if (settings.audioFeedback) {
      speakText(message);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        setFontSize,
        setHighContrast,
        setReduceMotion,
        setScreenReaderMode,
        setSimplifiedUI,
        setAudioFeedback,
        toggleHighContrast,
        speakText,
        announce,
        liveAnnouncement
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
