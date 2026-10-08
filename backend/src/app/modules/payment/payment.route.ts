import express, { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import PaymentController from './payment.controller';
import PaymentValidation from './payment.validation';

const router = Router();

router.post(
  '/checkout-order',
  auth('USER'),
  validateRequest(PaymentValidation.checkoutOrderSchema),
  PaymentController.createOrderCheckoutSession
);

router.post(
  '/checkout-premium',
  auth('USER', 'SELLER'),
  PaymentController.createPremiumCheckoutSession
);

router.post(
  '/verify-session',
  auth(),
  validateRequest(PaymentValidation.verifySessionSchema),
  PaymentController.verifySession
);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

router.get('/my-payments', auth(), PaymentController.getMyPayments);

export const PaymentRoutes = router;
export default PaymentRoutes;
