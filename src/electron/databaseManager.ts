import { Client } from 'pg';
import { app } from 'electron';
import dotenv from 'dotenv';
import path from "path"; // 1. Import dotenv

const envPath = app.isPackaged
    ? path.join(process.resourcesPath, '.env')
    : path.join(process.cwd(), '.env');

dotenv.config({ path: envPath });

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

export const initDB = async () => {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL");

        // Create the notes table if it doesn't exist
        // We use the 'video_path' as a unique ID to link a note to a video
        await client.query(`
            CREATE TABLE IF NOT EXISTS notes (
                video_path TEXT PRIMARY KEY,
                content TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Notes table initialized");
    } catch (err) {
        console.error("Database connection error:", err);
    }
};

// Function to save a note (Upsert: Insert, or Update if exists)
export const saveNote = async (videoPath: string, content: string) => {
    const query = `
        INSERT INTO notes (video_path, content, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (video_path) 
        DO UPDATE SET content = $2, updated_at = NOW();
    `;
    await client.query(query, [videoPath, content]);
};

// Function to get a note
export const getNote = async (videoPath: string) => {
    const res = await client.query('SELECT content FROM notes WHERE video_path = $1', [videoPath]);
    return res.rows.length > 0 ? res.rows[0].content : '';
};