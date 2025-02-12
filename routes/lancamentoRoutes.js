const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Listar todos os lançamentos
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT l.*, c.nome as cidade_nome, lt.numero as lote_numero 
            FROM lancamentos l
            JOIN cidades c ON l.cidade_id = c.id
            JOIN lotes lt ON l.lote_id = lt.id
            ORDER BY l.data_lancamento DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cadastrar novo lançamento
router.post('/', async (req, res) => {
    try {
        const { cidade_id, lote_id, data_lancamento, valor_faturado } = req.body;
        const [result] = await db.query(
            'INSERT INTO lancamentos (cidade_id, lote_id, data_lancamento, valor_faturado) VALUES (?, ?, ?, ?)',
            [cidade_id, lote_id, data_lancamento, valor_faturado]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar lançamentos por período
router.get('/periodo', async (req, res) => {
    try {
        const { data_inicio, data_fim } = req.query;
        const [rows] = await db.query(`
            SELECT l.*, c.nome as cidade_nome, lt.numero as lote_numero 
            FROM lancamentos l
            JOIN cidades c ON l.cidade_id = c.id
            JOIN lotes lt ON l.lote_id = lt.id
            WHERE l.data_lancamento BETWEEN ? AND ?
            ORDER BY l.data_lancamento DESC
        `, [data_inicio, data_fim]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Adicione esta rota para atualizar lançamento
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { valor_faturado } = req.body;
        
        console.log('Dados recebidos:', { id, valor_faturado });
        
        // Validações
        if (!id || valor_faturado === undefined) {
            console.log('Validação falhou:', { id, valor_faturado });
            return res.status(400).json({ error: 'ID e valor_faturado são obrigatórios' });
        }

        // Garante que o valor é um número
        const valorNumerico = parseFloat(valor_faturado);
        console.log('Valor convertido:', valorNumerico);
        
        if (isNaN(valorNumerico)) {
            console.log('Valor inválido:', valor_faturado);
            return res.status(400).json({ error: 'Valor inválido' });
        }

        // Verifica se o lançamento existe
        console.log('Buscando lançamento:', id);
        const [rows] = await db.query('SELECT * FROM lancamentos WHERE id = ?', [id]);
        console.log('Resultado da busca:', rows);
        
        if (!rows || rows.length === 0) {
            console.log('Lançamento não encontrado:', id);
            return res.status(404).json({ error: 'Lançamento não encontrado' });
        }

        // Atualiza o valor
        console.log('Atualizando valor:', { id, valorNumerico });
        const [result] = await db.query(
            'UPDATE lancamentos SET valor_faturado = ? WHERE id = ?',
            [valorNumerico, id]
        );
        console.log('Resultado da atualização:', result);

        if (result.affectedRows > 0) {
            console.log('Atualização bem-sucedida');
            // Retorna sucesso
            res.json({ 
                success: true,
                message: 'Lançamento atualizado com sucesso',
                valor_atualizado: valorNumerico
            });
        } else {
            console.log('Falha na atualização:', result);
            res.status(500).json({ error: 'Erro ao atualizar o lançamento' });
        }

    } catch (error) {
        console.error('Erro detalhado:', {
            message: error.message,
            stack: error.stack,
            error: error
        });
        res.status(500).json({ 
            error: 'Erro ao atualizar lançamento',
            details: error.message 
        });
    }
});

module.exports = router; 