const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// POST Submit a contact message (Public)
const submitContactMessage = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            error: 'Name, email, and message are required fields'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
        return res.status(400).json({
            success: false,
            error: 'Please enter a valid email address'
        });
    }

    const contact = await prisma.contactMessage.create({
        data: {
            name: String(name).trim().slice(0, 150),
            email: String(email).trim().toLowerCase().slice(0, 200),
            message: String(message).trim().slice(0, 5000),
            status: 'unread'
        }
    });

    res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully! Thank you for reaching out.',
        data: { id: contact.id, created_at: contact.created_at }
    });
});

// GET All contact messages (Admin Protected)
const getContactMessages = asyncHandler(async (req, res) => {
    const messages = await prisma.contactMessage.findMany({
        orderBy: { created_at: 'desc' }
    });

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    res.json({
        success: true,
        count: messages.length,
        unreadCount,
        data: messages
    });
});

// PUT Update message status (Admin Protected)
const updateContactStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const validStatuses = ['unread', 'read', 'archived'];
    const newStatus = validStatuses.includes(status) ? status : 'read';

    const updated = await prisma.contactMessage.update({
        where: { id },
        data: { status: newStatus }
    });

    res.json({
        success: true,
        message: `Message status updated to ${newStatus}`,
        data: updated
    });
});

// DELETE Contact message (Admin Protected)
const deleteContactMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Message not found' });
    }

    await prisma.contactMessage.delete({ where: { id } });

    res.json({
        success: true,
        message: 'Message deleted successfully'
    });
});

module.exports = {
    submitContactMessage,
    getContactMessages,
    updateContactStatus,
    deleteContactMessage
};
