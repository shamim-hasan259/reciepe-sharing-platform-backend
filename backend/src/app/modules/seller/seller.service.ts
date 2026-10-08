import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import Comment from '../comment/comment.model';
import Recipe from '../recipe/recipe.model';
import User from '../user/user.model';

export const getSellerDashboardStats = async (sellerId: string) => {
  const seller = await User.findById(sellerId);
  if (!seller) {
    throw new AppError(404, 'Seller not found');
  }

  const sellerObjectId = new Types.ObjectId(sellerId);

  // Aggregation for total recipes and total likes across seller's recipes
  const recipeStats = await Recipe.aggregate([
    { $match: { authorId: sellerObjectId } },
    {
      $group: {
        _id: null,
        totalRecipes: { $sum: 1 },
        totalLikes: { $sum: '$likesCount' }
      }
    }
  ]);

  const totalRecipes = recipeStats.length > 0 ? recipeStats[0].totalRecipes : 0;
  const totalLikes = recipeStats.length > 0 ? recipeStats[0].totalLikes : 0;

  // Get recipe IDs of this seller to count comments
  const sellerRecipes = await Recipe.find({ authorId: sellerObjectId }).select('_id');
  const recipeIds = sellerRecipes.map((r) => r._id);

  const totalComments = await Comment.countDocuments({ recipeId: { $in: recipeIds } });

  return {
    totalRecipes,
    totalLikes,
    totalComments,
    premiumStatus: seller.isPremium,
    sellerInfo: {
      name: seller.name,
      email: seller.email,
      image: seller.image
    }
  };
};

export const getSellerRecipes = async (sellerId: string) => {
  return await Recipe.find({ authorId: new Types.ObjectId(sellerId) }).sort({ createdAt: -1 });
};

export const SellerService = {
  getSellerDashboardStats,
  getSellerRecipes
};

export default SellerService;
