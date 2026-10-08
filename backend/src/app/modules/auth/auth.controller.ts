import { Request, Response } from 'express';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AuthService from './auth.service';

const cookieOptions = {
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: config.env === 'production' ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  res.cookie('token', result.accessToken, cookieOptions);
  res.cookie('accessToken', result.accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  res.cookie('token', result.accessToken, cookieOptions);
  res.cookie('accessToken', result.accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? ('none' as const) : ('lax' as const)
  });
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? ('none' as const) : ('lax' as const)
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged out successfully',
    data: null
  });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await AuthService.getCurrentUser(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Current user profile retrieved successfully',
    data: result
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body.email);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null
  });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await AuthService.changePassword(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: null
  });
});

export const AuthController = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword
};

export default AuthController;
