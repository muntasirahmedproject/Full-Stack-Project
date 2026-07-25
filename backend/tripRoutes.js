import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from './middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard statistics for the logged-in user
router.get('/stats/dashboard', verifyToken, async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            where: { userId: req.userId },
            include: {
                destinations: {
                    include: {
                        activities: { include: { category: true } }
                    }
                }
            }
        });

        const allActivities = trips.flatMap(t => t.destinations.flatMap(d => d.activities));

        const totalPlanned = allActivities.reduce((sum, a) => sum + (a.budgetPlanned || 0), 0);
        const totalActual = allActivities.reduce((sum, a) => sum + (a.budgetActual || 0), 0);

        const visitedCount = allActivities.filter(a => a.visited).length;
        const percentVisited = allActivities.length > 0
            ? Math.round((visitedCount / allActivities.length) * 100)
            : 0;

        const spendByCategory = {};
        allActivities.forEach(a => {
            const catName = a.category?.name || 'Uncategorized';
            const amount = a.budgetActual || a.budgetPlanned || 0;
            spendByCategory[catName] = (spendByCategory[catName] || 0) + amount;
        });

        const tripsPerYear = {};
        trips.forEach(t => {
            const year = new Date(t.startDate).getFullYear();
            tripsPerYear[year] = (tripsPerYear[year] || 0) + 1;
        });

        res.json({
            totalTrips: trips.length,
            totalPlanned,
            totalActual,
            percentVisited,
            spendByCategory,
            tripsPerYear
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all trips for the logged-in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const trips = await prisma.trip.findMany({
            where: { userId: req.userId },
            include: { destinations: true, images: true }
        });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new trip
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, description, startDate, endDate, currency } = req.body;

        if (!title || !startDate || !endDate) {
            return res.status(400).json({ error: 'Title, startDate, and endDate are required' });
        }

        const trip = await prisma.trip.create({
            data: {
                userId: req.userId,
                title,
                description: description || '',
                currency: currency || 'USD',
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            }
        });

        res.json({ message: 'Trip created successfully', trip });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific trip
router.get('/:tripId', verifyToken, async (req, res) => {
    try {
        const trip = await prisma.trip.findFirst({
            where: { id: parseInt(req.params.tripId), userId: req.userId },
            include: {
                images: true,
                destinations: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        activities: {
                            orderBy: { dateTime: 'asc' },
                            include: { category: true, images: true }
                        },
                        images: true
                    }
                }
            }
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a trip
router.put('/:tripId', verifyToken, async (req, res) => {
    try {
        const { title, description, startDate, endDate, notes, currency } = req.body;

        const trip = await prisma.trip.updateMany({
            where: { id: parseInt(req.params.tripId), userId: req.userId },
            data: {
                title: title || undefined,
                description: description || undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                notes: notes || undefined,
                currency: currency || undefined
            }
        });

        if (trip.count === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json({ message: 'Trip updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a trip
router.delete('/:tripId', verifyToken, async (req, res) => {
    try {
        const trip = await prisma.trip.deleteMany({
            where: { id: parseInt(req.params.tripId), userId: req.userId }
        });

        if (trip.count === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;