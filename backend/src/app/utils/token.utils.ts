import crypto from 'crypto';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

export interface ITokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'USER';
}

export const createToken = (
  jwtPayload: ITokenPayload,
  secret: Secret,
  expiresIn: string
): string => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn as SignOptions['expiresIn']
  });
};

export const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const generateResetToken = (): { resetToken: string; hashedToken: string } => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, hashedToken };
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
