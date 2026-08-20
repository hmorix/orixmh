export type NotificationAudience = 'all' | 'users' | 'employees' | 'team' | 'sales' | 'selected'
export type NotificationPriority = 'normal' | 'important' | 'urgent'

export type AppNotification = {
  _id?: string
  id?: string
  title: string
  message: string
  audience?: NotificationAudience | string
  priority?: NotificationPriority | string
  channel?: string
  read?: boolean
  createdAt?: string
  createdBy?: string
  selectedIds?: string[]
}

const STORAGE_KEY = 'hm_admin_notifications'
const SEEN_BROWSER_KEY = 'hm_seen_browser_notifications'
export const NOTIFICATION_EVENT = 'hm-notifications-updated'

export function getLocalNotifications() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    const data = value ? JSON.parse(value) : []
    return Array.isArray(data) ? data as AppNotification[] : []
  } catch {
    return []
  }
}

export function saveLocalNotification(notification: AppNotification) {
  const createdAt = notification.createdAt || new Date().toISOString()
  const next = {
    ...notification,
    id: notification.id || `local-${Date.now()}`,
    createdAt,
    read: false,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...getLocalNotifications()].slice(0, 50)))
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT))
  return next
}

export function markLocalNotificationsRead() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getLocalNotifications().map(item => ({ ...item, read: true }))))
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT))
}

export function notificationMatchesContext(notification: AppNotification, role?: string, pathname = window.location.pathname) {
  const audience = String(notification.audience || 'all').toLowerCase()
  const normalizedRole = String(role || '').toLowerCase()
  if (audience === 'all') return true
  if (audience === 'selected') return true
  if (audience === 'users') return ['user', 'client', 'customer'].includes(normalizedRole) || ['/portal', '/dashboard', '/profile'].some(path => pathname.startsWith(path))
  if (audience === 'employees') return ['employee', 'hr', 'manager', 'crm'].includes(normalizedRole) || pathname.startsWith('/employee')
  if (audience === 'team') return ['manager', 'hr', 'employee'].includes(normalizedRole) || pathname.startsWith('/manager') || pathname.startsWith('/employee')
  if (audience === 'sales') return normalizedRole === 'crm' || pathname.startsWith('/sales') || pathname.startsWith('/crm')
  return true
}

export function supportsBrowserNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getBrowserNotificationPermission() {
  if (!supportsBrowserNotifications()) return 'unsupported'
  return window.Notification.permission
}

export async function requestBrowserNotificationPermission() {
  if (!supportsBrowserNotifications()) return 'unsupported'
  if (window.Notification.permission === 'granted') return 'granted'
  if (window.Notification.permission === 'denied') return 'denied'
  return window.Notification.requestPermission()
}

export function showBrowserNotification(notification: AppNotification) {
  if (!supportsBrowserNotifications() || window.Notification.permission !== 'granted') return false
  const title = notification.title || 'HMorix notification'
  const body = notification.message || ''
  const desktopNotification = new window.Notification(title, {
    body,
    tag: String(notification._id || notification.id || title),
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    silent: notification.priority === 'normal',
  })
  desktopNotification.onclick = () => {
    window.focus()
    desktopNotification.close()
  }
  return true
}

export function notifyUnseenBrowserNotifications(notifications: AppNotification[]) {
  if (!supportsBrowserNotifications() || window.Notification.permission !== 'granted') return
  let seen: string[] = []
  try {
    const stored = localStorage.getItem(SEEN_BROWSER_KEY)
    seen = stored ? JSON.parse(stored) : []
  } catch {
    seen = []
  }

  const nextSeen = new Set(seen)
  notifications
    .filter(item => !item.read)
    .filter(item => {
      const key = String(item._id || item.id || `${item.title}-${item.createdAt || ''}`)
      if (nextSeen.has(key)) return false
      nextSeen.add(key)
      return true
    })
    .slice(0, 3)
    .forEach(item => showBrowserNotification(item))

  localStorage.setItem(SEEN_BROWSER_KEY, JSON.stringify(Array.from(nextSeen).slice(-100)))
}
