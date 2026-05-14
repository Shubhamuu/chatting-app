import * as authService from '../services/auth.service.js';
import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
export const register = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }
    const { user, tokens } = await authService.registerUser(req.body);
    
    res.status(201).json({
      success: true,
      user,
      tokens,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { user, tokens } = await authService.loginUser(req.body);
       res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",             
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.json({
      success: true,
      user,
      tokens,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const result = await authService.logoutUser();
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const generateAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    } 
    const tokens = await authService.refreshTokens(refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
   
    res.json({
      success: true,
       accessToken: tokens.accessToken
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};  
export default {
  register,
  login,
  logout,
  generateAccessToken,
};