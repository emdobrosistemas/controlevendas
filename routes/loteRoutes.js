const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Listar todos os lotes
router.get('/', async (req, res) => {
    try {
        console.log('Requisição de lotes recebida');
        const [rows] = await db.query('SELECT * FROM lotes ORDER BY numero');
        console.log(`${rows.length} lotes encontrados`);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar lotes:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cadastrar novo lote
router.post('/', async (req, res) => {
    try {
        const { numero } = req.body;
        const [result] = await db.query('INSERT INTO lotes (numero) VALUES (?)', [numero]);
        res.status(201).json({ id: result.insertId, numero });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 