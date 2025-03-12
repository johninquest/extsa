import nodemailer from "nodemailer";
import Logger from "../../config/logger"; // Adjust the import path as needed
import "dotenv/config";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/* export const sendWelcomeEmail = async (to: string, displayName: string) => {
    displayName = 'TheFreded';
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Welcome to Our Service',
    text: `Hello ${displayName},\n\nWelcome to our service! We're glad to have you with us.\n\nBest regards,\nThe PoliSync Team`,
    html: `<p>Hello ${displayName},</p><p>Welcome to our service! We're glad to have you with us.</p><p>Best regards,<br>The Team</p>`,
  }; */

export const sendWelcomeEmail = async (to: string, displayName: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "Welcome to PoliSync - Your Insurance Simplified",
    text: `Hello ${displayName},
  
  Thanks for signing up to use the PoliSync app! 
  
  You've taken the first step toward simplifying your insurance management. With PoliSync, you can now keep all your insurance policies from different providers in one convenient place.
  
  In the coming days, we'll guide you through adding your first policies and getting the most out of the app. Stay tuned for helpful tips on organizing your insurance portfolio.
  
  Have questions? Simply reply to this email, and our support team will be happy to help.
  
  Best regards,
  The PoliSync Team`,
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #0f4c81;">Welcome to PoliSync!</h2>
    <p>Hello ${displayName},</p>
    <p>Thanks for signing up to use the PoliSync app! You've taken the first step toward simplifying your insurance management.</p>
    <p><strong>With PoliSync, you can now:</strong></p>
    <ul>
      <li>Organize all your insurance policies in one place</li>
      <li>Track policy details and renewal dates</li>
      <li>Access your insurance information anytime, anywhere</li>
    </ul>
    <p>In the coming days, we'll guide you through adding your first policies and getting the most out of the app. Stay tuned for helpful tips on organizing your insurance portfolio.</p>
    <p>Have questions? Simply reply to this email, and our support team will be happy to help.</p>
    <p>Best regards,<br>The PoliSync Team</p>
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
      <p>PoliSync - Your Insurance, Simplified</p>
    </div>
  </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    Logger.info(`Welcome email sent to ${to}`);
  } catch (error) {
    Logger.error(`Failed to send welcome email to ${to}`, error);
  }
};
