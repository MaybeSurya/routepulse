import FormData from "form-data";
import Mailgun from "mailgun.js";
import { env } from "@route-pulse/env/server";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: env.MAILGUN_API_KEY || "dummy-key",
});

export const MailService = {
  async sendPasswordResetEmail(email: string, token: string) {
    // In production, we'd use the actual frontend URL
    const baseUrl = env.CORS_ORIGIN || "http://localhost:3001";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
    
    console.log(`[MailService] Sending reset email to ${email}. Token: ${token}`);
    
    // If no API key, we skip actual sending to avoid errors in dev
    if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN) {
      console.warn("[MailService] Skipping email send: MAILGUN_API_KEY or MAILGUN_DOMAIN not set");
      return { id: "skipped" };
    }

    try {
      return await mg.messages.create(env.MAILGUN_DOMAIN, {
        from: `RoutePulse <${env.MAILGUN_FROM_EMAIL}>`,
        to: [email],
        subject: "Reset Your Password - RoutePulse",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6366F1;">Reset Your Password</h2>
            <p>You requested a password reset for your RoutePulse account.</p>
            <p>Click the button below to reset it. This link expires in 1 hour.</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #6366F1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
            <p style="font-size: 12px; color: #666;">RoutePulse Dashboard • Admin Command Center</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("[MailService] Failed to send password reset email:", error);
      throw error;
    }
  },
};
