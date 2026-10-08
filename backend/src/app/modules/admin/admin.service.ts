import AppError from '../../errors/AppError';
import Order from '../order/order.model';
import Payment from '../payment/payment.model';
import Recipe from '../recipe/recipe.model';
import Report from '../report/report.model';
import { UserRole } from '../user/user.interface';
import User from '../user/user.model';

export const getAdminDashboardStats = async () => {
  const [
    totalUsers,
    totalSellers,
    totalRecipes,
    totalPremiumMembers,
    totalReports,
    totalOrders,
    revenueAggregation
  ] = await Promise.all([
    User.countDocuments({ role: 'USER' }),
    User.countDocuments({ role: 'SELLER' }),
    Recipe.countDocuments(),
    User.countDocuments({ isPremium: true }),
    Report.countDocuments(),
    Order.countDocuments(),
    Payment.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ])
  ]);

  const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

  // Additional aggregate statistics for rich dashboard insights
  const [recentUsers, recentOrders, pendingReportsCount] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(5),
    Order.find().sort({ createdAt: -1 }).limit(5),
    Report.countDocuments({ status: 'pending' })
  ]);

  return {
    totalUsers,
    totalSellers,
    totalRecipes,
    totalPremiumMembers,
    totalReports,
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    pendingReportsCount,
    recentUsers,
    recentOrders
  };
};

export const getAllUsers = async (query: any) => {
  const page = parseInt(String(query.page || '1'), 10);
  const limit = parseInt(String(query.limit || '10'), 10);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.role) {
    filter.role = query.role;
  }
  if (query.isBlocked !== undefined) {
    filter.isBlocked = query.isBlocked === 'true' || query.isBlocked === true;
  }
  if (query.isPremium !== undefined) {
    filter.isPremium = query.isPremium === 'true' || query.isPremium === true;
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    data: users
  };
};

export const blockUser = async (userId: string, currentAdminId: string) => {
  if (userId === currentAdminId) {
    throw new AppError(400, 'You cannot block your own admin account');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (user.role === 'ADMIN') {
    throw new AppError(400, 'Cannot block an admin account');
  }

  user.isBlocked = true;
  await user.save();

  return user;
};

export const unblockUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  user.isBlocked = false;
  await user.save();

  return user;
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  user.role = role;
  await user.save();

  return user;
};

export const toggleFeatureRecipe = async (recipeId: string, isFeatured: boolean) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  recipe.isFeatured = isFeatured;
  await recipe.save();

  return recipe;
};

export const AdminService = {
  getAdminDashboardStats,
  getAllUsers,
  blockUser,
  unblockUser,
  updateUserRole,
  toggleFeatureRecipe
};

export default AdminService;
