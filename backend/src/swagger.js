// swagger.js — configures swagger-jsdoc to generate an OpenAPI spec from
// JSDoc comments written directly above each route. The comments live next
// to the code they describe, so docs are far less likely to drift out of
// sync with the actual API as it changes.

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MindSpace API',
      version: '1.0.0',
      description:
        'Self-help mental health platform API — auth & RBAC (Phase 1), Q&A forum with moderation (Phase 2), and clinical assessments with privacy-preserving analytics (Phase 3).',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development' },
      { url: 'https://mental-health-app-1-a5qo.onrender.com', description: 'Live (Render)' },
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
  },
  // Which files to scan for JSDoc @swagger comments
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
