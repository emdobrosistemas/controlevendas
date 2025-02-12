const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('Tentando conectar ao banco com:', {
    host: config.host,
    user: config.user,
    database: config.database
});

const pool = mysql.createPool(config);

// Teste de conexão inicial
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to database:', err);
        process.exit(1);
    });

module.exports = pool; 