import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService.js';

export async function listNotifications(req, res, next) {
  try {
    const notifications = await getUserNotifications(req.user.id);
    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    await markNotificationAsRead(req.user.id, id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req, res, next) {
  try {
    await markAllNotificationsAsRead(req.user.id);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    next(err);
  }
}

export default {
  listNotifications,
  markAsRead,
  markAllRead,
};
