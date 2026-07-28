import {verifyToken} from "../utils/token.js";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
    // console.log(req.headers.authorization);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized: No token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      //console.log("Token verification failed in middleware", decoded);
   return res.status(401).json({ message: 'Unauthorized: Invalid token or expired token' });
    }
    const user = await User.findById(decoded.id)
      .select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized: User not found or token expired",
      });
    }

    req.user = user;

    next();

  } catch (err) {
    console.log("Error in auth middleware:", err);
    return res.status(401).json({
      message: "Unauthorized: Invalid token, middleware error",
    });
  }
};
export default authMiddleware;