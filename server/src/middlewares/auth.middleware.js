import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { ACCESS_SECRET } from '../constants/getenv.js';


//const REFRESH_SECRET = require('../constants/getenv').REFRESH_SECRET;

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Unauthorized: No token' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    //console.log('Decoded user:', decoded);
    if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });

    req.user = user;

    next();
  } catch (err) {
    console.log('Error in protect middleware:', err);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};