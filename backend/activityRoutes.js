import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from './middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

const isWithinTripRange = (activityDateTime, tripStart, tripEnd) => {
    const actDateOnly = new Date(activityDateTime).toISOString().split('T')[0];
    const startDateOnly = new Date(tripStart).toISOString().split('T')[0];
    const endDateOnly = new Date(tripEnd).toISOString().split('T')[0];
    return actDateOnly >= startDateOnly && actDateOnly <= endDateOnly;
};

// Get all activities for a destination
router.get('/destination/:destinationId', verifyToken, async (req, res) => {
    try {
        const destination = await prisma.destination.findFirst({
            where: { id: parseInt(req.params.destinationId) },
            include: { trip: true }
        });

        if (!destination) {
            return res.status(404).json({ error: 'Destination not found' });
        }

        if (destination.trip.userId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const activities = await prisma.activity.findMany({
            where: { destinationId: parseInt(req.params.destinationId) },
            include: { category: true },
            orderBy: { dateTime: 'asc' }
        });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create an activity
router.post('/', verifyToken, async (req, res) => {
    try {
        const { destinationId, categoryId, name, dateTime, budgetPlanned, websiteUrl } = req.body;

        if (!destinationId || !categoryId || !name || !dateTime) {
            return res.status(400).json({ error: 'destinationId, categoryId, name, and dateTime are required' });
        }

        const destination = await prisma.destination.findFirst({
            where: { id: parseInt(destinationId) },
            include: { trip: true }
        });

        if (!destination) {
            return res.status(404).json({ error: 'Destination not found' });
        }

        if (destination.trip.userId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (!isWithinTripRange(dateTime, destination.trip.startDate, destination.trip.endDate)) {
            const start = new Date(destination.trip.startDate).toLocaleDateString();
            const end = new Date(destination.trip.endDate).toLocaleDateString();
            return res.status(400).json({ error: `Activity date must be within the trip's dates (${start} - ${end})` });
        }

        const activity = await prisma.activity.create({
            data: {
                destinationId: parseInt(destinationId),
                categoryId: parseInt(categoryId),
                name,
                dateTime: new Date(dateTime),
                budgetPlanned: parseFloat(budgetPlanned) || 0,
                websiteUrl: websiteUrl || undefined
            },
            include: { category: true }
        });

        res.json({ message: 'Activity created successfully', activity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific activity
router.get('/:activityId', verifyToken, async (req, res) => {
    try {
        const activity = await prisma.activity.findFirst({
            where: { id: parseInt(req.params.activityId) },
            include: { destination: { include: { trip: true } }, category: true }
        });

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        if (activity.destination.trip.userId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an activity
router.put('/:activityId', verifyToken, async (req, res) => {
    try {
        const { name, notes, dateTime, categoryId, budgetPlanned, budgetActual, visited, rating, websiteUrl, mapUrl } = req.body;

        const activity = await prisma.activity.findFirst({
            where: { id: parseInt(req.params.activityId) },
            include: { destination: { include: { trip: true } } }
        });

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        if (activity.destination.trip.userId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (dateTime) {
            const trip = activity.destination.trip;
            if (!isWithinTripRange(dateTime, trip.startDate, trip.endDate)) {
                const start = new Date(trip.startDate).toLocaleDateString();
                const end = new Date(trip.endDate).toLocaleDateString();
                return res.status(400).json({ error: `Activity date must be within the trip's dates (${start} - ${end})` });
            }
        }

        const updated = await prisma.activity.update({
            where: { id: parseInt(req.params.activityId) },
            data: {
                name: name || undefined,
                notes: notes || undefined,
                dateTime: dateTime ? new Date(dateTime) : undefined,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
                budgetPlanned: budgetPlanned !== undefined ? parseFloat(budgetPlanned) : undefined,
                budgetActual: budgetActual !== undefined ? parseFloat(budgetActual) : undefined,
                visited: visited !== undefined ? visited : undefined,
                rating: rating !== undefined ? parseInt(rating) : undefined,
                websiteUrl: websiteUrl || undefined,
                mapUrl: mapUrl || undefined
            },
            include: { category: true }
        });

        res.json({ message: 'Activity updated successfully', updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an activity
router.delete('/:activityId', verifyToken, async (req, res) => {
    try {
        const activity = await prisma.activity.findFirst({
            where: { id: parseInt(req.params.activityId) },
            include: { destination: { include: { trip: true } } }
        });

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        if (activity.destination.trip.userId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.activity.delete({
            where: { id: parseInt(req.params.activityId) }
        });

        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;