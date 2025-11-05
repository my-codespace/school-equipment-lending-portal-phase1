import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Inventory Management API',
      version: '1.0.0',
      description:
        'API documentation for the School Equipment Lending Portal project. ' +
        'This is the Phase 2 (AI-Assisted) version.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api', // Your base API URL
      },
    ],
    // This part tells swagger-ui-express how to handle the "Authorize" button
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Apply "bearerAuth" to all routes
      },
    ],
  },
  // This tells swagger-jsdoc where to find your route files
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
