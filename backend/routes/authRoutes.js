import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_local_development_only';

// Mock OTP storage in memory for local testing
const activeOtps = new Map();

// Send OTP
router.post('/otp-send', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length < 10) {
    return res.status(400).json({ message: 'Valid 10-digit mobile number is required' });
  }

  // Generate a 6-digit OTP (for dev, we can use 123456 as default or a random number)
  const otp = '123456'; 
  activeOtps.set(mobile, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  res.json({
    message: 'OTP sent successfully (Simulated)',
    mobile,
    otp // Send back in response for easy testing
  });
});

// Verify OTP & Login/Register
router.post('/otp-verify', async (req, res) => {
  const { mobile, otp, name, businessCategory, address, preferredLanguage, upiId } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: 'Mobile number and OTP are required' });
  }

  const record = activeOtps.get(mobile);
  if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Clear OTP once verified
  activeOtps.delete(mobile);

  // Check if user already exists
  let user = await User.findOne({ mobile });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    // Create new user using mobile
    user = await User.create({
      name: name || `Gupta Ji`,
      email: `${mobile}@voicebill.com`,
      mobile,
      role: 'Owner',
      password: 'mobile_authenticated'
    });
  }

  // Generate JWT Token
  const token = jwt.sign(
    { id: user._id, email: user.email, mobile: user.mobile, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role
    },
    isNewUser
  });
});

// Register User (Legacy email-password support)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, mobile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const userRole = role === 'SuperAdmin' ? 'Customer' : (role || 'Owner');

    const newUser = await User.create({
      name,
      email,
      mobile: mobile || '',
      password,
      role: userRole
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// Login User (Legacy email-password support)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Handle mock check for mobile users without passwords
    const isMatch = user.password === 'mobile_authenticated' || (password === user.password); // simple check for dev
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Get Current User Profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Internal server error fetching profile' });
  }
});

export default router;
