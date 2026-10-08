import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';
import { IUserDocument, UserModel } from './user.interface';

const userSchema = new Schema<IUserDocument, UserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    image: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['ADMIN', 'SELLER', 'USER'],
      default: 'USER'
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    isPremium: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret: any) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPasswordMatched = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.statics.isUserExistByEmail = async function (
  email: string
): Promise<IUserDocument | null> {
  return await this.findOne({ email }).select('+password +resetPasswordToken +resetPasswordExpires');
};

userSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

export const User = model<IUserDocument, UserModel>('User', userSchema);
export default User;
