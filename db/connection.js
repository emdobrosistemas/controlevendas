const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 20000, // 20 segundos
    ssl: {
        rejectUnauthorized: false
    },
    // Adiciona retry strategy
    acquireTimeout: 30000,
    // Configurações para reconexão
    maxReconnects: 10,
    reconnectDelay: 500
});

// Função para testar a conexão
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        console.log('Using configuration:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT
        });
        connection.release();
        return true;
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
        return false;
    }
};

// Testa a conexão inicial
testConnection();

// Exporta o pool e a função de teste
module.exports = pool; 