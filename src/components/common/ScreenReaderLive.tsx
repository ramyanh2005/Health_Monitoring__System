import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';

export const ScreenReaderLive: React.FC = () => {
  const { liveAnnouncement } = useAccessibility();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      className="sr-only"
    >
      {liveAnnouncement}
    </div>
  );
};
