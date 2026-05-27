import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getInventoryStatus } from '../controllers/inventoryController.js';

const router = express.Router();

router.route('/').get(protect, admin, getInventoryStatus);

export default router;
