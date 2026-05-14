import jwt from "jsonwebtoken";
import{ ACCESS_SECRET, REFRESH_SECRET } from '../constants/getenv.js';
// Generate access + refresh token
const generateTokens = async ({ _id, name, email }) => {
  const payload = { id: _id, name, email };
  
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });


  return { accessToken, refreshToken };
};
const generateaccessToken = (userData) => {
  const payload = { id: userData._id, email: userData.email, name: userData.name };
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
  return { accessToken };
};
// Verify refresh token
const SendTokenRefreshToken = async (refreshToken) => {
  try {
    if (!refreshToken) return null;

    // 1. Verify JWT signature & expiry
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
console.log("Decoded refresh token:", decoded);
    // 2. Check DB for existence AND ownership
 /*    const storedToken = await Token.findOne({
      token: refreshToken,
      userId: decoded.id, // MUST match
    });

    if (!storedToken) {
      console.log("Refresh token not found in DB");
      return null; // revoked or reused token
    } */
    const token = generateTokens({ _id: decoded.id, name: decoded.name, email: decoded.email });
    return token;
  } catch (error) {
    return null;
  }
};
// Remove refresh token on logout
const removeRefreshToken = async (token) => {
  await Token.findOneAndDelete({ token });
};
const verifyToken = (token) => {
  if (!token) {
    console.log("No token provided for verification");
    return null;
  }
  try {
    const userData = jwt.verify(token, ACCESS_SECRET);
    if (!userData) {
      console.log("Token verification failed");
      return null;
    }
    console.log("Access token verified successfully.");
    return userData;
  } catch (err) {
    console.log("Error verifying token:", err);
    return null;
  }
}
export { generateTokens, SendTokenRefreshToken, removeRefreshToken, verifyToken, generateaccessToken };
export default{ generateTokens, SendTokenRefreshToken, removeRefreshToken, verifyToken, generateaccessToken };