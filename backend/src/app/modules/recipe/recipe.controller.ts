import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import RecipeService from './recipe.service';

export const createRecipe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await RecipeService.createRecipe(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Recipe created successfully',
    data: result
  });
});

export const getAllRecipes = catchAsync(async (req: Request, res: Response) => {
  const result = await RecipeService.getAllRecipes(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recipes retrieved successfully',
    meta: result.meta,
    data: result.data
  });
});

export const getFeaturedRecipes = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 12;
  const result = await RecipeService.getFeaturedRecipes(limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Featured recipes retrieved successfully',
    data: result
  });
});

export const getPopularRecipes = catchAsync(async (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 12;
  const result = await RecipeService.getPopularRecipes(limit);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Popular recipes retrieved successfully',
    data: result
  });
});

export const getMyRecipes = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await RecipeService.getMyRecipes(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My recipes retrieved successfully',
    meta: result.meta,
    data: result.data
  });
});

export const getSingleRecipe = catchAsync(async (req: Request, res: Response) => {
  const result = await RecipeService.getSingleRecipe(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recipe retrieved successfully',
    data: result
  });
});

export const updateRecipe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const result = await RecipeService.updateRecipe(req.params.id as string, user, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recipe updated successfully',
    data: result
  });
});

export const deleteRecipe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  await RecipeService.deleteRecipe(req.params.id as string, user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recipe deleted successfully',
    data: null
  });
});

export const toggleLikeRecipe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await RecipeService.toggleLikeRecipe(req.params.id as string, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.isLiked ? 'Recipe liked successfully' : 'Recipe unliked successfully',
    data: result
  });
});

export const checkLikeStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await RecipeService.checkRecipeLikeStatus(req.params.id as string, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Like status retrieved',
    data: result
  });
});

export const RecipeController = {
  createRecipe,
  getAllRecipes,
  getFeaturedRecipes,
  getPopularRecipes,
  getMyRecipes,
  getSingleRecipe,
  updateRecipe,
  deleteRecipe,
  toggleLikeRecipe,
  checkLikeStatus
};

export default RecipeController;
