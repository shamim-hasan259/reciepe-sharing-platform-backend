import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import UserService from './user.service';

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await UserService.updateUserProfile(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result
  });
});

export const getUserDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await UserService.getUserDashboardStats(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User dashboard statistics retrieved successfully',
    data: result
  });
});

export const UserController = {
  updateProfile,
  getUserDashboardStats
};

export default UserController;
