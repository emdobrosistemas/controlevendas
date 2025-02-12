const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const bcrypt = require('bcrypt');

// Listar usuários
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nome, email, tipo, status, created_at FROM usuarios');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cadastrar usuário
router.post('/', async (req, res) => {
    try {
        const { nome, email, senha, tipo } = req.body;
        const hashedSenha = await bcrypt.hash(senha, 10);
        
        const [result] = await db.query(
            'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
            [nome, email, hashedSenha, tipo]
        );
        
        res.status(201).json({ 
            id: result.insertId,
            nome,
            email,
            tipo
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        
        const [users] = await db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const user = users[0];
        
        // Retorna os dados do usuário sem a senha
        res.json({
            id: user.id,
            nome: user.nome,
            email: user.email,
            tipo: user.tipo
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 