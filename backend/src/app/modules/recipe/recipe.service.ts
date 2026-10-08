import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import User from '../user/user.model';
import Like from './like.model';
import { IRecipe } from './recipe.interface';
import Recipe from './recipe.model';

export interface IRecipeFilterQuery {
  page?: string | number;
  limit?: string | number;
  category?: string;
  cuisine?: string;
  difficulty?: string;
  search?: string;
  searchTerm?: string;
  featured?: string | boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

export const createRecipe = async (
  userId: string,
  payload: Omit<IRecipe, 'authorId' | 'authorName' | 'authorEmail' | 'likesCount' | 'isFeatured'>
) => {
  const seller = await User.findById(userId);
  if (!seller) {
    throw new AppError(404, 'Seller user not found');
  }

  if (seller.role !== 'SELLER') {
    throw new AppError(403, 'Only sellers are permitted to create recipes');
  }

  // Free recipe limit check (Max 2 for non-premium sellers)
  if (!seller.isPremium) {
    const existingRecipeCount = await Recipe.countDocuments({ authorId: seller._id });
    if (existingRecipeCount >= 2) {
      throw new AppError(
        403,
        'Free recipe limit reached (maximum 2 recipes). Please upgrade to Premium membership for unlimited recipe creation.'
      );
    }
  }

  const recipeData: Partial<IRecipe> = {
    ...payload,
    authorId: seller._id as Types.ObjectId,
    authorName: seller.name,
    authorEmail: seller.email,
    likesCount: 0,
    isFeatured: false,
    status: 'published'
  };

  const recipe = await Recipe.create(recipeData);
  return recipe;
};

export const getAllRecipes = async (query: IRecipeFilterQuery) => {
  const page = parseInt(String(query.page || '1'), 10);
  const limit = parseInt(String(query.limit || '12'), 10);
  const skip = (page - 1) * limit;

  const filterConditions: any = {
    status: query.status || 'published'
  };

  // Category filtering (support multiple comma-separated categories using $in)
  if (query.category) {
    const categories = query.category
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    if (categories.length > 0) {
      const regexPatterns = categories.map((cat) => new RegExp(`^${cat}$`, 'i'));
      filterConditions.category = { $in: regexPatterns };
    }
  }

  // Cuisine filtering
  if (query.cuisine) {
    const cuisines = query.cuisine
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cuisines.length > 0) {
      const regexPatterns = cuisines.map((c) => new RegExp(`^${c}$`, 'i'));
      filterConditions.cuisineType = { $in: regexPatterns };
    }
  }

  // Difficulty filtering
  if (query.difficulty) {
    filterConditions.difficultyLevel = query.difficulty;
  }

  // Featured filtering
  if (query.featured !== undefined) {
    filterConditions.isFeatured = query.featured === 'true' || query.featured === true;
  }

  // Search keyword filtering across recipeName, category, cuisineType
  const search = query.search || query.searchTerm;
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filterConditions.$or = [
      { recipeName: searchRegex },
      { category: searchRegex },
      { cuisineType: searchRegex },
      { ingredients: searchRegex }
    ];
  }

  // Sorting
  let sortOption: any = { createdAt: -1 };
  if (query.sortBy === 'popular' || query.sortBy === 'likesCount') {
    sortOption = { likesCount: -1, createdAt: -1 };
  } else if (query.sortBy === 'prepTime') {
    sortOption = { preparationTime: query.sortOrder === 'desc' ? -1 : 1 };
  } else if (query.sortBy === 'price') {
    sortOption = { price: query.sortOrder === 'desc' ? -1 : 1 };
  }

  const [recipes, total] = await Promise.all([
    Recipe.find(filterConditions).sort(sortOption).skip(skip).limit(limit),
    Recipe.countDocuments(filterConditions)
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage
    },
    data: recipes
  };
};

export const getSingleRecipe = async (id: string) => {
  const recipe = await Recipe.findById(id);
  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }
  return recipe;
};

export const getFeaturedRecipes = async (limit = 12) => {
  const recipes = await Recipe.find({ isFeatured: true, status: 'published' })
    .sort({ likesCount: -1, createdAt: -1 })
    .limit(limit);
  return recipes;
};

export const getPopularRecipes = async (limit = 12) => {
  const recipes = await Recipe.find({ status: 'published' })
    .sort({ likesCount: -1, createdAt: -1 })
    .limit(limit);
  return recipes;
};

export const getMyRecipes = async (sellerId: string, query: IRecipeFilterQuery) => {
  const page = parseInt(String(query.page || '1'), 10);
  const limit = parseInt(String(query.limit || '12'), 10);
  const skip = (page - 1) * limit;

  const filterConditions: any = { authorId: sellerId };
  if (query.search) {
    filterConditions.recipeName = new RegExp(query.search.trim(), 'i');
  }

  const [recipes, total] = await Promise.all([
    Recipe.find(filterConditions).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Recipe.countDocuments(filterConditions)
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
    data: recipes
  };
};

export const updateRecipe = async (
  recipeId: string,
  user: { userId: string; role: string },
  payload: Partial<IRecipe>
) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  // Authorization check: Only ADMIN or the recipe owner (SELLER) can modify
  if (user.role === 'SELLER' && recipe.authorId.toString() !== user.userId) {
    throw new AppError(403, 'You are not authorized to update this recipe');
  }

  // Prevent non-admin users from altering administrative fields
  if (user.role !== 'ADMIN') {
    delete payload.isFeatured;
    delete payload.likesCount;
    delete (payload as any).authorId;
    delete (payload as any).authorName;
    delete (payload as any).authorEmail;
  }

  const updatedRecipe = await Recipe.findByIdAndUpdate(recipeId, payload, {
    new: true,
    runValidators: true
  });

  return updatedRecipe;
};

export const deleteRecipe = async (
  recipeId: string,
  user: { userId: string; role: string }
) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  // Authorization check: Only ADMIN or the recipe owner (SELLER) can delete
  if (user.role === 'SELLER' && recipe.authorId.toString() !== user.userId) {
    throw new AppError(403, 'You are not authorized to delete this recipe');
  }

  await Recipe.findByIdAndDelete(recipeId);
  await Like.deleteMany({ recipeId });

  return null;
};

export const toggleLikeRecipe = async (recipeId: string, userId: string) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  const user = await User.findById(userId);
  if (!user || user.role !== 'USER') {
    throw new AppError(403, 'Only customers (USER role) can like recipes');
  }

  const existingLike = await Like.findOne({
    userId: new Types.ObjectId(userId),
    recipeId: new Types.ObjectId(recipeId)
  });

  if (existingLike) {
    // Unlike
    await Like.findByIdAndDelete(existingLike._id);
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $inc: { likesCount: -1 } },
      { new: true }
    );
    const likesCount = Math.max(0, updatedRecipe?.likesCount || 0);
    return { isLiked: false, likesCount };
  } else {
    // Like
    await Like.create({
      userId: new Types.ObjectId(userId),
      recipeId: new Types.ObjectId(recipeId)
    });
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );
    return { isLiked: true, likesCount: updatedRecipe?.likesCount || 1 };
  }
};

export const checkRecipeLikeStatus = async (recipeId: string, userId: string) => {
  const existingLike = await Like.findOne({
    userId: new Types.ObjectId(userId),
    recipeId: new Types.ObjectId(recipeId)
  });
  return { isLiked: !!existingLike };
};

export const RecipeService = {
  createRecipe,
  getAllRecipes,
  getSingleRecipe,
  getFeaturedRecipes,
  getPopularRecipes,
  getMyRecipes,
  updateRecipe,
  deleteRecipe,
  toggleLikeRecipe,
  checkRecipeLikeStatus
};

export default RecipeService;
