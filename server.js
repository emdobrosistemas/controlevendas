const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db/connection');

const app = express();

// Configuração do CORS
app.use(cors({
    origin: '*', // Em produção, você deve especificar o domínio exato
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Adicione este middleware antes das rotas
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Prefixo /api para todas as rotas da API
app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Rotas da API
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/cidades', require('./routes/cidadeRoutes'));
app.use('/api/lotes', require('./routes/loteRoutes'));
app.use('/api/lancamentos', require('./routes/lancamentoRoutes'));

// Tratamento de erros para rotas da API
app.use('/api', (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota para a página principal - deve ser a última rota
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Teste de conexão com o banco
db.query('SELECT 1')
    .then(() => {
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados:', err);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Variáveis de ambiente carregadas:', {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_DATABASE: process.env.DB_DATABASE,
        PORT: process.env.PORT
    });
});