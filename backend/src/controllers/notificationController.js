const notificationService = require('../services/notificationService');

class NotificationController {
  async listNotifications(req, res, next) {
    try {
      const list = await notificationService.getUserNotifications(req.user.id);
      res.status(200).json({
        success: true,
        count: list.length,
        data: list
      });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req, res, next) {
    try {
      const notification = await notificationService.markRead(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
