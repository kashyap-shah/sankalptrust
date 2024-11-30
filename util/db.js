// lib/db.js
const { Pool } = require('pg');

// Neon connection URL from environment variables
const connectionString = process.env.DATABASE_URL;

// Create a pool using the Neon URL
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false, // Required for Neon
    },
});

// Export the pool for querying the database
module.exports = pool;
