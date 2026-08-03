import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'user'
            }
        });

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({ message: 'User registered successfully', token, userId: user.id, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordMatch = await bcryptjs.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({ message: 'Login successful', token, userId: user.id, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'No account found with that email' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.user.update({
            where: { email },
            data: { resetToken, resetTokenExpiry }
        });

        // In production this token would be emailed, not returned directly.
        res.json({ message: 'Reset token generated', resetToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({ error: 'Email, reset token, and new password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.resetToken !== resetToken) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
