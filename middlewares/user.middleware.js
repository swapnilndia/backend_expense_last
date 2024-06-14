import * as bcrypt from "bcrypt";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";

export const signupMiddleware = async (req, res, next) => {
  const { email } = req.body;
  const isExistingUser = await User.findOne({ where: { email: email } });
  if (isExistingUser) {
    return res.status(409).json(
      new ApiError(409, `User with Email:- ${email} already exist`, {
        email,
      }).toJSON()
    );
  }
  next();
};

export const signinMiddleware = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res.status(400).json(
      new ApiError(400, "Email and Password are required fields", {
        email,
        password,
      }).toJSON()
    );
  }
  const isExistingUser = await User.findOne({ where: { email: email } });
  if (!isExistingUser) {
    return res.status(404).json(
      new ApiError(404, `User with Email: ${email} does not exist`, {
        email,
      })
    );
  }
  const hashedPassword = await isExistingUser.password;
  console.log(password, hashedPassword);
  const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);
  if (!isPasswordCorrect) {
    return res.status(401).json(
      new ApiError(401, "Email or Password does not match", {
        email,
        password,
      }).toJSON()
    );
  }
  req.user = isExistingUser;
  next();
};

export const forgotPasswordMiddleware = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(
      new ApiError(
        400,
        "EmailId is required field to send the reset-password link",
        {
          email,
        }
      ).toJSON()
    );
  }
  try {
    const isExistingUser = await User.findOne({ where: { email: email } });
    if (!isExistingUser) {
      return res.status(404).json(
        new ApiError(404, `User with Email: ${email} does not exist`, {
          email,
        })
      );
    }
    req.user = isExistingUser.dataValues;
    next();
  } catch (error) {
    res.status(500).json(new ApiError(500, "Something went wrong", { token }));
  }
};

export const resetPasswordMiddleware = async (req, res, next) => {
  const { token, password } = req.body;
  console.log(token, password);
  if (!token || !password) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Token and new password are both required to reset the password"
        ).toJSON()
      );
  }

  try {
    const user = await User.findOne({ where: { reset_password_hash: token } });
    console.log(user);
    if (!user) {
      return res.status(404).json(new ApiError(404, "Invalid or wrong token"));
    }

    if (user.dataValues.reset_password_expiry_ms > Date.now()) {
      req.user = user.dataValues;
      return next();
    } else {
      return res.status(401).json(new ApiError(401, "Token Expired"));
    }
  } catch (error) {
    console.error("Error in resetPasswordMiddleware:", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Something went wrong 1", { error: error.message })
      );
  }
};
export const verifyEmailFinalizeMiddleware = async (req, res, next) => {
  const { token } = req.body;
  console.log(token);
  if (!token) {
    return res
      .status(400)
      .json(
        new ApiError(400, "Token is required to verify the email").toJSON()
      );
  }

  try {
    const user = await User.findOne({ where: { verify_email_hash: token } });
    if (!user) {
      return res.status(404).json(new ApiError(404, "Invalid or wrong token"));
    }

    if (user.dataValues.verify_email_expiry_ms > Date.now()) {
      req.user = user.dataValues;
      return next();
    } else {
      return res.status(401).json(new ApiError(401, "Token Expired"));
    }
  } catch (error) {
    console.error("Error in verifyEmailFinalizeMiddleware:", error);
    return res
      .status(500)
      .json(
        new ApiError(500, "Something went wrong 1", { error: error.message })
      );
  }
};
export const downloadMiddleware = async (req, res, next) => {
  const { email, userId } = req.user;
  try {
    const user = await User.findByPk(userId);
    const expenses = await user.getExpenses();
    const cleanedExpenses = expenses.map((expense) =>
      expense.get({ plain: true })
    );

    req.expenses = cleanedExpenses;
  } catch (error) {
    console.log(error);
  }
  next();
};
