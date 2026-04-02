import { manualPaths, manualComponents } from './openapi.paths';
import swaggerJsdoc from 'swagger-jsdoc';
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sustainable Construction Management API',
            version: '1.0.0',
            description: 'RESTful API for the Sustainable Construction Project Management System — SE3040 Application Frameworks. ' +
                'Materials, equipment, and suppliers are mounted at `/api/{resource}` and again under `/api/resources/{resource}` with identical routes.',
            contact: {
                name: 'SustainSite Team',
            },
        },
        servers: [
            {
                url: process.env.API_BASE_URL || 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            parameters: manualComponents.parameters,
            schemas: manualComponents.schemas,
        },
        security: [{ bearerAuth: [] }],
        paths: manualPaths,
        tags: [
            { name: 'Health', description: 'Service health' },
            { name: 'Auth', description: 'Authentication & user session' },
            { name: 'Projects', description: 'Construction project management' },
            { name: 'Milestones', description: 'Project milestones' },
            { name: 'Sustainability', description: 'Environmental metrics & scoring' },
            { name: 'Documents', description: 'Document upload & compliance workflow' },
            { name: 'Compliance', description: 'Compliance checklists' },
            { name: 'Safety', description: 'Safety inspections' },
            { name: 'Materials', description: 'Material inventory management' },
            { name: 'Equipment', description: 'Equipment registry & maintenance' },
            { name: 'Suppliers', description: 'Supplier management' },
            { name: 'Users', description: 'User management (ADMIN only)' },
        ],
    },
    apis: [],
};
export const swaggerSpec = swaggerJsdoc(options);
