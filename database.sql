-- Criação das tabelas
CREATE TABLE cidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lancamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cidade_id INT,
    lote_id INT,
    data_lancamento DATE NOT NULL,
    valor_faturado DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cidade_id) REFERENCES cidades(id),
    FOREIGN KEY (lote_id) REFERENCES lotes(id)
);

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'usuario') DEFAULT 'usuario',
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email)
);

-- Tabela de permissões (para futuras implementações)
CREATE TABLE permissoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    tela VARCHAR(50) NOT NULL,
    pode_ver BOOLEAN DEFAULT false,
    pode_editar BOOLEAN DEFAULT false,
    pode_criar BOOLEAN DEFAULT false,
    pode_deletar BOOLEAN DEFAULT false,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Atualize o INSERT do usuário admin com um hash bcrypt válido para a senha '123456'
INSERT INTO usuarios (nome, email, senha, tipo) 
VALUES ('Administrador', 'admin@admin.com', '123456', 'admin');

-- Primeiro, vamos inserir as permissões do Administrador
INSERT INTO permissoes (usuario_id, tela, pode_ver, pode_editar, pode_criar, pode_deletar)
VALUES 

-- Permissões para Administrador (usuario_id = 1)
(1, 'lancamentos', true, true, true, true),
(1, 'resultados', true, true, true, true),
(1, 'consolidado', true, true, true, true),
(1, 'configuracoes', true, true, true, true),

-- Permissões para Usuário comum (usuario_id = 2)
(2, 'lancamentos', false, false, false, false),
(2, 'resultados', true, false, false, false),
(2, 'consolidado', true, false, false, false),
(2, 'configuracoes', false, false, false, false);