import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import OrderService from './order.service';

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userEmail = req.user!.email;

  const result = await OrderService.createOrder(userId, userEmail, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Order created successfully',
    data: result
  });
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await OrderService.getMyOrders(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My orders retrieved successfully',
    meta: result.meta,
    data: result.data
  });
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const result = await OrderService.getOrderById(req.params.id as string, user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order retrieved successfully',
    data: result
  });
});

export const getAllOrdersAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrdersAdmin(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All orders retrieved successfully',
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

export const OrderController = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus
};

export default OrderController;
