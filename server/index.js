import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Duffel } from '@duffel/api';
import hotelRoutes from './routes/hotels.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app (dist folder)
// We go up one level from 'server' to find 'dist'
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize Duffel Client
const duffelToken = process.env.DUFFEL_ACCESS_TOKEN;
let duffel;
if (duffelToken) {
    duffel = new Duffel({
        token: duffelToken,
    });
} else {
    console.warn("WARNING: DUFFEL_ACCESS_TOKEN is missing. Hotel API will fail.");
}

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/hotels', hotelRoutes);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
import fs from 'fs';
app.get(/.*/, (req, res) => {
    const indexPath = path.join(__dirname, '../dist/index.html');

    fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        if (err) {
            console.error('Error reading index.html', err);
            return res.status(500).send('Error loading app');
        }

        // Inject Runtime Environment Variables
        const envScript = `
          <script>
            window.__ENV__ = {
              VITE_SUPABASE_URL: "${process.env.VITE_SUPABASE_URL || ''}",
              VITE_SUPABASE_ANON_KEY: "${process.env.VITE_SUPABASE_ANON_KEY || ''}",
              VITE_DUFFEL_PUBLIC_KEY: "${process.env.VITE_DUFFEL_PUBLIC_KEY || ''}",
              VITE_WEB3AUTH_CLIENT_ID: "${process.env.VITE_WEB3AUTH_CLIENT_ID || ''}",
              VITE_DUFFEL_CHECKOUT_URL: "${process.env.VITE_DUFFEL_CHECKOUT_URL || ''}"
            };
          </script>
        `;

        // Inject into <head>
        const finalHtml = htmlData.replace('</head>', `${envScript}</head>`);

        res.send(finalHtml);
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} (0.0.0.0)`);
});
