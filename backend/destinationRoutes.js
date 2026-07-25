import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from './middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all destinations for a trip
router.get('/trip/:tripId', verifyToken, async (req, res) => {
    try {
        const trip = await prisma.trip.findFirst({
            where: { id: parseInt(req.params.tripId), userId: req.userId }
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        const destinations = await prisma.destination.findMany({
            where: { tripId: parseInt(req.params.tripId) },
            include: { activities: { include: { category: true } } },
            orderBy: { orderIndex: 'asc' }
        });

        res.json(destinations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a destination
router.post('/', verifyToken, async (req, res) => {
    try {
        const { tripId, name, orderIndex } = req.body;

        if (!tripId || !name || orderIndex === undefined) {
            return res.status(400).json({ error: 'tripId, name, and orderIndex are required' });
        }

        const trip = await prisma.trip.findFirst({
            where: { id: parseInt(tripId), userId: req.userId }
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        const destination = await prisma.destination.create({
            data: {
                tripId: parseInt(tripId),
                name,
                orderIndex: parseInt(orderIndex)
            }
        });

        res.json({ message: 'Destination created successfully', destination });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific destination
router.get('/:destinationId', verifyToken, async (req, res) => {
    try {
        const destination = await prisma.destination.findFirst({
            where: { id: parseInt(req.params.destinationId) },
            include: {
                trip: true,
                activities: { include: { category: true, images: true } },
                images: true
            }
        });

        if (!destination) {
            return res.status(404).json({ error: 'Destination not found' });
        }

        if (destination.trip.userId !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(destination);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a destination
router.put('/:destinationId', verifyToken, async (req, res) => {
    try {
        const { name, notes, visited, websiteUrl, mapUrl, orderIndex } = req.body;

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

        const updated = await prisma.destination.update({
            where: { id: parseInt(req.params.destinationId) },
            data: {
                name: name || undefined,
                notes: notes || undefined,
                visited: visited !== undefined ? visited : undefined,
                websiteUrl: websiteUrl || undefined,
                mapUrl: mapUrl || undefined,
                orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : undefined
            }
        });

        res.json({ message: 'Destination updated successfully', updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a destination
router.delete('/:destinationId', verifyToken, async (req, res) => {
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

        await prisma.destination.delete({
            where: { id: parseInt(req.params.destinationId) }
        });

        res.json({ message: 'Destination deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;