import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import Order from '../order/order.model';
import Wishlist from '../wishlist/wishlist.model';
import { IUser } from './user.interface';
import User from './user.model';

export const updateUserProfile = async (
  userId: string,
  payload: Partial<Pick<IUser, 'name' | 'image'>>
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      ...(payload.name && { name: payload.name.trim() }),
      ...(payload.image !== undefined && { image: payload.image })
    },
    { new: true, runValidators: true }
  );

  return updatedUser;
};

export const getUserDashboardStats = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const userObjectId = new Types.ObjectId(userId);

  const [totalFavorites, totalOrders, paidOrders] = await Promise.all([
    Wishlist.countDocuments({ userId: userObjectId }),
    Order.countDocuments({ userId: userObjectId }),
    Order.find({ userId: userObjectId, paymentStatus: 'paid' })
  ]);

  // Count total distinct recipes purchased across paid orders
  const purchasedRecipeIds = new Set<string>();
  paidOrders.forEach((order) => {
    order.items.forEach((item) => {
      purchasedRecipeIds.add(item.recipeId.toString());
    });
  });

  return {
    totalFavorites,
    totalOrders,
    totalPurchasedRecipes: purchasedRecipeIds.size,
    premiumStatus: user.isPremium,
    user: {
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role
    }
  };
};

export const UserService = {
  updateUserProfile,
  getUserDashboardStats
};

export default UserService;
