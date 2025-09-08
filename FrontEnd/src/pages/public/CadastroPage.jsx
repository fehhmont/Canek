// Arquivo: src/pages/public/CadastroPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
// A biblioteca @hookform/resolvers é um pacote separado que precisa ser instalado.
import { yupResolver } from '@hookform/resolvers/yup'; 

// Importa nosso esquema de validação que já sabe validar CPF
import { cadastroSchema } from "../../utils/validationSchemas.js";

function CadastroPage() {
    const [mensagemApi, setMensagemApi] = useState("");
    const navigate = useNavigate();

    // 1. Configuração do React Hook Form
    const { 
        register, // Função para registrar os inputs
        handleSubmit, // Função para encapsular nosso envio
        formState: { errors, isSubmitting } // Objeto com os erros e estado de envio
    } = useForm({
        resolver: yupResolver(cadastroSchema) // Conecta o Yup com o React Hook Form
    });

    // 2. Função que é chamada apenas se o formulário for VÁLIDO
    const onSubmit = async (data) => {
        setMensagemApi(""); // Limpa mensagens antigas

        try {
            const response = await fetch("http://localhost:8080/auth/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setMensagemApi("Cadastro realizado com sucesso! Redirecionando...");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                const erroTexto = await response.text();
                setMensagemApi(erroTexto || "Ocorreu um erro ao cadastrar.");
            }
        } catch (error) {
            setMensagemApi("Não foi possível conectar ao servidor.");
        }
    };

    return (
        <div>
            <h1>Página de Cadastro</h1>
            {/* 3. Usamos o handleSubmit do hook para validar antes de chamar nosso onSubmit */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="nomeCompleto">Nome Completo:</label>
                    {/* 4. Registramos o input e o React Hook Form cuida do estado dele */}
                    <input type="text" id="nomeCompleto" {...register("nomeCompleto")} />
                    {/* 5. Exibimos a mensagem de erro específica para este campo */}
                    {errors.nomeCompleto && <p style={{ color: 'red' }}>{errors.nomeCompleto.message}</p>}
                </div>

                <div>
                    <label htmlFor="cpf">CPF:</label>
                    <input type="text" id="cpf" {...register("cpf")} />
                    {/* A validação do CPF agora é automática! */}
                    {errors.cpf && <p style={{ color: 'red' }}>{errors.cpf.message}</p>}
                </div>

                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" {...register("email")} />
                    {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
                </div>
                
                <div>
                    <label htmlFor="senha">Senha:</label>
                    <input type="password" id="senha" {...register("senha")} />
                    {errors.senha && <p style={{ color: 'red' }}>{errors.senha.message}</p>}
                </div>

                <div>
                    <label htmlFor="telefone">Telefone:</label>
                    <input type="tel" id="telefone" {...register("telefone")} />
                    {errors.telefone && <p style={{ color: 'red' }}>{errors.telefone.message}</p>}
                </div>

                {mensagemApi && <p>{mensagemApi}</p>}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                </button>
            </form>
            <br />
            <Link to="/">Voltar para a página principal</Link>
        </div>
    );
}

export default CadastroPage;