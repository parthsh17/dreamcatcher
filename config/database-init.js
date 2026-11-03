
import pool from './database.js';

// Create dreams table if it doesn't exist
export async function initDatabase() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS dreams (
        id SERIAL PRIMARY KEY,
        dream_text TEXT NOT NULL,
        interpretation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');

  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;

  } finally {
    client.release();
  }
}

export default pool;
