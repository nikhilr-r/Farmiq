const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
connectDB();

// Init Cron Jobs
require('./cron/scheduler')();

// Routes
app.use('/api/v1/schemes', require('./routes/schemes'));
app.use('/api/v1/crops', require('./routes/crops'));
app.use('/api/v1/officers', require('./routes/officers'));
app.use('/api/v1/updates', require('./routes/updates'));
app.use('/api/v1/weather', require('./routes/weatherRoutes'));

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/admin', require('./routes/admin'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
