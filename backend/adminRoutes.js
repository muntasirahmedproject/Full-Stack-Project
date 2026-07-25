import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, verifyAdmin } from './middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (admin only)
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isDisabled: true,
                createdAt: true
            }
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Disable a user (admin only)
router.put('/users/:userId/disable', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(req.params.userId) },
            data: { isDisabled: true },
            select: { id: true, name: true, email: true, isDisabled: true }
        });

        res.json({ message: 'User disabled successfully', user });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Enable a user (admin only)
router.put('/users/:userId/enable', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(req.params.userId) },
            data: { isDisabled: false },
            select: { id: true, name: true, email: true, isDisabled: true }
        });

        res.json({ message: 'User enabled successfully', user });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Get platform statistics (admin only)
router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalTrips = await prisma.trip.count();
        const totalDestinations = await prisma.destination.count();
        const totalActivities = await prisma.activity.count();

        const stats = {
            totalUsers,
            totalTrips,
            totalDestinations,
            totalActivities
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;