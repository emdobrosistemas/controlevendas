const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Listar todas as cidades
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cidades ORDER BY nome');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cadastrar nova cidade
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