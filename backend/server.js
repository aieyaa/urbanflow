import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database & PostGIS
const initDb = async () => {
  try {
    // Enable PostGIS extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('PostGIS extension enabled/verified.');

    // Create a table for parking locations with geospatial geometry
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parkings (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        status VARCHAR(50),
        capacity INTEGER,
        available INTEGER,
        geom GEOMETRY(Point, 4326),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Parkings table verified.');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

// Delay DB initialization slightly to allow DB service to be fully up inside Docker-compose
setTimeout(initDb, 5000);

// Health Check API
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT postgis_version();');
    res.json({
      status: 'OK',
      database: 'Connected',
      postgis: dbCheck.rows[0].postgis_version,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      error: err.message
    });
  }
});

// Proxy/Get Nantes Public Parkings from Nantes Métropole Open Data API
app.get('/api/parkings', async (req, res) => {
  try {
    // API endpoint for Nantes parking availabilities
    const url = 'https://data.nantesmetropole.fr/api/explore/v2.1/catalog/datasets/244400404_parkings-publics-nantes-disponibilites/records?limit=100';
    const response = await axios.get(url);
    const records = response.data.results || [];
    
    // Return the formatted parking availability list
    res.json(records);
  } catch (err) {
    console.error('Error fetching parking data:', err.message);
    res.status(500).json({ error: 'Failed to fetch parking data from Nantes Métropole API', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
