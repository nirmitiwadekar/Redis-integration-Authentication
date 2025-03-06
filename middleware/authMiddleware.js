const { verifyToken } = require("../utils/jwt");
const { redisClient } = require("../config/redis");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const decoded = verifyToken(token.replace("Bearer ", ""));
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  const storedToken = await redisClient.get(`accessToken:${decoded.phone}`);
  if (!storedToken || storedToken !== token.replace("Bearer ", "")) {
    return res.status(401).json({ message: "Unauthorized: Token expired or invalid" });
  }

  req.user = decoded;
  next();
};

module.exports = authMiddleware;
