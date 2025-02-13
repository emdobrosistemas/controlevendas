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

// Login com verificação de permissões
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        console.log('Tentativa de login para:', email);
        
        // Busca o usuário pelo email com todos os campos necessários
        const [users] = await db.query(
            'SELECT id, nome, email, senha, tipo FROM usuarios WHERE email = ? AND status = true', 
            [email]
        );
        
        if (users.length === 0) {
            console.log('Usuário não encontrado ou inativo:', email);
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const user = users[0];
        let senhaValida = false;

        // Primeiro tenta comparar a senha em texto puro
        if (senha === user.senha) {
            senhaValida = true;
            // Atualiza a senha para hash
            const hashedSenha = await bcrypt.hash(senha, 10);
            await db.query('UPDATE usuarios SET senha = ? WHERE id = ?', [hashedSenha, user.id]);
            console.log('Senha atualizada para hash');
        } else {
            // Se não for senha em texto puro, tenta verificar o hash
            try {
                senhaValida = await bcrypt.compare(senha, user.senha);
            } catch (error) {
                console.error('Erro ao verificar senha:', error);
            }
        }

        if (!senhaValida) {
            console.log('Senha inválida para usuário:', email);
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        // Define as permissões baseado no tipo de usuário
        const permissoes = {
            admin: {
                lancamentos: true,
                resultados: true,
                consolidado: true,
                configuracoes: true
            },
            usuario: {
                lancamentos: false,
                resultados: true,
                consolidado: true,
                configuracoes: false
            }
        };

        // Verifica se o tipo de usuário existe
        if (!permissoes[user.tipo]) {
            console.error('Tipo de usuário inválido:', user.tipo);
            return res.status(400).json({ error: 'Tipo de usuário inválido' });
        }

        // Prepara a resposta
        const userResponse = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            tipo: user.tipo,
            permissoes: permissoes[user.tipo]
        };

        console.log('Login bem-sucedido:', {
            id: user.id,
            email: user.email,
            tipo: user.tipo,
            permissoes: Object.keys(permissoes[user.tipo])
        });

        res.json(userResponse);

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Adicione esta rota para atualizar usuário
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, tipo, senha } = req.body;
        
        // Primeiro verifica se o usuário existe
        const [existingUser] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
        if (existingUser.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        let query = 'UPDATE usuarios SET nome = ?, email = ?, tipo = ?';
        let params = [nome, email, tipo];

        // Se uma nova senha foi fornecida
        if (senha && senha.trim() !== '') {
            // Hash da nova senha
            const hashedSenha = await bcrypt.hash(senha, 10);
            query += ', senha = ?';
            params.push(hashedSenha);
            console.log('Atualizando senha para o usuário:', id);
        }

        query += ' WHERE id = ?';
        params.push(id);
        
        const [result] = await db.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Erro ao atualizar usuário' });
        }
        
        console.log('Usuário atualizado com sucesso:', { id, nome, email, tipo });
        res.json({ 
            message: 'Usuário atualizado com sucesso',
            usuario: { id, nome, email, tipo }
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota temporária para redefinir senha
router.post('/reset-senha', async (req, res) => {
    try {
        const { email, novaSenha } = req.body;
        const hashedSenha = await bcrypt.hash(novaSenha, 10);
        
        const [result] = await db.query(
            'UPDATE usuarios SET senha = ? WHERE email = ?',
            [hashedSenha, email]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota temporária para redefinir senha do admin
router.post('/reset-admin', async (req, res) => {
    try {
        // Senha padrão: 123456
        const hashedSenha = await bcrypt.hash('123456', 10);
        
        const [result] = await db.query(
            'UPDATE usuarios SET senha = ? WHERE email = ?',
            [hashedSenha, 'admin@admin.com']
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Admin não encontrado' });
        }
        
        res.json({ message: 'Senha do admin redefinida com sucesso' });
    } catch (error) {
        console.error('Erro ao redefinir senha do admin:', error);
        res.status(500).json({ error: error.message });
    }
});

// Adicionar rota para deletar usuário
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Tentando deletar usuário:', id); // Log para debug

        // Verifica se é um admin
        const [user] = await db.query('SELECT tipo FROM usuarios WHERE id = ?', [id]);
        
        if (user.length === 0) {
            console.log('Usuário não encontrado:', id);
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        if (user[0].tipo === 'admin') {
            console.log('Tentativa de deletar admin:', id);
            return res.status(403).json({ error: 'Não é permitido deletar usuários administradores' });
        }

        const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            console.log('Nenhum usuário deletado:', id);
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        console.log('Usuário deletado com sucesso:', id);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota temporária para verificar admin
router.get('/check-admin', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, nome, email, tipo FROM usuarios WHERE email = ?', ['admin@admin.com']);
        res.json({ 
            exists: users.length > 0,
            user: users[0] || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota temporária para criar/redefinir admin
router.post('/setup-admin', async (req, res) => {
    try {
        const senha = '123456'; // Senha padrão
        const hashedSenha = await bcrypt.hash(senha, 10);
        
        // Primeiro, tenta atualizar se já existe
        const [updateResult] = await db.query(
            'UPDATE usuarios SET senha = ? WHERE email = ?',
            [hashedSenha, 'admin@admin.com']
        );
        
        if (updateResult.affectedRows === 0) {
            // Se não existe, cria um novo
            await db.query(
                'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
                ['Administrador', 'admin@admin.com', hashedSenha, 'admin']
            );
        }
        
        res.json({ 
            message: 'Admin configurado com sucesso',
            credentials: {
                email: 'admin@admin.com',
                senha: senha
            }
        });
    } catch (error) {
        console.error('Erro ao configurar admin:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 