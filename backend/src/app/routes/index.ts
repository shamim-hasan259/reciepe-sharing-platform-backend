import { Router } from 'express';
import AdminRoutes from '../modules/admin/admin.route';
import AuthRoutes from '../modules/auth/auth.route';
import CartRoutes from '../modules/cart/cart.route';
import CategoryRoutes from '../modules/category/category.route';
import CommentRoutes from '../modules/comment/comment.route';
import OrderRoutes from '../modules/order/order.route';
import PaymentRoutes from '../modules/payment/payment.route';
import RecipeRoutes from '../modules/recipe/recipe.route';
import ReportRoutes from '../modules/report/report.route';
import SellerRoutes from '../modules/seller/seller.route';
import UserRoutes from '../modules/user/user.route';
import WishlistRoutes from '../modules/wishlist/wishlist.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/sellers', route: SellerRoutes },
  { path: '/recipes', route: RecipeRoutes },
  { path: '/categories', route: CategoryRoutes },
  { path: '/comments', route: CommentRoutes },
  { path: '/wishlist', route: WishlistRoutes },
  { path: '/cart', route: CartRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/payment', route: PaymentRoutes },
  { path: '/reports', route: ReportRoutes },
  { path: '/admin', route: AdminRoutes }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
