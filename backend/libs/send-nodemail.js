import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // Replace with your SMTP host
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
    },
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `Flowbase <${process.env.EMAIL_USER}>`, // Sender address
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};