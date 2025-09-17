DROP DATABASE IF EXISTS canek;
CREATE DATABASE IF NOT EXISTS canek;

USE canek;

CREATE TABLE usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo_usuario VARCHAR(50) DEFAULT 'cliente',
    status BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email),
    UNIQUE (cpf)
);

CREATE TABLE administradores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    cargo ENUM('ADMIN', 'ESTOQUISTA') NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email)
);

CREATE TABLE produtos (
    -- CORREÇÃO APLICADA AQUI: Alterado de INT para BIGINT
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    avaliacao DECIMAL(3, 1),
    descricao_detalhada TEXT,
    preco DECIMAL(10, 2) NOT NULL,
    qtd_estoque INT NOT NULL,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE produto_imagens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    -- CORREÇÃO APLICADA AQUI: Alterado de INT para BIGINT para corresponder à tabela produtos
    produto_id BIGINT NOT NULL,
    caminho_imagem VARCHAR(255) NOT NULL,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);