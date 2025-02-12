const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Log para debug
router.use((req, res, next) => {
    console.log('=== Lote Route Debug ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    console.log('========================');
    next();
});

// Listar todos os lotes
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT l.*, c.nome as cidade_nome 
            FROM lotes l 
            LEFT JOIN cidades c ON l.cidade_id = c.id 
            ORDER BY l.id
        `);
        console.log('Lotes encontrados:', rows.length);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar lotes:', {
            message: error.message,
            stack: error.stack,
            sql: error.sql
        });
        res.status(500).json({ 
            error: 'Erro ao buscar lotes',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Cadastrar novo lote
router.post('/', async (req, res) => {
    try {
        const { nome, cidade_id } = req.body;
        const [result] = await db.query(
            'INSERT INTO lotes (nome, cidade_id) VALUES (?, ?)', 
            [nome, cidade_id]
        );
        res.status(201).json({ id: result.insertId, nome, cidade_id });
    } catch (error) {
        console.error('Erro ao criar lote:', error);
        res.status(500).json({ error: 'Erro ao criar lote' });
    }
});

module.exports = router; 