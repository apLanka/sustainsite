import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role,
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
      error:
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : undefined,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        token,
        expiresIn: process.env.JWT_EXPIRE || '24h',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error:
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : undefined,
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        assignedProjects: user.assignedProjects,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user data',
      error:
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : undefined,
    });
  }
};
