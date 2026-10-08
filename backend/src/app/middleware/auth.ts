import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { UserRole } from '../modules/user/user.interface';
import User from '../modules/user/user.model';
import { verifyToken } from '../utils/token.utils';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        userId: string;
        email: string;
        role: UserRole;
        isPremium?: boolean;
        isBlocked?: boolean;
      };
    }
  }
}

export const auth = (...requiredRoles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token: string | undefined = req.cookies?.token || req.cookies?.accessToken;

      if (!token && req.headers.authorization) {
        if (req.headers.authorization.startsWith('Bearer ')) {
          token = req.headers.authorization.split(' ')[1];
        }
      }

      if (!token) {
        throw new AppError(401, 'You are not authorized to access this route');
      }

      let verifiedToken: JwtPayload;
      try {
        verifiedToken = verifyToken(token, config.jwt.secret);
      } catch (err) {
        throw new AppError(401, 'Invalid or expired token');
      }

      const { userId, role } = verifiedToken;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(404, 'User does not exist');
      }

      if (user.isBlocked) {
        throw new AppError(403, 'Your account has been blocked. Access denied.');
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw new AppError(403, `Access forbidden: Required role [${requiredRoles.join(', ')}]`);
      }

      req.user = {
        _id: user._id.toString(),
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        isBlocked: user.isBlocked
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorizeRoles = (...roles: UserRole[]) => auth(...roles);
export const authenticateUser = auth();

export default auth;
