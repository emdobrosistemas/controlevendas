const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db/connection');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Prefixo /api para todas as rotas da API
app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// Rotas da API
app.use('/api/cidades', require('./routes/cidadeRoutes'));
app.use('/api/lotes', require('./routes/loteRoutes'));
app.use('/api/lancamentos', require('./routes/lancamentoRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));

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
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log('Variáveis de ambiente carregadas:', {
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_DATABASE: process.env.DB_DATABASE,
        PORT: process.env.PORT
    });
});