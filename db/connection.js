const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'iJulio@1700',
    database: process.env.DB_DATABASE || 'controle_vendas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    port: 3306,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    socketPath: '/tmp/mysql.sock',
    authPlugins: {
        mysql_native_password: () => () => Buffer.from(process.env.DB_PASSWORD || 'iJulio@1700')
    }
});

// Teste inicial da conexão
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        console.log('Using configuration:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_DATABASE
        });
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err.message);
        console.error('Database config:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_DATABASE,
            port: 3306
        });
    });

module.exports = pool; 