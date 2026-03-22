import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { addGasCredits, getGasBalance, estimateGasCost } from '../controllers/gasController';

const router = Router();

// Public estimate endpoint (doesn't need auth)
router.post('/estimate', estimateGasCost);

// Protected routes
router.use(authenticate);
router.post('/add', addGasCredits);
router.get('/balance', getGasBalance);

export default router;
