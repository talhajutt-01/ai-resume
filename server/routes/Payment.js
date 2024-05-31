const express = require('express');
const router = express.Router();
const { handlePrintCV, createCheckoutSession, confirmPayment } = require('../controllers/paymentController');

router.post('/print-cv', handlePrintCV);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/confirm-payment', confirmPayment);

module.exports = router;
