DROP DATABASE IF EXISTS canek;
CREATE DATABASE IF NOT EXISTS canek;

USE canek;



CREATE TABLE usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento VARCHAR(10),
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
    preco DECIMAL(10, 2) NOT NULL,
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