const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Debug middleware específico para rotas de cidade
router.use((req, res, next) => {
    console.log('\n=== Rota de Cidades ===');
    console.log('Método:', req.method);
    console.log('URL:', req.originalUrl);
    next();
});

// GET /cidades
router.get('/', async (req, res) => {
    try {
        console.log('Buscando todas as cidades...');
        const [rows] = await db.query('SELECT * FROM cidades ORDER BY nome');
        console.log(`${rows.length} cidades encontradas`);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar cidades',
            details: error.message 
        });
    }
});

// POST /cidades
router.post('/', async (req, res) => {
    try {
        const { nome } = req.body;
        const [result] = await db.query('INSERT INTO cidades (nome) VALUES (?)', [nome]);
        res.status(201).json({ id: result.insertId, nome });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 