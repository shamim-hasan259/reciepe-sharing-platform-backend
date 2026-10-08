import { Document, Model } from 'mongoose';

export type UserRole = 'ADMIN' | 'SELLER' | 'USER';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: UserRole;
  isBlocked: boolean;
  isPremium: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  isPasswordMatched(candidatePassword: string): Promise<boolean>;
}

export interface UserModel extends Model<IUserDocument> {
  isUserExistByEmail(email: string): Promise<IUserDocument | null>;
  isPasswordMatched(givenPassword: string, savedPassword: string): Promise<boolean>;
}
