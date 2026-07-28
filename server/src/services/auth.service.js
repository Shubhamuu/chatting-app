import bcrypt from 'bcryptjs';
import { generateTokens,SendTokenRefreshToken } from '../utils/token.js';

import User from '../models/user.js';



export const registerUser = async ({ name, email, password }) => {
  try {
    // validation
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // rollback safety check
    if (!user) {
      throw new Error('User registration failed');
    }

    // generate token
    const { accessToken, refreshToken } = await generateTokens( { _id: user._id, name: user.name, email: user.email } );

    // rollback if token generation fails
    if (!accessToken || !refreshToken) {
  

      throw new Error('Token generation failed');
    }

    return { tokens: { accessToken, refreshToken }, user: { id: user._id, name: user.name, email: user.email } };
  } catch (error) {
    throw new Error(error.message || 'Registration failed');
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    // validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    console.log('Attempting login for:', email);

    // find user
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user );
    if (!user) {
      console.log('No user found with email:', email);
      throw new Error('Invalid credentials');
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
     
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    // generate token
    const { accessToken, refreshToken } = await generateTokens( { _id: user._id, name: user.name, email: user.email } );

    if (!accessToken || !refreshToken) {
      throw new Error('Token generation failed');
    }
 

   const { password: _, ...userWithoutPassword } = user.toObject();
 console.log('Login successful for user:', user._id);
return {
  user: userWithoutPassword,
  tokens: { accessToken, refreshToken }
};
  } catch (error) {
    console.error('Login error:', error.message);

    // preserve original error
    throw error;
  }
};

export const logoutUser = async () => {
  // JWT is stateless → logout handled on client
  return { message: 'Logged out successfully' };
};
export const refreshToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }
    //console.log('Received refresh token:', refreshToken);
    const Token = await SendTokenRefreshToken(refreshToken);
    console.log('Token refresh result auth service:', Token);
    if (!Token) {
      throw new Error('Invalid refresh token');
    }
      if (!Token.accessToken && !Token.refreshToken) {
      throw new Error('Failed to generate access token and refresh token');
    }
    return  Token ;
  } catch (error) {
    throw new Error(error.message || 'Token refresh failed');
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken
};