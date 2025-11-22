const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await Notification.countDocuments({
            userId: req.user.userId,
            read: false
        });

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: { details: error.message },
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        // If id is 'all', mark all as read
        if (id === 'all') {
            await Notification.updateMany(
                { userId: req.user.userId, read: false },
                { read: true }
            );
            return res.json({
                success: true,
                message: 'All notifications marked as read',
            });
        }

        const notification = await Notification.findOne({
            _id: id,
            userId: req.user.userId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        notification.read = true;
        await notification.save();

        res.json({
            success: true,
            message: 'Notification marked as read',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating notification',
            error: { details: error.message },
        });
    }
};

// Helper to create notification (internal use)
const createNotification = async (userId, title, message, type = 'info') => {
    try {
        await Notification.create({
            userId,
            title,
            message,
            type,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    createNotification,
};
