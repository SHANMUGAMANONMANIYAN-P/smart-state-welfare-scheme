import { query } from '../config/db.js';

/**
 * Fetch all notifications for a citizen
 */
export async function getUserNotifications(userId) {
  const notifications = await query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return notifications || [];
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(userId, notificationId) {
  await query(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );
  return { success: true };
}

/**
 * Mark all notifications for user as read
 */
export async function markAllNotificationsAsRead(userId) {
  await query(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    [userId]
  );
  return { success: true };
}

/**
 * Create a new notification
 */
export async function createNotification({ userId, title, message, type = 'system' }) {
  const result = await query(
    'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, 0)',
    [userId, title, message, type]
  );
  return { id: result.insertId, userId, title, message, type, is_read: 0 };
}

export default {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
};
