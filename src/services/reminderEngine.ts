import { ReminderItem } from '../types/health';
import { sound } from '../utils/audio';

export interface ActiveNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  actionText?: string;
  actionPayload?: any;
}

type NotificationListener = (notification: ActiveNotification) => void;

class ReminderEngine {
  private reminders: ReminderItem[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private intervalId: number | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    this.startChecking();
  }

  public setReminders(reminders: ReminderItem[]) {
    this.reminders = reminders;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public subscribe(listener: NotificationListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public triggerNotification(notif: ActiveNotification) {
    if (this.soundEnabled) {
      sound.playNotification();
    }

    // Try browser notification if granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notif.title, {
          body: notif.message,
          icon: '/favicon.svg'
        });
      } catch (e) {
        console.warn('Native notification failed', e);
      }
    }

    // Dispatch to in-app toast listeners
    this.listeners.forEach(fn => fn(notif));
  }

  public testReminder(type: string = 'water') {
    const titles: Record<string, string> = {
      water: '💧 Time to Drink Water!',
      exercise: '🏃 Time for Your Workout!',
      breakfast: '🍳 Breakfast Time!',
      lunch: '🥗 Time for a Nutritious Lunch!',
      dinner: '🍲 Dinner Time!',
      sleep: '🌙 Time to Wind Down for Sleep'
    };

    const messages: Record<string, string> = {
      water: 'Stay hydrated! Grab a fresh glass of water (250ml) to keep your energy and metabolism sharp.',
      exercise: 'Ready to crush your workout goal? Put on your shoes and get moving!',
      breakfast: 'Fuel your day with a high-protein breakfast to kickstart your metabolism.',
      lunch: 'Take a break and enjoy a balanced, fiber-rich lunch.',
      dinner: 'Wrap up your day with a light, nutritious dinner.',
      sleep: 'Turn off bright screens, dim the lights, and prepare for restorative deep sleep.'
    };

    this.triggerNotification({
      id: Date.now().toString(),
      title: titles[type] || '⏰ Healthy Me Reminder',
      message: messages[type] || 'Time to check in on your daily health and wellness goals!',
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionText: type === 'water' ? '+250 ml Water' : undefined,
      actionPayload: type === 'water' ? { amountMl: 250 } : undefined
    });
  }

  private startChecking() {
    if (this.intervalId) return;

    this.intervalId = window.setInterval(() => {
      this.checkScheduledReminders();
    }, 20000); // Check every 20 seconds
  }

  private checkScheduledReminders() {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMin = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    this.reminders.forEach(rem => {
      if (!rem.enabled) return;

      // Fixed time match
      if (rem.time && rem.time === currentTimeStr) {
        const lastTrig = rem.lastTriggered ? new Date(rem.lastTriggered) : null;
        const diffMins = lastTrig ? (now.getTime() - lastTrig.getTime()) / 60000 : 999;
        
        if (diffMins > 2) {
          rem.lastTriggered = now.toISOString();
          this.triggerNotification({
            id: Date.now().toString(),
            title: rem.title,
            message: rem.message,
            type: rem.type,
            timestamp: currentTimeStr
          });
        }
      }
    });
  }

  public async requestBrowserPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

export const reminderEngine = new ReminderEngine();
