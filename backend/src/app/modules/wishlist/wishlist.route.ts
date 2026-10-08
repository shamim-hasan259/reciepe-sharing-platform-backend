import { Router } from 'express';
import auth from '../../middleware/auth';
import WishlistController from './wishlist.controller';

const router = Router();

router.use(auth('USER'));

router.get('/', WishlistController.getUserWishlist);
router.post('/:recipeId', WishlistController.addToWishlist);
router.delete('/:recipeId', WishlistController.removeFromWishlist);

export const WishlistRoutes = router;
export default WishlistRoutes;
