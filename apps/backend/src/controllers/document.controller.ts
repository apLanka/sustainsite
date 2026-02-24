import { Request, Response } from 'express';
import fs from 'fs';
import mongoose from 'mongoose';
import DocumentModel, { DocumentStatus } from '../models/Document';
import { uploadToCloudinary } from '../config/cloudinary';

/**
 * Document Controller
 * Handles all document management operations
 */

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const { projectId, documentType, title, description, version, tags } = req.body;

    if (!projectId || !documentType || !title) {
      fs.unlink(req.file.path, () => {});
      res.status(400).json({ success: false, error: 'projectId, documentType, and title are required' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      fs.unlink(req.file.path, () => {});
      res.status(400).json({ success: false, error: 'Invalid projectId format' });
      return;
    }

    const { url, cloudinaryId, format, size } = await uploadToCloudinary(req.file.path, 'construction-docs');

    fs.unlink(req.file.path, () => {});

    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch {
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
      status: DocumentStatus.DRAFT,
      uploadedBy: req.user!.userId,
    });

    res.status(201).json({ success: true, data: document });
  } catch (error: unknown) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      documentType,
      status,
      uploadedBy,
      tag,
      page = '1',
      limit = '10',
    } = req.query;

    const filter: Record<string, unknown> = {};

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId as string)) {
        res.status(400).json({ success: false, error: 'Invalid projectId format' });
        return;
      }
      filter.projectId = projectId;
    }

    if (documentType) filter.documentType = documentType;
    if (status) filter.status = status;
    if (uploadedBy) {
      if (!mongoose.Types.ObjectId.isValid(uploadedBy as string)) {
        res.status(400).json({ success: false, error: 'Invalid uploadedBy format' });
        return;
      }
      filter.uploadedBy = uploadedBy;
    }
    if (tag) filter.tags = tag;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [documents, total] = await Promise.all([
      DocumentModel.find(filter)
        .select('-accessLog -previousVersions')
        .populate('uploadedBy', 'name email')
        .populate('approvedBy', 'name email')
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
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error',
    });
  }
};

export const getDocumentById = async (_req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement get document by ID
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

export const updateDocument = async (_req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement update document metadata
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

export const deleteDocument = async (_req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement delete document (also delete from Cloudinary)
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

export const approveDocument = async (_req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement approve document logic
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

export const rejectDocument = async (_req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement reject document logic
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

export const createNewVersion = async (_req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement create new version logic
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

export const downloadDocument = async (_req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implement download document logic
    res.status(501).json({
      success: false,
      error: 'Not implemented yet',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};
