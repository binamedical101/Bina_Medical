import express from 'express';

const router = express.Router();

router.get('/config/payu', (req, res) =>
  res.send({ merchantKey: process.env.PAYU_MERCHANT_KEY })
);

export default router;
