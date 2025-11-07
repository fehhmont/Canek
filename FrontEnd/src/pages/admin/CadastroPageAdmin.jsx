import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import './css/CadastroPageAdmin.css';

// Ícone de seta para voltar
const ArrowLeft = () => (
  <svg width="28" height="28" fill="none" stroke="#52658F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}><polyline points="18 24 8 14 18 4"/></svg>
);

// Schema de validação
const adminCadastroSchema = yup.object().shape({
  nomeCompleto: yup.string().required('O nome completo é obrigatório'),
  email: yup.string().email('Digite um email válido').required('O email é obrigatório'),
  cpf: yup.string()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Digite um CPF válido no formato 000.000.000-00')
    .required('O CPF é obrigatório'),
  senha: yup.string().required('A senha é obrigatória'),
  confirmarSenha: yup.string()
    .oneOf([yup.ref('senha'), null], 'As senhas devem ser iguais')
    .required('A confirmação de senha é obrigatória'),
  cargo: yup.string().oneOf(['ADMIN', 'ESTOQUISTA'], 'Selecione um cargo válido').required('O cargo é obrigatório'),
});

function CadastroPageAdmin() {
    const [mensagemApi, setMensagemApi] = useState("");
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    // 1. Adicione a função 'reset' do useForm
    const {
        register,
        handleSubmit,
        reset, // <--- Adicionado aqui
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(adminCadastroSchema)
    });

    const onSubmit = async (data) => {
        setMensagemApi("");
        setIsError(false);

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch("http://localhost:8080/auth/administrador/cadastro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                // 2. Altere o comportamento em caso de sucesso
                setMensagemApi("Usuário criado com sucesso!");
                setIsError(false);
                reset(); // Limpa todos os campos do formulário

                // Opcional: Limpar a mensagem de sucesso após alguns segundos
                setTimeout(() => {
                    setMensagemApi("");
                }, 4000);

            } else {
                const erroTexto = await response.text();
                setMensagemApi(erroTexto || "Ocorreu um erro ao cadastrar.");
                setIsError(true);
            }
        } catch {
            setMensagemApi("Não foi possível conectar ao servidor.");
            setIsError(true);
        }
    };
    const handleCpfChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, ''); // Remove tudo que não é dígito

        let masked = '';
        if (digits.length > 0) masked = digits.substring(0, 3);
        if (digits.length > 3) masked += `.${digits.substring(3, 6)}`;
        if (digits.length > 6) masked += `.${digits.substring(6, 9)}`;
        if (digits.length > 9) masked += `-${digits.substring(9, 11)}`;

        setValue('cpf', masked, { shouldValidate: true });
    };

    return (
      <div className="cadastro-bg">
        <button className="cadastro-back-btn" onClick={() => navigate("/UserManagementPage")} title="Voltar">
          <ArrowLeft />
        </button>
        <h1 className="cadastro-title-big">Cadastrar Novo Admin</h1>
        <p className="cadastro-subtitle-center">
          Preencha os campos para criar uma nova conta de administrador
        </p>
        <div className="cadastro-card">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ... (o restante do seu formulário JSX permanece o mesmo) ... */}
            <div className="cadastro-form-group">
              <label htmlFor="nomeCompleto" className="cadastro-label">Nome Completo:</label>
              <input
                type="text"
                id="nomeCompleto"
                {...register("nomeCompleto")}
                className="cadastro-input"
                placeholder="Nome completo do administrador"
              />
              {errors.nomeCompleto && <p className="cadastro-error">{errors.nomeCompleto.message}</p>}
            </div>

            <div className="cadastro-form-group">
              <label htmlFor="email" className="cadastro-label">Email:</label>
              <input
                type="email"
                id="email"
                {...register("email")}
                className="cadastro-input"
                placeholder="email@canek.com"
              />
              {errors.email && <p className="cadastro-error">{errors.email.message}</p>}
            </div>
            <div className="cadastro-form-group">
                <label htmlFor="cpf" className="cadastro-label">CPF:</label>
                <input
                  type="text"
                  id="cpf"
                  {...register("cpf")}
                  onChange={handleCpfChange}
                  className="cadastro-input"
                  placeholder="000.000.000-00"
                  maxLength="14" // Limita o tamanho do campo
                />
                {errors.cpf && <p className="cadastro-error">{errors.cpf.message}</p>}
              </div>

            <div className="cadastro-form-group">
              <label htmlFor="senha" className="cadastro-label">Senha:</label>
              <input
                type="password"
                id="senha"
                {...register("senha")}
                className="cadastro-input"
                placeholder="Crie uma senha forte"
              />
              {errors.senha && <p className="cadastro-error">{errors.senha.message}</p>}
            </div>

            <div className="cadastro-form-group">
              <label htmlFor="confirmarSenha" className="cadastro-label">Confirmar Senha:</label>
              <input
                type="password"
                id="confirmarSenha"
                {...register("confirmarSenha")}
                className="cadastro-input"
                placeholder="Repita a senha"
              />
              {errors.confirmarSenha && <p className="cadastro-error">{errors.confirmarSenha.message}</p>}
            </div>

            <div className="cadastro-form-group">
              <label htmlFor="cargo" className="cadastro-label">Cargo:</label>
              <select
                id="cargo"
                {...register("cargo")}
                className="cadastro-input"
              >
                <option value="">Selecione um cargo</option>
                <option value="ADMIN">ADMIN</option>
                <option value="ESTOQUISTA">ESTOQUISTA</option>
              </select>
              {errors.cargo && <p className="cadastro-error">{errors.cargo.message}</p>}
            </div>

            {/* 3. Lógica para exibir a mensagem com cor dinâmica (verde para sucesso, vermelho para erro) */}
            {mensagemApi && (
                <p style={{
                    color: isError ? '#d32f2f' : '#27ae60',
                    textAlign: 'center',
                    marginTop: 12,
                    fontWeight: 'bold'
                }}>
                    {mensagemApi}
                </p>
            )}
            <button type="submit" disabled={isSubmitting} className="cadastro-btn">
              {isSubmitting ? "Salvando..." : "Salvar Administrador"}
            </button>
          </form>
        </div>
      </div>
    );
}

export default CadastroPageAdmin;