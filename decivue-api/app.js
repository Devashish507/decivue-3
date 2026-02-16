require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const decisionRoutes = require('./src/routes/decisionRoutes');
const attachmentRoutes = require('./src/routes/attachmentRoutes');
const { sequelize } = require('./src/models');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/decisions', decisionRoutes);
app.use('/api', attachmentRoutes);

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    const fs = require('fs');
    fs.appendFileSync('api_errors.log', `${new Date().toISOString()} - ${err.stack}\n`);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;
