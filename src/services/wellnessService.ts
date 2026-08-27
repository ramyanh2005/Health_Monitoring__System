import type { MobilityLevel, ActivityLevel } from '../types/user';
import confetti from 'canvas-confetti';

export const wellnessService = {
  /**
   * Calculates gentle, recommended water target based on user metrics
   */
  calculateRecommendedWater(weightKg: number, activityLevel: ActivityLevel): number {
    const base = weightKg * 33; // 33ml per kg baseline
    let activityBonus = 0;
    if (activityLevel === 'Moderate') activityBonus = 250;
    if (activityLevel === 'Active') activityBonus = 450;
    
    // Round to nearest 100ml
    const total = Math.max(1500, Math.min(3500, base + activityBonus));
    return Math.round(total / 100) * 100;
  },

  /**
   * Calculates tailored gentle activity minutes baseline
   */
  calculateRecommendedActivityMin(mobility: MobilityLevel, activity: ActivityLevel): number {
    if (mobility === 'Bed-rest / Low mobility') return 10;
    if (mobility === 'Wheelchair user' || mobility === 'Limited mobility') {
      return activity === 'Active' ? 25 : activity === 'Moderate' ? 20 : 15;
    }
    if (mobility === 'Assisted walking') return 15;
    return activity === 'Active' ? 30 : activity === 'Moderate' ? 25 : 20;
  },

  /**
   * Fires a pleasant, non-obtrusive confetti celebration
   */
  celebrateGoal(): void {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0d9488', '#14b8a6', '#38bdf8', '#fbbf24', '#34d399']
      });
    } catch {
      // safe fallback if canvas confetti is not mounted
    }
  },

  /**
   * Formats ml into liters with one decimal place
   */
  formatLiters(ml: number): string {
    return (ml / 1000).toFixed(1) + ' L';
  },

  /**
   * Gets a context-aware motivational greeting
   */
  getTimeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
};
