import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import SellerService from './seller.service';

export const getSellerDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user!.userId;
  const result = await SellerService.getSellerDashboardStats(sellerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Seller dashboard statistics retrieved successfully',
    data: result
  });
});

export const getSellerRecipes = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user!.userId;
  const result = await SellerService.getSellerRecipes(sellerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Seller recipes retrieved successfully',
    data: result
  });
});

export const SellerController = {
  getSellerDashboardStats,
  getSellerRecipes
};

export default SellerController;
