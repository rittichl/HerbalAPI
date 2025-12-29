import { Router } from 'express';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        transactionId: req.transactionId,
        message: 'Transaction ID test endpoint'
    });
});

export default router;

