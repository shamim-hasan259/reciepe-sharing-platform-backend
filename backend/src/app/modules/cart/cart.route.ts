import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import CartController from './cart.controller';
import CartValidation from './cart.validation';

const router = Router();

router.use(auth('USER'));

router.get('/', CartController.getCart);
router.post(
  '/',
  validateRequest(CartValidation.addToCartSchema),
  CartController.addToCart
);
router.patch(
  '/:recipeId',
  validateRequest(CartValidation.updateCartItemSchema),
  CartController.updateCartItem
);
router.delete('/:recipeId', CartController.removeFromCart);
router.delete('/', CartController.clearCart);

export const CartRoutes = router;
export default CartRoutes;
