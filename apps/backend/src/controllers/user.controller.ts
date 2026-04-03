import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, isActive, page = '1', limit = '10', search } = req.query;
        const filter: Record<string, unknown> = {};
        if (role)
            filter.role = role;
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        if (search && typeof search === 'string') {
            filter.$or = [
                { fullName: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } },
            ];
        }
        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNum - 1) * limitNum;
        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            User.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid user ID format' });
            return;
        }
        const user = await User.findById(id).select('-password');
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid user ID format' });
            return;
        }
        if (id === req.user!.userId && req.body.role && req.body.role !== 'ADMIN') {
            res.status(400).json({ success: false, error: 'You cannot change your own role' });
            return;
        }
        const allowedFields = ['role', 'isActive', 'assignedProjects', 'supplierId', 'jobTitle'];
        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined)
                updates[field] = req.body[field];
        }
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ success: false, error: 'No updatable fields provided' });
            return;
        }
        const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, data: user });
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid user ID format' });
            return;
        }
        if (id === req.user!.userId) {
            res.status(400).json({ success: false, error: 'You cannot deactivate your own account' });
            return;
        }
        const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.status(200).json({ success: true, data: user, message: 'User deactivated successfully' });
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
