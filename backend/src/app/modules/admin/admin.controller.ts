import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import OrderService from '../order/order.service';
import PaymentService from '../payment/payment.service';
import RecipeService from '../recipe/recipe.service';
import AdminService from './admin.service';

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAdminDashboardStats();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin dashboard statistics retrieved successfully',
    data: result
  });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    meta: result.meta,
    data: result.data
  });
});

export const blockUser = catchAsync(async (req: Request, res: Response) => {
  const currentAdminId = req.user!.userId;
  const result = await AdminService.blockUser(req.params.id as string, currentAdminId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User blocked successfully',
    data: result
  });
});

export const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.unblockUser(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User unblocked successfully',
    data: result
  });
});

export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  const result = await AdminService.updateUserRole(id as string, role);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User role updated successfully',
    data: result
  });
});

export const toggleFeatureRecipe = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isFeatured } = req.body;

  const result = await AdminService.toggleFeatureRecipe(id as string, isFeatured);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: isFeatured ? 'Recipe featured successfully' : 'Recipe unfeatured successfully',
    data: result
  });
});

export const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrdersAdmin(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders retrieved successfully',
    meta: result.meta,
    data: result.data
  });
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.updateOrderStatus(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order status updated successfully',
    data: result
  });
});

export const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllTransactionsAdmin(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Transactions retrieved successfully',
    meta: result.meta,
    data: result.data
  });
});

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  blockUser,
  unblockUser,
  updateUserRole,
  toggleFeatureRecipe,
  getAllOrders,
  updateOrderStatus,
  getAllTransactions
};

export default AdminController;
