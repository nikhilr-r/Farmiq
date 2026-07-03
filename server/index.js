const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use('/api/v1/diagnosis', require('./routes/diagnosis'));

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/admin', require('./routes/admin'));
app.use('/api/v1/farmer/auth', require('./routes/farmerAuth'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
