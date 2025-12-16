const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Duffel } = require('@duffel/api');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Duffel Client
const duffel = new Duffel({
    token: process.env.DUFFEL_ACCESS_TOKEN,
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const hotelRoutes = require('./routes/hotels');
app.use('/api/hotels', hotelRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
