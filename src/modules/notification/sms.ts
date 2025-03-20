/* import twilio from "twilio";
import Logger from "../../config/logger"; // Adjust the import path as needed
import "dotenv/config";

// Initialize the Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendWelcomeSMS = async (to: string, displayName: string) => {
  const messageBody = `Hello ${displayName},

Thanks for signing up to use the PoliSync app! You've taken the first step toward simplifying your insurance management.

With PoliSync, you can now keep all your insurance policies from different providers in one convenient place.

Have questions? Contact our support team at ${process.env.SUPPORT_PHONE_NUMBER}.

Best regards,
The PoliSync Team`;

  try {
    await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    Logger.info(`Welcome SMS sent to ${to}`);
  } catch (error) {
    Logger.error(`Failed to send welcome SMS to ${to}`, error);
  }
}; */