import { Request, Response } from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import DocumentModel, { DocumentStatus, AccessAction } from '../models/Document';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import logger from '../utils/logger';
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, error: 'No file uploaded' });
            return;
        }
        const { projectId, documentType, title, description, version, tags } = req.body;
        if (!projectId || !documentType || !title) {
            fs.unlink(req.file.path, () => { });
            res.status(400).json({ success: false, error: 'projectId, documentType, and title are required' });
            return;
        }
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            fs.unlink(req.file.path, () => { });
            res.status(400).json({ success: false, error: 'Invalid projectId format' });
            return;
        }
        const { url, cloudinaryId, format, size } = await uploadToCloudinary(req.file.path, 'construction-docs');
        fs.unlink(req.file.path, () => { });
        let parsedTags: string[] = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            }
            catch {
                parsedTags = [];
            }
        }
        const document = await DocumentModel.create({
            projectId,
            documentType,
            title,
            description,
            version: version || '1.0',
            tags: parsedTags,
            fileUrl: url,
            cloudinaryId,
            fileName: req.file.originalname,
            fileSize: size,
            fileFormat: format,
            status: DocumentStatus.UNDER_REVIEW,
            uploadedBy: req.user!.userId,
        });
        res.status(201).json({ success: true, data: document });
    }
    catch (error: unknown) {
        if (req.file)
            fs.unlink(req.file.path, () => { });
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const getDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectId, documentType, status, uploadedBy, tag, page = '1', limit = '10', } = req.query;
        const filter: Record<string, unknown> = {};
        if (projectId) {
            if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
                res.status(400).json({ success: false, error: 'Invalid projectId format' });
                return;
            }
            filter.projectId = projectId;
        }
        if (documentType)
            filter.documentType = documentType;
        if (status)
            filter.status = status;
        if (uploadedBy) {
            if (!mongoose.Types.ObjectId.isValid(uploadedBy as string)) {
                res.status(400).json({ success: false, error: 'Invalid uploadedBy format' });
                return;
            }
            filter.uploadedBy = uploadedBy;
        }
        if (tag)
            filter.tags = tag;
        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNum - 1) * limitNum;
        const [documents, total] = await Promise.all([
            DocumentModel.find(filter)
                .select('-accessLog -previousVersions')
                .populate('uploadedBy', 'fullName email')
                .populate('approvedBy', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            DocumentModel.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            data: documents,
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
export const getDocumentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid document ID format' });
            return;
        }
        const document = await DocumentModel.findById(id)
            .populate('uploadedBy', 'fullName email')
            .populate('approvedBy', 'fullName email')
            .populate('accessLog.userId', 'fullName email');
        if (!document) {
            res.status(404).json({ success: false, error: 'Document not found' });
            return;
        }
        res.status(200).json({ success: true, data: document });
        document.addAccessLog(new mongoose.Types.ObjectId(req.user!.userId), AccessAction.VIEW);
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const updateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid document ID format' });
            return;
        }
        const { title, description, documentType, tags } = req.body;
        const updates: Record<string, unknown> = {};
        if (title !== undefined)
            updates.title = title;
        if (description !== undefined)
            updates.description = description;
        if (documentType !== undefined)
            updates.documentType = documentType;
        if (tags !== undefined) {
            try {
                updates.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            }
            catch {
                updates.tags = [];
            }
        }
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ success: false, error: 'No updatable fields provided' });
            return;
        }
        const document = await DocumentModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
            .populate('uploadedBy', 'fullName email')
            .populate('approvedBy', 'fullName email');
        if (!document) {
            res.status(404).json({ success: false, error: 'Document not found' });
            return;
        }
        res.status(200).json({ success: true, data: document });
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid document ID format' });
            return;
        }
        const document = await DocumentModel.findById(id);
        if (!document) {
            res.status(404).json({ success: false, error: 'Document not found' });
            return;
        }
        if (document.cloudinaryId) {
            await deleteFromCloudinary(document.cloudinaryId);
        }
        await DocumentModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Document deleted successfully' });
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const approveDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid document ID format' });
            return;
        }
        const document = await DocumentModel.findById(id);
        if (!document) {
            res.status(404).json({ success: false, error: 'Document not found' });
            return;
        }
        if (document.status === DocumentStatus.APPROVED) {
            res.status(400).json({ success: false, error: 'Document is already approved' });
            return;
        }
        document.status = DocumentStatus.APPROVED;
        document.approvedBy = new mongoose.Types.ObjectId(req.user!.userId);
        document.rejectionReason = undefined;
        await document.save();
        await document.populate('uploadedBy', 'fullName email');
        await document.populate('approvedBy', 'fullName email');
        res.status(200).json({ success: true, data: document });
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const rejectDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid document ID format' });
            return;
        }
        if (!rejectionReason || typeof rejectionReason !== 'string' || rejectionReason.trim().length === 0) {
            res.status(400).json({ success: false, error: 'A rejection reason is required' });
            return;
        }
        const document = await DocumentModel.findById(id);
        if (!document) {
            res.status(404).json({ success: false, error: 'Document not found' });
            return;
        }
        if (document.status === DocumentStatus.REJECTED) {
            res.status(400).json({ success: false, error: 'Document is already rejected' });
            return;
        }
        document.status = DocumentStatus.REJECTED;
        document.rejectionReason = rejectionReason.trim();
        document.approvedBy = undefined;
        document.approvalDate = undefined;
        await document.save();
        await document.populate('uploadedBy', 'fullName email');
        res.status(200).json({ success: true, data: document });
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const createNewVersion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid document ID format' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ success: false, error: 'No file uploaded' });
            return;
        }
        const document = await DocumentModel.findById(id);
        if (!document) {
            fs.unlink(req.file.path, () => { });
            res.status(404).json({ success: false, error: 'Document not found' });
            return;
        }
        const { url, cloudinaryId } = await uploadToCloudinary(req.file.path, 'construction-docs');
        fs.unlink(req.file.path, () => { });
        await document.createNewVersion(url, new mongoose.Types.ObjectId(req.user!.userId));
        document.cloudinaryId = cloudinaryId;
        document.fileName = req.file.originalname;
        await document.save();
        await document.populate('uploadedBy', 'fullName email');
        res.status(200).json({ success: true, data: document });
    }
    catch (error: unknown) {
        if (req.file)
            fs.unlink(req.file.path, () => { });
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const downloadDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid document ID format' });
            return;
        }
        const document = await DocumentModel.findById(id).select('fileUrl fileName cloudinaryId');
        logger.info(`Download request for document ID: ${id} by user ID: ${req.user!.userId}`);
        if (!document) {
            res.status(404).json({ success: false, error: 'Document not found' });
            return;
        }
        res.redirect(document.fileUrl);
        DocumentModel.updateOne({ _id: id }, { $push: { accessLog: { userId: req.user!.userId, action: AccessAction.DOWNLOAD, timestamp: new Date() } } }).catch((err: unknown) => logger.error('Failed to log download access', { err }));
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
export const searchDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, projectId, documentType, status, page = '1', limit = '10', } = req.query;
        const filter: Record<string, unknown> = {};
        if (q && typeof q === 'string' && q.trim()) {
            filter.$or = [
                { title: { $regex: q.trim(), $options: 'i' } },
                { description: { $regex: q.trim(), $options: 'i' } },
                { tags: { $regex: q.trim(), $options: 'i' } },
            ];
        }
        if (projectId) {
            if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
                res.status(400).json({ success: false, error: 'Invalid projectId format' });
                return;
            }
            filter.projectId = projectId;
        }
        if (documentType)
            filter.documentType = documentType;
        if (status)
            filter.status = status;
        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const skip = (pageNum - 1) * limitNum;
        const [documents, total] = await Promise.all([
            DocumentModel.find(filter)
                .select('-accessLog -previousVersions')
                .populate('uploadedBy', 'fullName email')
                .populate('approvedBy', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            DocumentModel.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            data: documents,
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
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    [DocumentStatus.DRAFT]: [DocumentStatus.UNDER_REVIEW],
    [DocumentStatus.UNDER_REVIEW]: [DocumentStatus.APPROVED, DocumentStatus.REJECTED],
    [DocumentStatus.REJECTED]: [DocumentStatus.UNDER_REVIEW],
};
export const updateDocumentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ success: false, error: 'Invalid document ID format' });
            return;
        }
        if (!status) {
            res.status(400).json({ success: false, error: 'status is required' });
            return;
        }
        const document = await DocumentModel.findById(id);
        if (!document) {
            res.status(404).json({ success: false, error: 'Document not found' });
            return;
        }
        const allowed = ALLOWED_TRANSITIONS[document.status] ?? [];
        if (!allowed.includes(status)) {
            res.status(400).json({
                success: false,
                error: `Cannot transition from '${document.status}' to '${status}'. Allowed: ${allowed.join(', ') || 'none'}`,
            });
            return;
        }
        const userRole = req.user!.role;
        if ((status === DocumentStatus.APPROVED || status === DocumentStatus.REJECTED) &&
            userRole !== 'ADMIN' &&
            userRole !== 'INSPECTOR') {
            res.status(403).json({ success: false, error: 'Only ADMIN or INSPECTOR can approve or reject documents' });
            return;
        }
        document.status = status as DocumentStatus;
        if (status === DocumentStatus.APPROVED) {
            document.approvedBy = new mongoose.Types.ObjectId(req.user!.userId);
            document.approvalDate = new Date();
            document.rejectionReason = undefined;
        }
        else if (status === DocumentStatus.REJECTED) {
            if (!rejectionReason) {
                res.status(400).json({ success: false, error: 'rejectionReason is required when rejecting' });
                return;
            }
            document.rejectionReason = rejectionReason;
            document.approvedBy = undefined;
            document.approvalDate = undefined;
        }
        await document.save();
        await document.populate('uploadedBy', 'fullName email');
        await document.populate('approvedBy', 'fullName email');
        res.status(200).json({ success: true, data: document });
    }
    catch (error: unknown) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Server error',
        });
    }
};
