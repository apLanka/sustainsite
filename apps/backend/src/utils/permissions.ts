import { UserRole } from '../types';
import { IProject } from '../models/Project';
import { IMaterial } from '../models/Material';
import { IDocument } from '../models/Document';
export const canViewProject = (user: {
    userId: string;
    role: UserRole;
}, _project?: IProject): boolean => {
    const allowedRoles = [
        UserRole.ADMIN,
        UserRole.PROJECT_MANAGER,
        UserRole.INSPECTOR,
        UserRole.VIEWER,
    ];
    return allowedRoles.includes(user.role);
};
export const canEditProject = (user: {
    userId: string;
    role: UserRole;
}, project: IProject): boolean => {
    if (user.role === UserRole.ADMIN) {
        return true;
    }
    if (user.role === UserRole.PROJECT_MANAGER) {
        const isManager = project.projectManager.toString() === user.userId;
        const isTeamMember = project.teamMembers.map((id) => id.toString()).includes(user.userId);
        return isManager || isTeamMember;
    }
    return false;
};
export const canDeleteProject = (user: {
    userId: string;
    role: UserRole;
}, _project?: IProject): boolean => {
    return user.role === UserRole.ADMIN;
};
export const canManageResources = (user: {
    userId: string;
    role: UserRole;
}, project?: IProject): boolean => {
    if (user.role === UserRole.ADMIN) {
        return true;
    }
    if (user.role === UserRole.PROJECT_MANAGER && project) {
        const isManager = project.projectManager.toString() === user.userId;
        const isTeamMember = project.teamMembers.map((id) => id.toString()).includes(user.userId);
        return isManager || isTeamMember;
    }
    return false;
};
export const canApproveDocuments = (user: {
    userId: string;
    role: UserRole;
}): boolean => {
    return user.role === UserRole.ADMIN || user.role === UserRole.INSPECTOR;
};
export const canConductInspections = (user: {
    userId: string;
    role: UserRole;
}): boolean => {
    return user.role === UserRole.ADMIN || user.role === UserRole.INSPECTOR;
};
export const canUpdateMaterialStatus = (user: {
    userId: string;
    role: UserRole;
}, material: IMaterial): boolean => {
    if (user.role === UserRole.ADMIN) {
        return true;
    }
    if (user.role === UserRole.PROJECT_MANAGER) {
        return true;
    }
    if (user.role === UserRole.SUPPLIER) {
        return material.supplier.toString() === user.userId;
    }
    return false;
};
export const canCreateMetrics = (user: {
    userId: string;
    role: UserRole;
}): boolean => {
    return (user.role === UserRole.ADMIN ||
        user.role === UserRole.PROJECT_MANAGER ||
        user.role === UserRole.INSPECTOR);
};
export const canUpdateMetrics = (user: {
    userId: string;
    role: UserRole;
}): boolean => {
    return (user.role === UserRole.ADMIN ||
        user.role === UserRole.PROJECT_MANAGER ||
        user.role === UserRole.INSPECTOR);
};
export const canDeleteDocument = (user: {
    userId: string;
    role: UserRole;
}, document: IDocument): boolean => {
    if (user.role === UserRole.ADMIN) {
        return true;
    }
    return document.uploadedBy.toString() === user.userId;
};
export const canManageTeamMembers = (user: {
    userId: string;
    role: UserRole;
}, project?: IProject): boolean => {
    if (user.role === UserRole.ADMIN) {
        return true;
    }
    if (user.role === UserRole.PROJECT_MANAGER && project) {
        return project.projectManager.toString() === user.userId;
    }
    return false;
};
export const canViewReports = (_user: {
    userId: string;
    role: UserRole;
}): boolean => {
    return true;
};
export const canGenerateReports = (user: {
    userId: string;
    role: UserRole;
}): boolean => {
    return (user.role === UserRole.ADMIN ||
        user.role === UserRole.PROJECT_MANAGER ||
        user.role === UserRole.INSPECTOR ||
        user.role === UserRole.VIEWER);
};
