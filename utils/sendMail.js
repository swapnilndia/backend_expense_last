import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import ApiError from "./ApiError.js";

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const sendForgotPasswordMail = async (req, res, next) => {
  const { id, email } = req.user;
  const hashedToken = await bcrypt.hash(id.toString(), 10);
  const resetPasswordTokenExpiry = Date.now() + 3600000;
  const redirectURL = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${hashedToken}`;
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: "Reset Password Request",
    html: `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background-color: #f7941e; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
            Expense Tracker
        </div>
        <div style="padding: 30px; text-align: center;">
            <h1 style="font-size: 24px; color: #333333;">Forgot Password</h1>
            <p style="font-size: 16px; color: #333333;">Hi ${email}</p>
            <p style="font-size: 16px; color: #333333;">To reset your Expense Tracker password click on the following link and follow the instruction.</p>
            <p style="font-size: 16px; color: #333333;">This link is valid only for 1 hour.</p>
            <a href=${redirectURL} style="display: inline-block; background-color: #f7941e; color: white; padding: 10px 20px; font-size: 16px; border-radius: 5px; text-decoration: none; margin-top: 20px;">Reset Password</a>
        </div>
        <div style="background-color: #333333; color: white; text-align: center; padding: 10px; font-size: 14px;">
            Expense Tracker Copyright © 2024
        </div>
    </div>
</body>`,
  };
  try {
    const response = await transporter.sendMail(mailOptions);
    if (response.accepted.length > 0) {
      req.user.hashedToken = hashedToken;
      req.user.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
      next();
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong", { error }));
  }
};
export const sendVerifyUserMail = async (req, res, next) => {
  console.log(req.user);
  const { userId, email } = req.user;
  const hashedToken = await bcrypt.hash(userId.toString(), 10);
  const resetPasswordTokenExpiry = Date.now() + 3600000;
  const redirectURL = `${process.env.FRONTEND_BASE_URL}/verify-email?token=${hashedToken}`;
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: "Verify Email Request",
    html: `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background-color: #f7941e; color: white; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;">
            Expense Tracker
        </div>
        <div style="padding: 30px; text-align: center;">
            <h1 style="font-size: 24px; color: #333333;">Email Verification</h1>
            <p style="font-size: 16px; color: #333333;">Hi ${email}</p>
            <p style="font-size: 16px; color: #333333;">To Verify you email click on the following link and follow the instruction.</p>
            <p style="font-size: 16px; color: #333333;">This link is valid only for 1 hour.</p>
            <a href=${redirectURL} style="display: inline-block; background-color: #f7941e; color: white; padding: 10px 20px; font-size: 16px; border-radius: 5px; text-decoration: none; margin-top: 20px;">Verify Email</a>
        </div>
        <div style="background-color: #333333; color: white; text-align: center; padding: 10px; font-size: 14px;">
            Expense Tracker Copyright © 2024
        </div>
    </div>
</body>`,
  };
  try {
    const response = await transporter.sendMail(mailOptions);
    if (response.accepted.length > 0) {
      req.user.verify_email_hash = hashedToken;
      req.user.verify_email_expiry_ms = resetPasswordTokenExpiry;
      next();
    }
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong", { error }));
  }
};
