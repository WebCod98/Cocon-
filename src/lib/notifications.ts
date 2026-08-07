/**
 * Notifications. Les vraies notifications push necessitent un serveur qui
 * detient les cles VAPID ; ici on utilise l'API Notification locale, relayee
 * par le service worker quand il est actif, ce qui couvre les rappels et les
 * alertes declenchees pendant que l'app tourne.
 */

export type Permission = 'default' | 'granted' | 'denied' | 'unsupported';

export function notificationPermission(): Permission {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as Permission;
}

export async function askNotificationPermission(): Promise<Permission> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission as Permission;
  try {
    return (await Notification.requestPermission()) as Permission;
  } catch {
    return 'denied';
  }
}

export async function notify(title: string, body: string, tag?: string) {
  if (notificationPermission() !== 'granted') return;
  const options: NotificationOptions = {
    body,
    tag,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
  };
  try {
    // Sur Android, seule la voie service worker fonctionne de maniere fiable.
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(title, options);
      return;
    }
  } catch {
    /* on retombe sur la notification simple */
  }
  try {
    new Notification(title, options);
  } catch {
    /* certains navigateurs interdisent le constructeur direct */
  }
}

/** Programme un rappel tant que l'onglet reste ouvert. */
export function scheduleLocal(atMs: number, title: string, body: string, tag?: string) {
  const delay = atMs - Date.now();
  if (delay <= 0 || delay > 24 * 3600 * 1000) return () => undefined;
  const id = window.setTimeout(() => void notify(title, body, tag), delay);
  return () => window.clearTimeout(id);
}
