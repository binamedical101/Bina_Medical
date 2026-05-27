import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/adminController.js';

const router = express.Router();

router.route('/dashboard').get(protect, admin, getDashboardStats);

export default router;
