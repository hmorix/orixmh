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
