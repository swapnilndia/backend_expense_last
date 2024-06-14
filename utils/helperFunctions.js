import jwt from "jsonwebtoken";
import brcypt from "bcrypt";
export const isTokenExpired = (expiryTime) => {
  const currentTime = Math.ceil(new Date().getTime() / 1000);
  if (currentTime > expiryTime) {
    return true;
  } else {
    return false;
  }
};

export const generateAccessToken = (email, id, isPrimary, isVerified) => {
  const acces_token_secret = process.env.ACCESS_TOKEN_SECRET_KEY;
  const access_Token = jwt.sign(
    {
      email,
      userId: id,
      isPrimary,
      isVerified,
    },
    acces_token_secret,
    {
      expiresIn: 60 * 60,
    }
  );
  return access_Token;
};

export const generateRefreshToken = (email, id) => {
  const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET_KEY;
  const refresh_token = jwt.sign(
    {
      email,
      userId: id,
    },
    refresh_token_secret,
    {
      expiresIn: 60 * 60 * 24,
    }
  );
  return refresh_token;
};

export const matchSavedAccessToken = (access_token, accessTokenDB) => {
  if (access_token === accessTokenDB) {
    return true;
  } else {
    return false;
  }
};

export const checkRefreshtoken = async ({
  hashedRefreshToken,
  refreshToken,
}) => {
  // compare the hashed token send from the frontend, with the saved token from the database.  if they both match then proceed.
  const verifyRefresh = await brcypt.compare(refreshToken, hashedRefreshToken);
  // lets decode the refreshtoken to get the expiry and check if the refresh token is expired or not..

  const decodedRefreshToken = jwt.decode(refreshToken);

  const checkTokenExpiry = isTokenExpired(decodedRefreshToken.exp);

  // if any of the logic condition fails then refresh token is invalid and we can send invalid refresh token response and logout the user.
  if (verifyRefresh === true && checkTokenExpiry === false) {
    return true;
  } else {
    return false;
  }
};
