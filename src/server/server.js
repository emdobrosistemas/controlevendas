const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' 
        ? path.join(__dirname, '../../.env.production')
        : path.join(__dirname, '../../.env.development')
});
const db = require('./db/connection');

const app = express();
const API_PREFIX = '/gestao/api';

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log('\n=== Nova Requisição ===');
    console.log('URL:', req.originalUrl);
    console.log('Método:', req.method);
    next();
});

// Handler para erros da API
app.use((err, req, res, next) => {
    console.error('Erro:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rotas da API
app.use(`${API_PREFIX}/cidades`, require('./routes/cidadeRoutes'));
app.use(`${API_PREFIX}/lotes`, require('./routes/loteRoutes'));
app.use(`${API_PREFIX}/lancamentos`, require('./routes/lancamentoRoutes'));
app.use(`${API_PREFIX}/usuarios`, require('./routes/usuarioRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log('Ambiente:', process.env.NODE_ENV);
    console.log('API Prefix:', API_PREFIX);
    console.log('Configurações:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE
    });
});