import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Reutilize o mesmo CSS da página de cadastro se o estilo for o mesmo
import './css/CadastroPageAdmin.css'; 

const ArrowLeft = () => (
  <svg width="28" height="28" fill="none" stroke="#52658F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}><polyline points="18 24 8 14 18 4"/></svg>
);

// Schema de validação para a edição (sem a senha)
const adminUpdateSchema = yup.object().shape({
  nomeCompleto: yup.string().required('O nome completo é obrigatório'),
  email: yup.string().email('Digite um email válido').required('O email é obrigatório'),
  cpf: yup.string().required('O CPF é obrigatório'),
  cargo: yup.string().oneOf(['ADMIN', 'ESTOQUISTA'], 'Selecione um cargo válido').required('O cargo é obrigatório'),
  senha: yup.string().optional(),
  confirmarSenha: yup.string().oneOf([yup.ref('senha'), null], 'As senhas devem ser iguais')
});

function EditAdminPage() {
    const { userId } = useParams(); // Pega o ID da URL (:userId)
    const navigate = useNavigate();
    const [mensagemApi, setMensagemApi] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento inicial

    const {
        register,
        handleSubmit,
        reset, // Usado para preencher o formulário com dados da API
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(adminUpdateSchema)
    });

    // Hook para buscar os dados do admin quando o componente é montado
    useEffect(() => {
        const fetchAdminData = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('userToken');
            try {
                const response = await fetch(`http://localhost:8080/auth/administrador/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error('Falha ao buscar dados do administrador.');
                }

                const data = await response.json();
                
                // Popula o formulário com os dados recebidos
                reset({
                    nomeCompleto: data.nomeCompleto,
                    email: data.email,
                    cpf: data.cpf, // Adiciona o CPF ao formulário
                    cargo: data.tipoUsuarioOuCargo // O DTO usa este nome de campo
                });

            } catch (error) {
                setMensagemApi(error.message);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdminData();
    }, [userId, reset]); // Roda sempre que o userId ou a função reset mudarem

    const onSubmit = async (data) => {
        setMensagemApi("");
        setIsError(false);

        const payload = {
            nomeCompleto: data.nomeCompleto,
            email: data.email,
            cpf: data.cpf,
            cargo: data.cargo,
            senha: data.senha || null
        };
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:8080/auth/administrador/${userId}`, {
                method: 'PUT', // Método HTTP para atualização
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMensagemApi("Administrador atualizado com sucesso!");
                setIsError(false);
                setTimeout(() => navigate('/UserManagementPage'), 2000);
            } else {
                const erroTexto = await response.text();
                setMensagemApi(erroTexto || "Erro ao atualizar administrador.");
                setIsError(true);
            }
        } catch (error) {
            setMensagemApi("Falha na conexão com o servidor.");
            setIsError(true);
        }
    };

    if (isLoading) {
        return <div className="cadastro-bg"><p>Carregando dados do administrador...</p></div>;
    }
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
            <h1 className="cadastro-title-big">Editar Administrador</h1>
            <p className="cadastro-subtitle-center">
                Altere os dados necessários e clique em salvar
            </p>
            <div className="cadastro-card">
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* O formulário é praticamente idêntico ao de cadastro */}
                    <div className="cadastro-form-group">
                        <label htmlFor="nomeCompleto" className="cadastro-label">Nome Completo:</label>
                        <input type="text" id="nomeCompleto" {...register("nomeCompleto")} className="cadastro-input" />
                        {errors.nomeCompleto && <p className="cadastro-error">{errors.nomeCompleto.message}</p>}
                    </div>
                    <div className="cadastro-form-group">
                        <label htmlFor="email" className="cadastro-label">Email:</label>
                        <input type="email" id="email" {...register("email")} className="cadastro-input" />
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
                  maxLength="14" // Limita o tamanho do campo
                />
                {errors.cpf && <p className="cadastro-error">{errors.cpf.message}</p>}
              </div>
                    <div className="cadastro-form-group">
                        <label htmlFor="cargo" className="cadastro-label">Cargo:</label>
                        <select id="cargo" {...register("cargo")} className="cadastro-input">
                            <option value="">Selecione um cargo</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="ESTOQUISTA">ESTOQUISTA</option>
                        </select>
                        {errors.cargo && <p className="cadastro-error">{errors.cargo.message}</p>}
                    </div>

                    <div className="cadastro-form-group">
                        <label htmlFor="senha"  className="cadastro-label">Nova Senha (deixe em branco para não alterar):</label>
                        <input type="password" id="senha" {...register("senha")} className="cadastro-input" />
                        {errors.senha && <p className="cadastro-error">{errors.senha.message}</p>}
                    </div>

                    <div className="cadastro-form-group">
                        <label htmlFor="confirmarSenha"  className="cadastro-label">Confirmar Nova Senha:</label>
                        <input type="password" id="confirmarSenha" {...register("confirmarSenha")} className="cadastro-input" />
                        {errors.confirmarSenha && <p className="cadastro-error">{errors.confirmarSenha.message}</p>}
                    </div>
                    
                    {mensagemApi && <p style={{color: isError ? '#d32f2f' : '#27ae60', textAlign: 'center', marginTop: 12, fontWeight: 'bold'}}>{mensagemApi}</p>}
                    
                    <button type="submit" disabled={isSubmitting} className="cadastro-btn">
                        {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditAdminPage;