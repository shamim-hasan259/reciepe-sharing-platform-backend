import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import OrderValidation from '../order/order.validation';
import AdminController from './admin.controller';
import AdminValidation from './admin.validation';

const router = Router();

router.use(auth('ADMIN'));

router.get('/dashboard', AdminController.getDashboardStats);

router.get('/users', AdminController.getAllUsers);
router.patch('/users/:id/block', AdminController.blockUser);
router.patch('/users/:id/unblock', AdminController.unblockUser);
router.patch(
  '/users/:id/role',
  validateRequest(AdminValidation.updateUserRoleSchema),
  AdminController.updateUserRole
);

router.patch(
  '/recipes/:id/feature',
  validateRequest(AdminValidation.featureRecipeSchema),
  AdminController.toggleFeatureRecipe
);

router.get('/orders', AdminController.getAllOrders);
router.patch(
  '/orders/:id',
  validateRequest(OrderValidation.updateOrderStatusSchema),
  AdminController.updateOrderStatus
);

router.get('/transactions', AdminController.getAllTransactions);

export const AdminRoutes = router;
export default AdminRoutes;
