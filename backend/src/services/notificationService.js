const db = require('../models/db');

class NotificationService {
  async getUserNotifications(userId) {
    return db.listNotifications(userId);
  }

  async markAsRead(id, userId) {
    const notification = await db.markNotificationRead(id, userId);
    if (!notification) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }
    return notification;
  }

  async markAllAsRead(userId) {
    const count = await db.markAllNotificationsRead(userId);
    return { markedCount: count };
  }
}

module.exports = new NotificationService();
