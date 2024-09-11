const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Warehouse Truck Management API',
      version: '1.0.0',
      description: 'API documentation for the Warehouse Truck Management system',
    },
    servers: [
      {
        url: 'http://localhost:5001', 
      },
    ],
  },
  // Path to the API docs 
  apis: ['./routes/*.js'], 
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = { swaggerUi, swaggerSpec };
