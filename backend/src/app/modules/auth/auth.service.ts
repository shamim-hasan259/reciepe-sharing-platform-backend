import config from '../../config';
import AppError from '../../errors/AppError';
import EmailService from '../../utils/email.service';
import { createToken, generateResetToken, hashToken } from '../../utils/token.utils';
import { IUser } from '../user/user.interface';
import User from '../user/user.model';
import { IChangePasswordPayload, ILoginPayload, IResetPasswordPayload } from './auth.interface';

export const registerUser = async (payload: Partial<IUser>) => {
  const isExist = await User.findOne({ email: payload.email?.toLowerCase().trim() });
  if (isExist) {
    throw new AppError(400, 'A user with this email already exists');
  }

  // Prevent role escalation by sanitizing input fields
  const safeUserData: Partial<IUser> = {
    name: payload.name,
    email: payload.email?.toLowerCase().trim(),
    password: payload.password,
    image: payload.image || '',
    role: 'USER',
    isBlocked: false,
    isPremium: false
  };

  const newUser = await User.create(safeUserData);

  const tokenPayload = {
    userId: newUser._id.toString(),
    email: newUser.email,
    role: newUser.role
  };

  const accessToken = createToken(
    tokenPayload,
    config.jwt.secret,
    config.jwt.expires_in
  );

  return {
    user: newUser,
    accessToken
  };
};

export const loginUser = async (payload: ILoginPayload) => {
  const user = await User.isUserExistByEmail(payload.email.toLowerCase().trim());
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.isBlocked) {
    throw new AppError(403, 'Your account has been blocked. Please contact support.');
  }

  const isMatched = await user.isPasswordMatched(payload.password);
  if (!isMatched) {
    throw new AppError(401, 'Invalid email or password');
  }

  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };

  const accessToken = createToken(
    tokenPayload,
    config.jwt.secret,
    config.jwt.expires_in
  );

  // Return user without password
  const safeUser = await User.findById(user._id);

  return {
    user: safeUser,
    accessToken
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  if (user.isBlocked) {
    throw new AppError(403, 'Your account has been blocked');
  }
  return user;
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  
  if (user && !user.isBlocked) {
    const { resetToken, hashedToken } = generateResetToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    await EmailService.sendPasswordResetEmail(user.email, resetToken);
  }

  return {
    message: 'If an account exists with this email, a password reset link has been sent.'
  };
};

export const resetPassword = async (payload: IResetPasswordPayload) => {
  const hashedToken = hashToken(payload.token);

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw new AppError(400, 'Invalid or expired password reset token');
  }

  user.password = payload.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return {
    message: 'Password reset successfully'
  };
};

export const changePassword = async (userId: string, payload: IChangePasswordPayload) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const isMatched = await user.isPasswordMatched(payload.currentPassword);
  if (!isMatched) {
    throw new AppError(400, 'Current password does not match');
  }

  user.password = payload.newPassword;
  await user.save();

  return {
    message: 'Password changed successfully'
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword
};

export default AuthService;
