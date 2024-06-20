import User from "../models/user.model.js";
import Download from "../models/download.model.js";
import * as bcrypt from "bcrypt";
import moment from "moment-timezone";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/helperFunctions.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadtoS3 } from "../utils/awsService.js";

// import { uploadtoS3 } from "../utils/awsService.js";

// https://s3.ap-south-1.amazonaws.com/expense.tracker-1/Expenses-Swapnilktr1%40gmail.com-2024-06-11T14-51-16.746Z.txt
// https://s3.ap-south-1.amazonaws.com/expense.tracker-1/Expenses-Swapnilktr1%40gmail.com-2024-06-11T14-51-16.746Z.txt
export const signup_controller = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const createUser = await User.create({
      email,
      name,
      password: hashedPassword,
    });
    if (!createUser) {
      return res.status(400).json(
        new ApiError(400, "Unable to process request at this time", {
          email,
          password,
          name,
        }).toJSON()
      );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, "User successfully Signed Up", createUser).toJSON()
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          "500",
          "Internal server error",
          "Something went wrong",
          error
        ).toJSON()
      );
  }
};

export const signin_controller = async (req, res) => {
  const { email } = req.body;
  const { id, isVerified, isPrimary } = req.user;
  try {
    const saltOrRounds = 10;
    const access_token = generateAccessToken(email, id, isPrimary, isVerified);
    const refresh_token = generateRefreshToken(email, id);

    const hashed_refresh_token = await bcrypt.hash(refresh_token, saltOrRounds);

    const currentTimeIST = moment().tz("Asia/Kolkata").format();
    const updateObject = await User.update(
      {
        access_token: access_token, // Use camel case property names
        refresh_token, // Use camel case property names
        refresh_token_expiry: currentTimeIST,
      },
      {
        where: {
          id,
        },
        returning: true,
      }
    );
    if (!updateObject) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Please try after sometime", { email }).toJSON()
        );
    }
    res.status(200).json(
      new ApiResponse(
        200,
        "User successfully logged in",
        {
          email,
          id,
          access_token,
          refresh_token: hashed_refresh_token,
        },
        null
      ).toJSON()
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError("500", "Something went wrong", error).toJSON());
  }
};
export const signout_controller = async (req, res) => {
  const { userId } = req.user;
  try {
    const [logout] = await User.update(
      { access_token: null, refresh_token: null, refresh_token_expiry: null },
      {
        where: {
          id: userId,
        },
      }
    );
    if (logout === 0) {
      return res.status(404).json(new ApiError(404, "User not found", {}));
    }
    res
      .status(204)
      .json(
        new ApiResponse(204, "User successfully logged out", {}, null).toJSON()
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError("500", "Something went wrong", error).toJSON());
  }
};

export const get_user_controller = async (req, res) => {
  const { userId } = req.user;
  try {
    const userData = await User.findByPk(userId);
    if (!userData) {
      return res.status(404).json(new ApiError(404, "User not found", {}));
    }
    res.status(200).json(
      new ApiResponse(
        200,
        "User details fetched successfully",
        {
          userData,
        },
        null
      ).toJSON()
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong", error).toJSON());
  }
};

export const refresh_controller = async (req, res) => {
  const { email, id, isPrimary, isVerified } = req.userData;
  const { refreshToken } = req.body;
  try {
    // if both access token and refresh token are verified. then update the database with new access token
    const access_token = generateAccessToken(email, id, isPrimary, isVerified);
    const updateObject = await User.update(
      {
        access_token, // Use camel case property names
      },
      {
        where: {
          id,
        },
        returning: true,
      }
    );
    if (!updateObject) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Please try after sometime", { email }).toJSON()
        );
    }
    res.status(200).json(
      new ApiResponse(
        200,
        "Access Token Refreshed",
        {
          email,
          id,
          access_token,
          refresh_token: refreshToken,
        },
        null
      ).toJSON()
    );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Something went wrong", error).toJSON());
  }
};

export const forgot_password_controller = async (req, res) => {
  const { id, hashedToken, resetPasswordTokenExpiry, email } = req.user;

  try {
    const updateUser = await User.update(
      {
        reset_password_hash: hashedToken,
        reset_password_expiry_ms: resetPasswordTokenExpiry,
      },
      {
        where: {
          id,
        },
        returning: true,
      }
    );
    if (!updateUser) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Please try after sometime", { email }).toJSON()
        );
    }
    res.status(200).json(
      new ApiResponse(
        200,
        "Email with update link sent successfully",
        {
          email,
        },
        null
      ).toJSON()
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Something went wrong", { error }));
  }
};

export const verify_email_initialize_controller = async (req, res) => {
  console.log(req.user);
  const { userId, verify_email_hash, verify_email_expiry_ms, email } = req.user;

  try {
    const updateUser = await User.update(
      {
        verify_email_hash: verify_email_hash,
        verify_email_expiry_ms: verify_email_expiry_ms,
      },
      {
        where: {
          id: userId,
        },
        returning: true,
      }
    );
    console.log(updateUser);
    if (!updateUser) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Please try after sometime", { email }).toJSON()
        );
    }
    res.status(200).json(
      new ApiResponse(
        200,
        "Email with update link sent successfully",
        {
          email,
        },
        null
      ).toJSON()
    );
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiError(500, "Something went wrong", { error }));
  }
};

export const reset_password_controller = async (req, res) => {
  const { id, reset_password_hash, reset_password_expiry_ms } = req.user;
  const { password, email } = req.body;
  try {
    const saltOrRounds = 10;
    const newHashedPassword = await bcrypt.hash(password, saltOrRounds);
    const updateUser = await User.update(
      {
        password: newHashedPassword,
        reset_password_hash: null,
        reset_password_expiry_ms: null,
      },
      {
        where: {
          id,
        },
        returning: true,
      }
    );
    if (!updateUser) {
      return res
        .status(400)
        .json(
          new ApiError(400, "Please try after sometime", { email }).toJSON()
        );
    }

    res.status(200).json(
      new ApiResponse(
        200,
        "Password is successfully updated",
        {
          email,
        },
        null
      ).toJSON()
    );
  } catch (error) {
    res.status(500).json(new ApiError(500, "Something went wrong", { error }));
  }
};
export const verify_email_finalize_controller = async (req, res) => {
  const { id } = req.user;
  try {
    const updateUser = await User.update(
      {
        isVerified: true,
        verify_email_hash: null,
        verify_email_expiry_ms: null,
      },
      {
        where: {
          id,
        },
        returning: true,
      }
    );
    if (!updateUser) {
      return res
        .status(400)
        .json(new ApiError(400, "Please try after sometime").toJSON());
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Email is successfully verified",
          {},
          null
        ).toJSON()
      );
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiError(500, "Something went wrong", { error }));
  }
};
