import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getLinkToken,
  exchangeToken,
  getBankAccounts,
  getBalance,
  initiateDepositRequest,
} from '../controllers/fiatController';

const router = Router();

// All fiat routes require authentication
router.use(authenticate);

router.get('/link-token', getLinkToken);
router.post('/exchange-token', exchangeToken);
router.get('/bank-accounts', getBankAccounts);
router.get('/balance', getBalance);
router.post('/deposit', initiateDepositRequest);

export default router;
