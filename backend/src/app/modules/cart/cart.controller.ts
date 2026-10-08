import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import CartService from './cart.service';

export const addToCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { recipeId, quantity } = req.body;

  const result = await CartService.addToCart(userId, recipeId, quantity);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recipe added to cart',
    data: result
  });
});

export const getCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await CartService.getCart(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cart retrieved successfully',
    data: result
  });
});

export const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { recipeId } = req.params;
  const { quantity } = req.body;

  const result = await CartService.updateCartItemQuantity(userId, recipeId as string, quantity);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cart updated successfully',
    data: result
  });
});

export const removeFromCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { recipeId } = req.params;

  const result = await CartService.removeFromCart(userId, recipeId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Recipe removed from cart',
    data: result
  });
});

export const clearCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await CartService.clearCart(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cart cleared successfully',
    data: result
  });
});

export const CartController = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

export default CartController;
