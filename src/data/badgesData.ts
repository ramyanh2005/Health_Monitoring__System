import type { Badge } from '../types/wellness';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge_water_hero',
    title: 'Hydration Hero',
    description: 'Achieve your recommended daily water target consistently for 7 days.',
    iconName: 'Droplet',
    unlocked: true,
    unlockedAt: '2026-08-24',
    progress: 100,
    criteria: '7/7 days water target achieved',
    category: 'water'
  },
  {
    id: 'badge_active_starter',
    title: 'Active Starter',
    description: 'Complete your personalized daily movement or stretching for 5 days.',
    iconName: 'Sparkles',
    unlocked: true,
    unlockedAt: '2026-08-22',
    progress: 100,
    criteria: '5/5 days gentle activity logged',
    category: 'activity'
  },
  {
    id: 'badge_healthy_choice',
    title: 'Healthy Choice',
    description: 'Consistently log and nourish your body with wholesome balanced meals for 7 days.',
    iconName: 'Leaf',
    unlocked: true,
    unlockedAt: '2026-08-23',
    progress: 100,
    criteria: '7/7 days nutrition logged',
    category: 'nutrition'
  },
  {
    id: 'badge_7_day_streak',
    title: '7-Day Wellness Streak',
    description: 'Maintain an uninterrupted 7-day streak of daily wellness goals.',
    iconName: 'Flame',
    unlocked: true,
    unlockedAt: '2026-08-25',
    progress: 100,
    criteria: '7 consecutive streak days',
    category: 'streak'
  },
  {
    id: 'badge_mindful_mover',
    title: 'Mindful Mover',
    description: 'Complete your first interactive guided gentle seated or breathing session.',
    iconName: 'HeartHandshake',
    unlocked: true,
    unlockedAt: '2026-08-20',
    progress: 100,
    criteria: '1 guided routine completed',
    category: 'activity'
  },
  {
    id: 'badge_consistency_champion',
    title: 'Consistency Champion',
    description: 'Maintain a 30-day continuous wellness streak across all health habits.',
    iconName: 'Award',
    unlocked: false,
    progress: 45,
    criteria: '14/30 consecutive days',
    category: 'streak'
  },
  {
    id: 'badge_breathing_master',
    title: 'Zen Breathe Master',
    description: 'Complete 10 mindful breathing & relaxation sessions.',
    iconName: 'Wind',
    unlocked: false,
    progress: 60,
    criteria: '6/10 breathing sessions',
    category: 'activity'
  },
  {
    id: 'badge_hydration_master_30',
    title: 'Hydration Master 30',
    description: 'Drink optimal water intake for 30 days total.',
    iconName: 'Waves',
    unlocked: false,
    progress: 70,
    criteria: '21/30 total days',
    category: 'water'
  }
];
