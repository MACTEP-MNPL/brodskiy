import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const {DB_HOST, DB_USER, DB_PASSWORD, DB_NAME} = process.env;

export const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
})

// Add error handling for the pool
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Add connection testing
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection established');
        connection.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(-1);
    }
};

testConnection();