import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { placeOrder, cancelOrderById, getOrderBook, getUserOrders } from '../controllers/orderController';

const router = Router();

// Public order book (no auth needed)
router.get('/book', getOrderBook);

// Protected routes
router.use(authenticate);
router.post('/', placeOrder);
router.delete('/:orderId', cancelOrderById);
router.get('/my', getUserOrders);

export default router;
