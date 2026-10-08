import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import WishlistService from './wishlist.service';

export const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { recipeId } = req.params;

  const result = await WishlistService.addToWishlist(userId, recipeId as string);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Recipe added to wishlist',
    data: result
  });
});

export const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { recipeId } = req.params;

  await WishlistService.removeFromWishlist(userId, recipeId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recipe removed from wishlist',
    data: null
  });
});

export const getUserWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await WishlistService.getUserWishlist(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wishlist retrieved successfully',
    data: result
  });
});

export const WishlistController = {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist
};

export default WishlistController;
