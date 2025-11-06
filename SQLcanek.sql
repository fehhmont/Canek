DROP DATABASE IF EXISTS canek;
CREATE DATABASE IF NOT EXISTS canek;

USE canek;

CREATE TABLE usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento VARCHAR(15),
    genero VARCHAR(50),
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) DEFAULT 'cliente',
    status BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email),
    UNIQUE (cpf)
);

CREATE TABLE enderecos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    tipo_endereco ENUM('FATURAMENTO', 'ENTREGA') NOT NULL,
    cep VARCHAR(8) NOT NULL,
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(255),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf VARCHAR(5) NOT NULL,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE administradores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo ENUM('ADMIN', 'ESTOQUISTA') NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email)
);

CREATE TABLE produtos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    avaliacao DECIMAL(3, 1),
    descricao_detalhada TEXT,
    preco DECIMAL(10, 2),
    qtd_estoque INT NOT NULL,
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE produto_imagens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    produto_id BIGINT NOT NULL,
    caminho_imagem VARCHAR(255) NOT NULL,
    principal BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

CREATE TABLE pedidos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id BIGINT NULL, 
    endereco_id BIGINT NULL,
    forma_pagamento ENUM('BOLETO', 'CARTAO', 'PIX', 'DINHEIRO') NULL,
    status ENUM('AGUARDANDO_PAGAMENTO', 'PAGO', 'CANCELADO', 'ENVIADO', 'ENTREGUE') DEFAULT 'AGUARDANDO_PAGAMENTO',
    total_produtos DECIMAL(10,2) NOT NULL,
    total_frete DECIMAL(10,2) DEFAULT 0.00,
    valor_total DECIMAL(10,2) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMP NULL,
    numero_pedido VARCHAR(20) UNIQUE NULL, 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (endereco_id) REFERENCES enderecos(id) ON DELETE CASCADE
);

CREATE TABLE pedido_produtos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pedido_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    preco_total DECIMAL(10,2) NOT NULL, /* <-- CORREÇÃO AQUI: Removida a geração automática */
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);