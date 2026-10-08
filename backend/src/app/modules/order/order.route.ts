import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import OrderController from './order.controller';
import OrderValidation from './order.validation';

const router = Router();

// Customer order routes
router.post(
  '/',
  auth('USER'),
  validateRequest(OrderValidation.createOrderSchema),
  OrderController.createOrder
);

router.get('/my-orders', auth('USER'), OrderController.getMyOrders);
router.get('/:id', auth('USER', 'ADMIN'), OrderController.getOrderById);

export const OrderRoutes = router;
export default OrderRoutes;
