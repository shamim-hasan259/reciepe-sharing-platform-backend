import { z } from 'zod';

const passwordValidation = z
  .string({ required_error: 'Password is required' })
  .min(6, { message: 'Password must be at least 6 characters long' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' });

export const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: passwordValidation,
    image: z.string().optional()
  })
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required')
  })
});

export const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address')
  })
});

export const resetPasswordValidationSchema = z.object({
  body: z.object({
    token: z.string({ required_error: 'Reset token is required' }),
    password: passwordValidation
  })
});

export const changePasswordValidationSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }),
    newPassword: passwordValidation
  })
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
  changePasswordValidationSchema
};

export default AuthValidation;
