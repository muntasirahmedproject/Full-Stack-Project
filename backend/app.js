import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './authRoutes.js';
import tripRoutes from './tripRoutes.js';
import destinationRoutes from './destinationRoutes.js';
import activityRoutes from './activityRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import adminRoutes from './adminRoutes.js';
import imageRoutes from './imageRoutes.js';

const app = express();

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4643',
        'http://localhost:8080',
        'https://trip-planner-frontend-r9py.onrender.com'
    ]
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
    res.json({ message: 'TripPlanner API is running' });
});

app.use('/auth', authRoutes);
app.use('/trips', tripRoutes);
app.use('/destinations', destinationRoutes);
app.use('/activities', activityRoutes);
app.use('/categories', categoryRoutes);
app.use('/admin', adminRoutes);
app.use('/images', imageRoutes);

export default app;