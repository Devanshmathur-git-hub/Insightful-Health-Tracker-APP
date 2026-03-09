const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');

exports.getNotifications = asyncHandler(async (req, res) => {
    const { read, limit = 20 } = req.query;
    const query = { user: req.user.id };
    if (read !== undefined) query.read = read === 'true';

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
});

exports.markAsRead = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user.id });
    if (!notification) return next(new ErrorResponse('Notification not found', 404));

    notification.read = true;
    notification.readAt = Date.now();
    await notification.save();

    res.status(200).json({ success: true, data: notification });
});

exports.markAllRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user.id, read: false },
        { read: true, readAt: Date.now() }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

exports.createNotification = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
});
