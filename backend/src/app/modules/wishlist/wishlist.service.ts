import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import Recipe from '../recipe/recipe.model';
import Wishlist from './wishlist.model';

export const addToWishlist = async (userId: string, recipeId: string) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  const existing = await Wishlist.findOne({
    userId: new Types.ObjectId(userId),
    recipeId: new Types.ObjectId(recipeId)
  });

  if (existing) {
    throw new AppError(400, 'Recipe is already in your wishlist');
  }

  const item = await Wishlist.create({
    userId: new Types.ObjectId(userId),
    recipeId: new Types.ObjectId(recipeId)
  });

  return await item.populate('recipeId');
};

export const removeFromWishlist = async (userId: string, recipeId: string) => {
  const existing = await Wishlist.findOne({
    userId: new Types.ObjectId(userId),
    recipeId: new Types.ObjectId(recipeId)
  });

  if (!existing) {
    throw new AppError(404, 'Recipe is not in your wishlist');
  }

  await Wishlist.findByIdAndDelete(existing._id);
  return null;
};

export const getUserWishlist = async (userId: string) => {
  const wishlistItems = await Wishlist.find({ userId: new Types.ObjectId(userId) })
    .populate({
      path: 'recipeId',
      select: 'recipeName recipeImage category cuisineType difficultyLevel preparationTime likesCount isFeatured price authorName'
    })
    .sort({ createdAt: -1 });

  return wishlistItems;
};

export const WishlistService = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist
};

export default WishlistService;
