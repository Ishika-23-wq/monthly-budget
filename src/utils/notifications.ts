import { TaskItem } from '../types';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    alert('Browser notifications are not supported on this browser.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      sendNotification('🔔 Notifications Enabled!', {
        body: 'You will receive timely alerts on phone & laptop for expenses, fees deadlines & tasks.',
        icon: '/favicon.png'
      });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

export function sendNotification(title: string, options?: NotificationOptions): boolean {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notif = new Notification(title, {
      icon: '/favicon.png',
      badge: '/favicon.png',
      ...options
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return true;
  } catch (e) {
    console.warn('Could not display notification:', e);
    return false;
  }
}

export function notifyExpenseLogged(amount: number, categoryName: string, title: string) {
  sendNotification(`💸 Payment Logged: ₹${amount.toLocaleString('en-IN')}`, {
    body: `${title} logged in ${categoryName}. Daily safe-to-spend limit updated.`,
    tag: 'expense-logged'
  });
}

export function notifyTaskDue(task: TaskItem, daysLeft: number) {
  let timeStr = daysLeft === 0 ? 'DUE TODAY!' : daysLeft === 1 ? 'Due TOMORROW!' : `Due in ${daysLeft} days!`;
  sendNotification(`⏰ Task Reminder: ${task.title}`, {
    body: `${timeStr} (Deadline: ${task.deadline}). Check your budget & task list.`,
    tag: `task-${task.id}`
  });
}

export function notifySisterFeeAlert(daysLeft: number) {
  sendNotification(`🚨 Sister's Fees Deadline: 7 Dec 2026`, {
    body: `${daysLeft} days remaining! Ensure ₹15,000 cash reserve + Dec 7 salary is prepared for fees.`,
    tag: 'sister-fee-deadline'
  });
}
