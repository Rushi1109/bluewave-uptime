const jwt = require("jsonwebtoken");
const SERVICE_NAME = "verifyJWT";
const TOKEN_PREFIX = "Bearer ";
const { errorMessages } = require("../utils/messages");
/**
 * Verifies the JWT token
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {express.Response}
 */
const verifyJWT = (req, res, next) => {
  const token = req.headers["authorization"];
  // Make sure a token is provided
  if (!token) {
    const error = new Error(errorMessages.NO_AUTH_TOKEN);
    error.status = 401;
    error.service = SERVICE_NAME;
    next(error);
    return;
  }
  // Make sure it is properly formatted
  if (!token.startsWith(TOKEN_PREFIX)) {
    const error = new Error(errorMessages.INVALID_AUTH_TOKEN); // Instantiate a new Error object for improperly formatted token
    error.status = 400;
    error.service = SERVICE_NAME;
    error.method = "verifyJWT";
    next(error);
    return;
  }

  const parsedToken = token.slice(TOKEN_PREFIX.length, token.length);
  // Verify the token's authenticity
  const { jwtSecret } = req.settingsService.getSettings();
  jwt.verify(parsedToken, jwtSecret, (err, decoded) => {
    if (err) {
      const errorMessage =
        err.name === "TokenExpiredError"
          ? errorMessages.EXPIRED_AUTH_TOKEN
          : errorMessages.INVALID_AUTH_TOKEN;
      return res.status(401).json({ success: false, msg: errorMessage });
    }

    // Add the user to the request object for use in the route
    req.user = decoded;
    next();
  });
};

/**
 * Verifies the Refresh token
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @property {Object} req.body - The Refresh Token will be passed in body of the request.
 * @returns {express.Response}
 */
const verifyRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  // Make sure a token is provided
  if (!refreshToken) {
    const error = new Error(errorMessages.NO_REFRESH_TOKEN);
    error.status = 401;
    error.service = SERVICE_NAME;
    error.method = "verifyRefreshToken";
    next(error);
    return;
  }

  // Verify the token's authenticity
  const { refreshTokenSecret } = req.settingsService.getSettings();
  jwt.verify(refreshToken, refreshTokenSecret, (err, decoded) => {
    if (err) {
      const errorMessage =
        err.name === "TokenExpiredError"
          ? errorMessages.EXPIRED_REFRESH_TOKEN
          : errorMessages.INVALID_REFRESH_TOKEN;
      return res.status(401).json({ success: false, msg: errorMessage });
    }

    // Add the user to the request object for use in the route
    req.user = decoded;
    next();
  });
};

module.exports = { verifyJWT, verifyRefreshToken };
