import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/token.js';

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
    const token = generateToken(user._id);

    // rollback if token generation fails
    if (!token) {
      await User.findByIdAndDelete(user._id);

      throw new Error('Token generation failed');
    }

    return { token };
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

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    console.log('Login successful for user:', user._id);

    // generate token
    const token = generateToken(user._id);

    if (!token) {
      throw new Error('Token generation failed');
    }

   const { password: _, ...userWithoutPassword } = user.toObject();

return {
  user: userWithoutPassword,
  token,
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