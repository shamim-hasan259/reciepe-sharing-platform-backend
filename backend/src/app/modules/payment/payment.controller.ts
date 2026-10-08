import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import PaymentService from './payment.service';

export const createOrderCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userEmail = req.user!.email;
  const { orderId } = req.body;

  const result = await PaymentService.createOrderCheckoutSession(userId, userEmail, orderId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order checkout session created',
    data: result
  });
});

export const createPremiumCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userEmail = req.user!.email;

  const result = await PaymentService.createPremiumCheckoutSession(userId, userEmail);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Premium membership checkout session created',
    data: result
  });
});

export const verifySession = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const result = await PaymentService.verifyAndProcessSession(sessionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment session processed successfully',
    data: result
  });
});

export const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const result = await PaymentService.handleStripeWebhook(req.body, sig);

  res.status(200).json(result);
});

export const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await PaymentService.getUserPayments(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result
  });
});

export const PaymentController = {
  createOrderCheckoutSession,
  createPremiumCheckoutSession,
  verifySession,
  handleWebhook,
  getMyPayments
};

export default PaymentController;
