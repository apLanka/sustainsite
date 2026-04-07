export const DocumentType = {
    BLUEPRINT: 'Blueprint',
    PERMIT: 'Permit',
    CERTIFICATE: 'Certificate',
    SAFETY_REPORT: 'Safety Report',
    CONTRACT: 'Contract',
    OTHER: 'Other',
} as const;
export type DocumentType = typeof DocumentType[keyof typeof DocumentType];
export const DocumentStatus = {
    DRAFT: 'Draft',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
} as const;
export type DocumentStatus = typeof DocumentStatus[keyof typeof DocumentStatus];
export interface PopulatedUser {
    _id: string;
    name: string;
    email: string;
}
export interface PreviousVersion {
    version: string;
    fileUrl: string;
    uploadedAt: string;
    uploadedBy: string | PopulatedUser;
}
export interface AccessLogEntry {
    userId: string | PopulatedUser;
    action: 'view' | 'download' | 'edit';
    timestamp: string;
}
export interface ProjectDocument {
    _id: string;
    projectId: string;
    documentType: DocumentType;
    title: string;
    description?: string;
    fileUrl: string;
    cloudinaryId?: string;
    fileName?: string;
    fileSize?: number;
    fileFormat?: string;
    version: string;
    previousVersions: PreviousVersion[];
    status: DocumentStatus;
    approvedBy?: PopulatedUser | null;
    approvalDate?: string;
    rejectionReason?: string;
    uploadedBy: PopulatedUser;
    tags: string[];
    accessLog?: AccessLogEntry[];
    createdAt: string;
    updatedAt: string;
}
export interface DocumentPagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}
export interface DocumentFilters {
    projectId?: string;
    search?: string;
    documentType?: DocumentType | '';
    status?: DocumentStatus | '';
    tag?: string;
    page: number;
    limit: number;
}
export interface UploadDocumentPayload {
    file: File;
    projectId: string;
    documentType: DocumentType;
    title: string;
    description?: string;
    version?: string;
    tags?: string[];
}
export interface UpdateDocumentPayload {
    title?: string;
    description?: string;
    documentType?: DocumentType;
    tags?: string[];
}
