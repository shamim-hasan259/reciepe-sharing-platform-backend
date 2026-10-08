import bcrypt from 'bcryptjs';
import AuthService from '../app/modules/auth/auth.service';
import User from '../app/modules/user/user.model';
import * as tokenUtils from '../app/utils/token.utils';

jest.mock('../app/modules/user/user.model');
jest.mock('../app/utils/email.service');

describe('Auth Service & Security Suite', () => {
  const mockUser = {
    _id: '60d0fe4f5311236168a109ca',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$hashedpassword',
    role: 'USER',
    isBlocked: false,
    isPremium: false,
    save: jest.fn().mockResolvedValue(true),
    isPasswordMatched: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Registration & Role Escalation Prevention', () => {
    it('should register a new user as USER and reject role escalation', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        role: 'USER',
        isBlocked: false,
        isPremium: false
      });

      const result = await AuthService.registerUser({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'ADMIN' as any, // Escalation attempt
        isBlocked: true as any
      });

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'USER',
          isBlocked: false,
          isPremium: false
        })
      );
      expect(result.accessToken).toBeDefined();
      expect(result.user.role).toBe('USER');
    });

    it('should throw AppError if user email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        AuthService.registerUser({
          name: 'John Duplicate',
          email: 'john@example.com',
          password: 'Password123'
        })
      ).rejects.toThrow('already exists');
    });
  });

  describe('Login & Blocked User Protection', () => {
    it('should authenticate user and return access token', async () => {
      const userInstance = {
        ...mockUser,
        isPasswordMatched: jest.fn().mockResolvedValue(true)
      };

      (User.isUserExistByEmail as jest.Mock).mockResolvedValue(userInstance);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.loginUser({
        email: 'john@example.com',
        password: 'Password123'
      });

      expect(result.accessToken).toBeDefined();
      expect(result.user?.email).toBe('john@example.com');
    });

    it('should reject login if account is blocked', async () => {
      const blockedUser = {
        ...mockUser,
        isBlocked: true
      };

      (User.isUserExistByEmail as jest.Mock).mockResolvedValue(blockedUser);

      await expect(
        AuthService.loginUser({
          email: 'john@example.com',
          password: 'Password123'
        })
      ).rejects.toThrow('blocked');
    });

    it('should reject login with wrong password', async () => {
      const userInstance = {
        ...mockUser,
        isPasswordMatched: jest.fn().mockResolvedValue(false)
      };

      (User.isUserExistByEmail as jest.Mock).mockResolvedValue(userInstance);

      await expect(
        AuthService.loginUser({
          email: 'john@example.com',
          password: 'WrongPassword'
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('Password Reset Cryptographic Tokens', () => {
    it('should generate secure reset token and return safe generic message', async () => {
      const userInstance = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(userInstance);

      const result = await AuthService.forgotPassword('john@example.com');

      expect(result.message).toContain('password reset link has been sent');
      expect(userInstance.save).toHaveBeenCalled();
    });

    it('should return the same generic message even if email does not exist (anti-enumeration)', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const result = await AuthService.forgotPassword('nonexistent@example.com');

      expect(result.message).toContain('password reset link has been sent');
    });
  });

  describe('Change Password Flow', () => {
    it('should change password after verifying current password', async () => {
      const userInstance = {
        ...mockUser,
        isPasswordMatched: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(userInstance)
      });

      const result = await AuthService.changePassword('60d0fe4f5311236168a109ca', {
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456'
      });

      expect(result.message).toBe('Password changed successfully');
      expect(userInstance.password).toBe('NewPassword456');
      expect(userInstance.save).toHaveBeenCalled();
    });
  });
});
