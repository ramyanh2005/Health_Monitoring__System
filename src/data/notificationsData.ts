import type { NotificationItem } from '../types/wellness';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_water_1',
    title: 'Hydration Check-in 💧',
    message: 'Time for a fresh glass of water! A small sip now keeps your energy up and joints lubricated.',
    type: 'water',
    timestamp: '10:30 AM',
    read: false,
    icon: 'Droplet'
  },
  {
    id: 'notif_movement_1',
    title: 'Gentle Movement Break 🌱',
    message: 'A short 5-minute seated shoulder roll or wrist stretch can ease sitting fatigue.',
    type: 'activity',
    timestamp: '11:45 AM',
    read: false,
    icon: 'Sparkles'
  },
  {
    id: 'notif_meal_1',
    title: 'Nourishing Lunch Window 🥗',
    message: 'Remember to enjoy your meal mindfully with adequate hydration and protein.',
    type: 'meal',
    timestamp: '1:15 PM',
    read: true,
    icon: 'Utensils'
  },
  {
    id: 'notif_streak_1',
    title: '7-Day Streak Maintained 🔥',
    message: "Wonderful consistency! You've maintained your wellness streak for 7 consecutive days.",
    type: 'streak',
    timestamp: 'Yesterday',
    read: true,
    icon: 'Flame'
  }
];
