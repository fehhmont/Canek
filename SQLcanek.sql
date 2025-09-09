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
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email),
    UNIQUE (cpf)
);

CREATE TABLE administradores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    -- CORRIGIDO: ENUM com valores em maiúsculas para corresponder ao Java
    cargo ENUM('ADMIN', 'ESTOQUISTA') NOT NULL, 
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email)
);

-- CORRIGIDO: Inserindo o administrador com a senha '1234' já criptografada com BCrypt
INSERT INTO administradores (nome_completo, email, senha_hash, cargo) 
VALUES ('admin', 'admin@admin.com', '$2a$10$Y50UaMFOx.T7A/wza5xUzuI4qDWsn6N2sXwG/T2le7cCL2vj9vJHS', 'ADMIN');

-- O resto do seu script...