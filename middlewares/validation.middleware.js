import { expenseSchema, signupSchema } from "../utils/validationSchema.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {
  checkRefreshtoken,
  isTokenExpired,
  matchSavedAccessToken,
} from "../utils/helperFunctions.js";
import User from "../models/user.model.js";

export const validateSignup = async (req, res, next) => {
  try {
    await signupSchema.validate(req.body, { abortEarly: false });
    //If validation passes, proceed with signup logic
    next();
  } catch (error) {
    const errors = error.inner.map((err) => ({
      field: err.path,
      message: err.message,
    }));
    res
      .status(400)
      .json(new ApiError(400, "One or more validation error", errors).toJSON());
  }
};

export const verifyAccessToken = async (req, res, next) => {
  const tokenHeader = req.headers["authorization"];
  const access_token = tokenHeader && tokenHeader.split(" ")[1];
  if (!access_token) {
    return res.status(401).json(
      new ApiError(401, "Authorization token Missing", {
        access_token,
      }).toJSON()
    );
  }
  try {
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET_KEY;
    const decodedToken = jwt.verify(access_token, access_token_secret);
    const checkTokenExpiry = isTokenExpired(decodedToken.exp);
    if (checkTokenExpiry) {
      return res.status(403).json(
        new ApiError(403, "Unauthorized Access - Token Expired", {
          access_token,
        }).toJSON()
      );
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json(
        new ApiError(401, "Unauthorized Access - Token Expired", {
          access_token,
        }).toJSON()
      );
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json(
        new ApiError(403, "Forbidden Access - Invalid Token", {
          access_token,
        }).toJSON()
      );
    } else {
      res
        .status(500)
        .json(new ApiError(500, "Internal Server Error 1").toJSON());
    }
  }
};

export const validateExpense = async (req, res, next) => {
  try {
    await expenseSchema.validate(req.body, { abortEarly: false });
    //If validation passes, proceed with expense-controller logic
    next();
  } catch (error) {
    const errors = error.inner.map((err) => ({
      field: err.path,
      message: err.message,
    }));
    res
      .status(400)
      .json(new ApiError(400, "One or more validation error", errors).toJSON());
  }
};

export const verifyRefreshToken = async (req, res, next) => {
  const tokenHeader = req.headers["authorization"];
  const { refreshToken } = req.body;
  //Check if access_token is present
  const access_token = tokenHeader && tokenHeader.split(" ")[1];

  if (!access_token || !refreshToken) {
    return res.status(401).json(
      new ApiError(401, "Authorization token or refresh token is Missing", {
        access_token,
      }).toJSON()
    );
  }
  try {
    // Check if access_token is present, and it is generated with same backend
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET_KEY;
    const decodedToken = jwt.decode(access_token, access_token_secret);

    if (!decodedToken) {
      return res.status(401).json(
        new ApiError(401, "Unauthorized Access Token", {
          access_token,
        }).toJSON()
      );
    }

    // If the access_token is valid, then get the userData from the database.
    const userResponse = await User.findByPk(decodedToken.userId);
    const userJson = userResponse?.dataValues;
    // Match the accesstoken received from the bearer token and which is received from the database if they match then proceed. There is no need to check for the expiry of the Access token.

    const isSavedAccessToken = matchSavedAccessToken(
      access_token,
      userJson.access_token
    );
    if (!isSavedAccessToken) {
      return res.status(403).json(
        new ApiError(403, "Unauthorized Access Token : - Tempered", {
          access_token,
        }).toJSON()
      );
    }
    // No lets verify the refresh token
    const verifyRefreshToken = await checkRefreshtoken({
      hashedRefreshToken: refreshToken,
      refreshToken: userJson.refresh_token,
    });
    if (!verifyRefreshToken) {
      return res.status(401).json(
        new ApiError(401, "Invalid Refresh Token : - Tempered", {
          refreshToken,
        }).toJSON()
      );
    }
    req.userData = userJson;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiError(500, "Internal Server Error").toJSON());
  }
};

export const verifyAccessTokenForLogout = async (req, res, next) => {
  const tokenHeader = req.headers["authorization"];
  const access_token = tokenHeader && tokenHeader.split(" ")[1];
  if (!access_token) {
    return res.status(401).json(
      new ApiError(401, "Authorization token Missing", {
        access_token,
      }).toJSON()
    );
  }
  try {
    const access_token_secret = process.env.ACCESS_TOKEN_SECRET_KEY;
    const decodedToken = jwt.decode(access_token, access_token_secret);

    req.user = decodedToken;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json(
        new ApiError(403, "Forbidden Access - Invalid Token", {
          access_token,
        }).toJSON()
      );
    } else {
      console.log(error);
      res.status(500).json(new ApiError(500, "Internal Server Error").toJSON());
    }
  }
};
