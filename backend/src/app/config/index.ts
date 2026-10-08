import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  database_url: process.env.MONGODB_URI || 'mongodb://localhost:27017/recipehub',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_recipehub_safe',
    expires_in: process.env.JWT_EXPIRES_IN || '7d'
  },
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY || 'sk_test_mock',
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock'
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'RecipeHub Support <support@recipehub.com>'
  },
  password_reset_url: process.env.PASSWORD_RESET_URL || 'http://localhost:3000/reset-password'
};
