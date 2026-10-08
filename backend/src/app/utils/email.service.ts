import nodemailer from 'nodemailer';
import config from '../config';

interface ISendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password
    }
  });

  public static async sendEmail({ to, subject, html, text }: ISendEmailPayload): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.smtp.from,
        to,
        subject,
        text: text || html.replace(/<[^>]*>?/gm, ''),
        html
      });
    } catch (error) {
      console.error('Email delivery error:', error);
      // We don't throw an unhandled error so email delivery failure in dev does not crash the server
    }
  }

  public static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${config.password_reset_url}?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #e53e3e; text-align: center;">RecipeHub Password Reset</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your RecipeHub account. Please click the button below to reset your password. This link is valid for 10 minutes only.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #e53e3e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">© RecipeHub. All rights reserved.</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'RecipeHub - Password Reset Request',
      html
    });
  }
}

export default EmailService;
