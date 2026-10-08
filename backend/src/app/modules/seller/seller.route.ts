import { Router } from 'express';
import auth from '../../middleware/auth';
import SellerController from './seller.controller';

const router = Router();

router.use(auth('SELLER'));

router.get('/dashboard', SellerController.getSellerDashboardStats);
router.get('/recipes', SellerController.getSellerRecipes);

export const SellerRoutes = router;
export default SellerRoutes;
