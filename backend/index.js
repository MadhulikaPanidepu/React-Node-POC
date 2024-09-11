const express = require('express');
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require('./swagger/swagger');
const truckRoutes = require('./routes/truckRoute');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Use truck routes
app.use('/', truckRoutes);

app.listen(port, () => {
    console.log(`Backend is running on port ${port}`);
});