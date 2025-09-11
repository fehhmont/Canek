import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup'; 
import { cadastroSchema } from "../../utils/validationSchemas.js";
import './css/CadastroPage.css';

// Ícone de seta para voltar
const ArrowLeft = () => (
  <svg width="28" height="28" fill="none" stroke="#52658F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}><polyline points="18 24 8 14 18 4"/></svg>
);

function CadastroPage() {
    const [mensagemApi, setMensagemApi] = useState("");
    const navigate = useNavigate();

    const { 
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(cadastroSchema)
    });

    const onSubmit = async (data) => {
        setMensagemApi("");
        try {
            const response = await fetch("http://localhost:8080/auth/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setMensagemApi("Cadastro realizado com sucesso! Redirecionando...");
                setTimeout(() => navigate("/LoginPage"), 2000);
            } else {
                const erroTexto = await response.text();
                setMensagemApi(erroTexto || "Ocorreu um erro ao cadastrar.");
            }
        } catch {
            setMensagemApi("Não foi possível conectar ao servidor.");
        }
    };

    return (
      <div className="cadastro-bg">
        <button className="cadastro-back-btn" onClick={() => navigate("/login")} title="Voltar para login">
          <ArrowLeft />
        </button>
        <h1 className="cadastro-title-big">Cadastrar Novo Usuário</h1>
        <p className="cadastro-subtitle-center">
          Preencha os campos abaixo para criar sua conta
        </p>
        <div className="cadastro-card">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="cadastro-form-grid">
              <div className="cadastro-form-group">
                <label htmlFor="nomeCompleto" className="cadastro-label">Nome:</label>
                <input
                  type="text"
                  id="nomeCompleto"
                  {...register("nomeCompleto")}
                  className="cadastro-input"
                  placeholder="Nome completo"
                />
                {errors.nomeCompleto && <p className="cadastro-error">{errors.nomeCompleto.message}</p>}
              </div>
              <div className="cadastro-form-group">
                <label htmlFor="cpf" className="cadastro-label">CPF:</label>
                <input
                  type="text"
                  id="cpf"
                  {...register("cpf")}
                  className="cadastro-input"
                  placeholder="000.000.000-00"
                />
                {errors.cpf && <p className="cadastro-error">{errors.cpf.message}</p>}
              </div>
              <div className="cadastro-form-group">
                <label htmlFor="email" className="cadastro-label">Email:</label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="cadastro-input"
                  placeholder="email@exemplo.com"
                />
                {errors.email && <p className="cadastro-error">{errors.email.message}</p>}
              </div>
              <div className="cadastro-form-group">
                <label htmlFor="telefone" className="cadastro-label">Telefone:</label>
                <input
                  type="tel"
                  id="telefone"
                  {...register("telefone")}
                  className="cadastro-input"
                  placeholder="(99) 99999-9999"
                />
                {errors.telefone && <p className="cadastro-error">{errors.telefone.message}</p>}
              </div>
              <div className="cadastro-form-group">
                <label htmlFor="senha" className="cadastro-label">Senha:</label>
                <input
                  type="password"
                  id="senha"
                  {...register("senha")}
                  className="cadastro-input"
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.senha && <p className="cadastro-error">{errors.senha.message}</p>}
              </div>
              <div className="cadastro-form-group">
                <label htmlFor="confirmarSenha" className="cadastro-label">Confirmar senha:</label>
                <input
                  type="password"
                  id="confirmarSenha"
                  {...register("confirmarSenha")}
                  className="cadastro-input"
                  placeholder="Repita a senha"
                />
                {errors.confirmarSenha && <p className="cadastro-error">{errors.confirmarSenha.message}</p>}
              </div>
            </div>
            {mensagemApi && <p style={{ color: '#52658F', textAlign: 'center', marginTop: 12 }}>{mensagemApi}</p>}
            <button type="submit" disabled={isSubmitting} className="cadastro-btn">
              {isSubmitting ? "Cadastrando..." : "Salvar"}
            </button>
          </form>
        </div>
      </div>
    );
}

export default CadastroPage;