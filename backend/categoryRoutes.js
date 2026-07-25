import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, verifyAdmin } from './middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all categories
router.get('/', verifyToken, async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a category (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const category = await prisma.category.create({
            data: { name }
        });

        res.json({ message: 'Category created successfully', category });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Category name already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Update a category (admin only)
router.put('/:categoryId', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const category = await prisma.category.update({
            where: { id: parseInt(req.params.categoryId) },
            data: { name }
        });

        res.json({ message: 'Category updated successfully', category });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Category name already exists' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Delete a category (admin only)
router.delete('/:categoryId', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await prisma.category.delete({
            where: { id: parseInt(req.params.categoryId) }
        });

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(500).json({ error: error.message });
    }
});

export default router;