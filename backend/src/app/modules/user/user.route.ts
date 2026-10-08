import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import UserController from './user.controller';
import UserValidation from './user.validation';

const router = Router();

router.patch(
  '/profile',
  auth(),
  validateRequest(UserValidation.updateProfileSchema),
  UserController.updateProfile
);

router.get('/dashboard', auth('USER'), UserController.getUserDashboardStats);

export const UserRoutes = router;
export default UserRoutes;
