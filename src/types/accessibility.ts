export type FontSizeOption = 'normal' | 'large' | 'extralarge';

export interface AccessibilitySettings {
  fontSize: FontSizeOption;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderMode: boolean;
  simplifiedUI: boolean;
  audioFeedback: boolean;
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  reduceMotion: false,
  screenReaderMode: false,
  simplifiedUI: false,
  audioFeedback: false,
};
