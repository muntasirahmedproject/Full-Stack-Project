import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from './middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (isValid) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Upload an image for a trip, destination, or activity
router.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const { tripId, destinationId, activityId } = req.body;

        if (!tripId && !destinationId && !activityId) {
            return res.status(400).json({ error: 'Must provide tripId, destinationId, or activityId' });
        }

        const image = await prisma.image.create({
            data: {
                filename: req.file.filename,
                tripId: tripId ? parseInt(tripId) : null,
                destinationId: destinationId ? parseInt(destinationId) : null,
                activityId: activityId ? parseInt(activityId) : null
            }
        });

        res.json({ message: 'Image uploaded successfully', image });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get images for a destination
router.get('/destination/:destinationId', verifyToken, async (req, res) => {
    try {
        const images = await prisma.image.findMany({
            where: { destinationId: parseInt(req.params.destinationId) }
        });
        res.json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an image
router.delete('/:imageId', verifyToken, async (req, res) => {
    try {
        const image = await prisma.image.findFirst({
            where: { id: parseInt(req.params.imageId) }
        });

        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const filePath = path.join(uploadsDir, image.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.image.delete({ where: { id: parseInt(req.params.imageId) } });

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;