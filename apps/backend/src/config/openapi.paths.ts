type HttpOp = Record<string, unknown>;
const bearer: HttpOp[] = [{ bearerAuth: [] }];
const json200: HttpOp = {
    '200': {
        description: 'Success',
        content: {
            'application/json': {
                schema: { type: 'object', additionalProperties: true },
            },
        },
    },
};
const json201: HttpOp = {
    '201': {
        description: 'Created',
        content: {
            'application/json': {
                schema: { type: 'object', additionalProperties: true },
            },
        },
    },
};
const empty204: HttpOp = {
    '204': { description: 'No content' },
};
const err4xx: HttpOp = {
    '400': { description: 'Bad request / validation error' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden' },
    '404': { description: 'Not found' },
};
const stdResponses: HttpOp = { ...json200, ...err4xx };
const writeResponses: HttpOp = { ...json201, ...err4xx };
const mutateResponses: HttpOp = { ...json200, ...empty204, ...err4xx };
function materialsPaths(base: string): Record<string, Record<string, HttpOp>> {
    const tag = 'Materials';
    return {
        [base]: {
            get: {
                tags: [tag],
                summary: 'List materials',
                security: bearer,
                responses: stdResponses,
            },
            post: {
                tags: [tag],
                summary: 'Create material',
                security: bearer,
                responses: writeResponses,
            },
        },
        [`${base}/list/low-stock`]: {
            get: {
                tags: [tag],
                summary: 'List low-stock materials',
                security: bearer,
                responses: stdResponses,
            },
        },
        [`${base}/{id}`]: {
            get: {
                tags: [tag],
                summary: 'Get material by ID',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
            put: {
                tags: [tag],
                summary: 'Update material',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
            delete: {
                tags: [tag],
                summary: 'Delete material (admin)',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: mutateResponses,
            },
        },
        [`${base}/{id}/status`]: {
            put: {
                tags: [tag],
                summary: 'Update material status',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
        },
        [`${base}/{id}/usage`]: {
            post: {
                tags: [tag],
                summary: 'Record material usage',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
        },
        [`${base}/{projectId}/cost-summary`]: {
            get: {
                tags: [tag],
                summary: 'Cost summary for a project',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/ProjectIdPath' }],
                responses: stdResponses,
            },
        },
    };
}
function equipmentPaths(base: string): Record<string, Record<string, HttpOp>> {
    const tag = 'Equipment';
    return {
        [base]: {
            get: {
                tags: [tag],
                summary: 'List equipment',
                security: bearer,
                responses: stdResponses,
            },
            post: {
                tags: [tag],
                summary: 'Create equipment',
                security: bearer,
                responses: writeResponses,
            },
        },
        [`${base}/list/available`]: {
            get: {
                tags: [tag],
                summary: 'List available equipment',
                security: bearer,
                responses: stdResponses,
            },
        },
        [`${base}/{id}`]: {
            get: {
                tags: [tag],
                summary: 'Get equipment by ID',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
            put: {
                tags: [tag],
                summary: 'Update equipment',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
            delete: {
                tags: [tag],
                summary: 'Delete equipment (admin)',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: mutateResponses,
            },
        },
        [`${base}/{id}/assign`]: {
            post: {
                tags: [tag],
                summary: 'Assign equipment',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
        },
        [`${base}/{id}/maintenance`]: {
            post: {
                tags: [tag],
                summary: 'Schedule maintenance',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
        },
        [`${base}/{id}/status`]: {
            put: {
                tags: [tag],
                summary: 'Update equipment status',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
        },
    };
}
function supplierPaths(base: string): Record<string, Record<string, HttpOp>> {
    const tag = 'Suppliers';
    return {
        [base]: {
            get: {
                tags: [tag],
                summary: 'List suppliers',
                security: bearer,
                responses: stdResponses,
            },
            post: {
                tags: [tag],
                summary: 'Create supplier',
                security: bearer,
                responses: writeResponses,
            },
        },
        [`${base}/{id}`]: {
            get: {
                tags: [tag],
                summary: 'Get supplier by ID',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
            put: {
                tags: [tag],
                summary: 'Update supplier',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
            delete: {
                tags: [tag],
                summary: 'Delete supplier (admin)',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: mutateResponses,
            },
        },
        [`${base}/{id}/rating`]: {
            post: {
                tags: [tag],
                summary: 'Rate supplier',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
        },
        [`${base}/{id}/performance`]: {
            get: {
                tags: [tag],
                summary: 'Supplier performance metrics',
                security: bearer,
                parameters: [{ $ref: '#/components/parameters/IdPath' }],
                responses: stdResponses,
            },
        },
    };
}
export const manualPaths: Record<string, Record<string, HttpOp>> = {
    '/api': {
        get: {
            tags: ['Health'],
            summary: 'API index (lists major route groups)',
            security: [],
            responses: stdResponses,
        },
    },
    '/health': {
        get: {
            tags: ['Health'],
            summary: 'Health check',
            security: [],
            responses: {
                '200': {
                    description: 'Service is running',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'ok' },
                                    timestamp: { type: 'string', format: 'date-time' },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    '/api/auth/register': {
        post: {
            tags: ['Auth'],
            summary: 'Register user',
            security: [],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RegisterRequest' },
                    },
                },
            },
            responses: writeResponses,
        },
    },
    '/api/auth/login': {
        post: {
            tags: ['Auth'],
            summary: 'Login',
            security: [],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/LoginRequest' },
                    },
                },
            },
            responses: stdResponses,
        },
    },
    '/api/auth/me': {
        get: {
            tags: ['Auth'],
            summary: 'Current user profile',
            security: bearer,
            responses: stdResponses,
        },
    },
    '/api/auth/profile': {
        patch: {
            tags: ['Auth'],
            summary: 'Update profile',
            security: bearer,
            requestBody: {
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
                    },
                },
            },
            responses: stdResponses,
        },
    },
    '/api/auth/change-password': {
        patch: {
            tags: ['Auth'],
            summary: 'Change password',
            security: bearer,
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ChangePasswordRequest' },
                    },
                },
            },
            responses: stdResponses,
        },
    },
    '/api/projects': {
        get: {
            tags: ['Projects'],
            summary: 'List projects',
            security: bearer,
            responses: stdResponses,
        },
        post: {
            tags: ['Projects'],
            summary: 'Create project',
            security: bearer,
            responses: writeResponses,
        },
    },
    '/api/projects/status/{status}': {
        get: {
            tags: ['Projects'],
            summary: 'List projects filtered by status',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/StatusPath' }],
            responses: stdResponses,
        },
    },
    '/api/projects/{id}': {
        get: {
            tags: ['Projects'],
            summary: 'Get project by ID',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        put: {
            tags: ['Projects'],
            summary: 'Update project',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        delete: {
            tags: ['Projects'],
            summary: 'Delete project (admin)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: mutateResponses,
        },
    },
    '/api/projects/{id}/milestones': {
        post: {
            tags: ['Milestones'],
            summary: 'Add milestone',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: writeResponses,
        },
    },
    '/api/projects/{id}/milestones/{milestoneId}': {
        put: {
            tags: ['Milestones'],
            summary: 'Update milestone',
            security: bearer,
            parameters: [
                { $ref: '#/components/parameters/IdPath' },
                { $ref: '#/components/parameters/MilestoneIdPath' },
            ],
            responses: stdResponses,
        },
    },
    '/api/projects/{id}/timeline': {
        get: {
            tags: ['Projects'],
            summary: 'Project timeline',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
    },
    '/api/projects/{id}/financial-summary': {
        get: {
            tags: ['Projects'],
            summary: 'Financial summary',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
    },
    '/api/users': {
        get: {
            tags: ['Users'],
            summary: 'List users (admin)',
            security: bearer,
            responses: stdResponses,
        },
    },
    '/api/users/{id}': {
        get: {
            tags: ['Users'],
            summary: 'Get user (admin)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        patch: {
            tags: ['Users'],
            summary: 'Update user (admin)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        delete: {
            tags: ['Users'],
            summary: 'Deactivate user (admin)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: mutateResponses,
        },
    },
    '/api/documents': {
        get: {
            tags: ['Documents'],
            summary: 'List documents',
            security: bearer,
            responses: stdResponses,
        },
        post: {
            tags: ['Documents'],
            summary: 'Upload document (multipart file field `file`)',
            security: bearer,
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            required: ['file'],
                            properties: {
                                file: { type: 'string', format: 'binary' },
                            },
                        },
                    },
                },
            },
            responses: writeResponses,
        },
    },
    '/api/documents/search': {
        get: {
            tags: ['Documents'],
            summary: 'Search documents',
            security: bearer,
            responses: stdResponses,
        },
    },
    '/api/documents/{id}': {
        get: {
            tags: ['Documents'],
            summary: 'Get document',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        put: {
            tags: ['Documents'],
            summary: 'Update document metadata',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        delete: {
            tags: ['Documents'],
            summary: 'Delete document',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: mutateResponses,
        },
    },
    '/api/documents/{id}/approve': {
        put: {
            tags: ['Documents'],
            summary: 'Approve document',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
    },
    '/api/documents/{id}/reject': {
        put: {
            tags: ['Documents'],
            summary: 'Reject document',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
    },
    '/api/documents/{id}/version': {
        post: {
            tags: ['Documents'],
            summary: 'Create new version (multipart `file`)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            requestBody: {
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            required: ['file'],
                            properties: {
                                file: { type: 'string', format: 'binary' },
                            },
                        },
                    },
                },
            },
            responses: writeResponses,
        },
    },
    '/api/documents/{id}/download': {
        get: {
            tags: ['Documents'],
            summary: 'Download document file',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: {
                '200': { description: 'File stream or redirect' },
                ...err4xx,
            },
        },
    },
    '/api/documents/{id}/status': {
        put: {
            tags: ['Documents'],
            summary: 'Update document status (validated transitions)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
    },
    '/api/sustainability': {
        get: {
            tags: ['Sustainability'],
            summary: 'List sustainability metrics',
            security: bearer,
            responses: stdResponses,
        },
        post: {
            tags: ['Sustainability'],
            summary: 'Create metric',
            security: bearer,
            responses: writeResponses,
        },
    },
    '/api/sustainability/metrics': {
        post: {
            tags: ['Sustainability'],
            summary: 'Create metric (alias path)',
            security: bearer,
            responses: writeResponses,
        },
    },
    '/api/sustainability/{id}': {
        get: {
            tags: ['Sustainability'],
            summary: 'Get metric by ID',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        put: {
            tags: ['Sustainability'],
            summary: 'Update metric',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        delete: {
            tags: ['Sustainability'],
            summary: 'Delete metric (admin)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: mutateResponses,
        },
    },
    '/api/sustainability/projects/{projectId}/metrics': {
        get: {
            tags: ['Sustainability'],
            summary: 'Metrics for a project',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/ProjectIdPath' }],
            responses: stdResponses,
        },
    },
    '/api/sustainability/projects/{projectId}/metrics/latest': {
        get: {
            tags: ['Sustainability'],
            summary: 'Latest metric for a project',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/ProjectIdPath' }],
            responses: stdResponses,
        },
    },
    '/api/sustainability/projects/{projectId}/score': {
        get: {
            tags: ['Sustainability'],
            summary: 'Sustainability score',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/ProjectIdPath' }],
            responses: stdResponses,
        },
    },
    '/api/sustainability/projects/{projectId}/trends': {
        get: {
            tags: ['Sustainability'],
            summary: 'Trend aggregates (period/interval query params)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/ProjectIdPath' }],
            responses: stdResponses,
        },
    },
    '/api/sustainability/projects/{projectId}/compare': {
        get: {
            tags: ['Sustainability'],
            summary: 'Compare with industry',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/ProjectIdPath' }],
            responses: stdResponses,
        },
    },
    '/api/sustainability/calculate-impact': {
        post: {
            tags: ['Sustainability'],
            summary: 'Impact calculator',
            security: bearer,
            responses: stdResponses,
        },
    },
    '/api/compliance/checklists': {
        get: {
            tags: ['Compliance'],
            summary: 'List checklists',
            security: bearer,
            responses: stdResponses,
        },
        post: {
            tags: ['Compliance'],
            summary: 'Create checklist',
            security: bearer,
            responses: writeResponses,
        },
    },
    '/api/compliance/checklists/{id}': {
        get: {
            tags: ['Compliance'],
            summary: 'Get checklist',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        put: {
            tags: ['Compliance'],
            summary: 'Update checklist',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        delete: {
            tags: ['Compliance'],
            summary: 'Delete checklist (admin)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: mutateResponses,
        },
    },
    '/api/compliance/checklists/{id}/items/{itemId}': {
        put: {
            tags: ['Compliance'],
            summary: 'Update checklist item',
            security: bearer,
            parameters: [
                { $ref: '#/components/parameters/IdPath' },
                { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
            ],
            responses: stdResponses,
        },
    },
    '/api/compliance/score/{projectId}': {
        get: {
            tags: ['Compliance'],
            summary: 'Project compliance score',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/ProjectIdPath' }],
            responses: stdResponses,
        },
    },
    '/api/compliance/inspections': {
        get: {
            tags: ['Compliance'],
            summary: 'List inspections',
            security: bearer,
            responses: stdResponses,
        },
        post: {
            tags: ['Compliance'],
            summary: 'Create inspection',
            security: bearer,
            responses: writeResponses,
        },
    },
    '/api/compliance/inspections/{id}': {
        get: {
            tags: ['Compliance'],
            summary: 'Get inspection',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        put: {
            tags: ['Compliance'],
            summary: 'Update inspection',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        delete: {
            tags: ['Compliance'],
            summary: 'Delete inspection (admin)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: mutateResponses,
        },
    },
    '/api/safety/inspection': {
        post: {
            tags: ['Safety'],
            summary: 'Create safety inspection',
            security: bearer,
            responses: writeResponses,
        },
    },
    '/api/safety/{projectId}': {
        get: {
            tags: ['Safety'],
            summary: 'List inspections for project',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/ProjectIdPath' }],
            responses: stdResponses,
        },
    },
    '/api/safety/{projectId}/high-risk': {
        get: {
            tags: ['Safety'],
            summary: 'High/critical unresolved inspections',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/ProjectIdPath' }],
            responses: stdResponses,
        },
    },
    '/api/safety/inspection/{id}': {
        get: {
            tags: ['Safety'],
            summary: 'Get inspection by ID',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        put: {
            tags: ['Safety'],
            summary: 'Update inspection',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: stdResponses,
        },
        delete: {
            tags: ['Safety'],
            summary: 'Delete inspection (admin)',
            security: bearer,
            parameters: [{ $ref: '#/components/parameters/IdPath' }],
            responses: mutateResponses,
        },
    },
    ...materialsPaths('/api/materials'),
    ...materialsPaths('/api/resources/materials'),
    ...equipmentPaths('/api/equipment'),
    ...equipmentPaths('/api/resources/equipment'),
    ...supplierPaths('/api/suppliers'),
    ...supplierPaths('/api/resources/suppliers'),
};
export const manualComponents = {
    parameters: {
        IdPath: {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
        },
        MilestoneIdPath: {
            name: 'milestoneId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
        },
        ProjectIdPath: {
            name: 'projectId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
        },
        StatusPath: {
            name: 'status',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Project status filter',
        },
    },
    schemas: {
        RegisterRequest: {
            type: 'object',
            required: ['fullName', 'email', 'password', 'role'],
            properties: {
                fullName: { type: 'string', minLength: 2, maxLength: 100 },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 8, description: 'Upper, lower, digit' },
                role: {
                    type: 'string',
                    enum: ['ADMIN', 'PROJECT_MANAGER', 'INSPECTOR', 'SUPPLIER', 'VIEWER'],
                },
            },
        },
        LoginRequest: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' },
            },
        },
        UpdateProfileRequest: {
            type: 'object',
            required: ['fullName', 'email'],
            properties: {
                fullName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                jobTitle: { type: 'string', maxLength: 100 },
            },
        },
        ChangePasswordRequest: {
            type: 'object',
            required: ['currentPassword', 'newPassword'],
            properties: {
                currentPassword: { type: 'string' },
                newPassword: { type: 'string', minLength: 8 },
            },
        },
    },
};
