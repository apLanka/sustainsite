// swagger-jsdoc is an optional dependency — this file is only loaded at runtime
// when the package is present (guarded by the try/catch in app.ts)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sustainable Construction Management API',
      version: '1.0.0',
      description:
        'RESTful API for the Sustainable Construction Project Management System — SE3040 Application Frameworks',
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
    },
    security: [{ bearerAuth: [] }],
    tags: [
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
  // Scan all route and controller files for JSDoc @swagger annotations
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
