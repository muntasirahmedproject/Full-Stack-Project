import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET || 'secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    });
};

export const verifyAdmin = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user || user.role?.toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.userRole = user.role;
        next();
    } catch (err) {
        res.status(500).json({ error: 'Admin check failed' });
    }
};
