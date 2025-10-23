import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { cadastroSchema } from "../../utils/validationSchemas.js";
import { buscarCep as buscarCepService } from "../../utils/cepService.js";
import './css/CadastroPage.css';

const ArrowLeft = () => (
    <svg width="28" height="28" fill="none" stroke="#52658F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><polyline points="18 24 8 14 18 4" /></svg>
);

function CadastroPage() {
    const [mensagemApi, setMensagemApi] = useState("");
    const navigate = useNavigate();
    const [copiarFaturamento, setCopiarFaturamento] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm({
        resolver: yupResolver(cadastroSchema)
    });

    // CORREÇÃO 1: FUNÇÃO DE FORMATAÇÃO DE TELEFONE REINSERIDA
    const handleTelefoneChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '');

        let masked = '';
        if (digits.length > 0) masked = `(${digits.substring(0, 2)}`;
        if (digits.length > 2) masked += `) ${digits.substring(2, 7)}`;
        if (digits.length > 7) masked += `-${digits.substring(7, 11)}`;

        setValue('telefone', masked, { shouldValidate: true });
    };

    // CORREÇÃO 2: FUNÇÃO DE FORMATAÇÃO DE CPF REINSERIDA
    const handleCpfChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '');

        let masked = '';
        if (digits.length > 0) masked = digits.substring(0, 3);
        if (digits.length > 3) masked += `.${digits.substring(3, 6)}`;
        if (digits.length > 6) masked += `.${digits.substring(6, 9)}`;
        if (digits.length > 9) masked += `-${digits.substring(9, 11)}`;

        setValue('cpf', masked, { shouldValidate: true });
    };

    const handleCepBlur = async (event, fieldPrefix) => {
        const cep = event.target.value;
        try {
            const data = await buscarCepService(cep);
            setValue(`${fieldPrefix}.logradouro`, data.logradouro);
            setValue(`${fieldPrefix}.bairro`, data.bairro);
            setValue(`${fieldPrefix}.cidade`, data.localidade);
            setValue(`${fieldPrefix}.uf`, data.uf);
        } catch (error) {
            console.error(error.message);
        }
    };

    const onSubmit = async (data) => {
        setMensagemApi("");

        // CORREÇÃO APLICADA AQUI: Formata a data para AAAA-MM-DD
        const formattedDate = data.dataNascimento ? new Date(data.dataNascimento).toISOString().split('T')[0] : '';

        const dataToSend = {
            nomeCompleto: data.nomeCompleto,
            email: data.email,
            cpf: data.cpf.replace(/\D/g, ''),
            dataNascimento: formattedDate, // Usa a data formatada
            genero: data.genero,
            senha: data.senha,
            telefone: data.telefone ? data.telefone.replace(/\D/g, '') : '',
            copiarFaturamentoParaEntrega: copiarFaturamento,
            enderecoFaturamento: {
                ...data.enderecoFaturamento,
                cep: data.enderecoFaturamento.cep.replace(/\D/g, ''),
                principal: true
            },
            enderecosEntrega: copiarFaturamento || !data.enderecosEntrega?.[0]?.cep ? [] : [{
                ...data.enderecosEntrega[0],
                cep: data.enderecosEntrega[0].cep.replace(/\D/g, ''),
                principal: false
            }],
        };

        // O restante da lógica try/catch permanece igual...
        try {
            const response = await fetch("http://localhost:8080/auth/usuario/cadastrarUsuario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            const responseBody = await response.text(); // Pega a resposta como texto primeiro

            if (response.ok) {
                setMensagemApi("Cadastro realizado com sucesso! Redirecionando...");
                setTimeout(() => navigate("/LoginPage"), 2000);
            } else {
                // Tenta interpretar como JSON, se falhar, usa o texto puro
                try {
                    const errorJson = JSON.parse(responseBody);
                    // Verifica se a estrutura esperada com 'error' existe
                    if (errorJson && errorJson.error) {
                         setMensagemApi(errorJson.error);
                    } else {
                         // Se não tiver 'error', mostra a resposta inteira (ou uma mensagem padrão)
                         setMensagemApi(responseBody || "Ocorreu um erro ao cadastrar.");
                    }
                } catch (e) {
                     // Se não for JSON válido, mostra o texto da resposta
                    setMensagemApi(responseBody || "Ocorreu um erro ao cadastrar.");
                }
            }
        } catch (error) { // Captura erros de rede ou outros erros inesperados
             console.error("Erro na requisição:", error); // Loga o erro no console para depuração
            setMensagemApi("Não foi possível conectar ao servidor.");
        }
    };

    return (
        <div className="cadastro-bg">
            <button className="cadastro-back-btn" onClick={() => navigate("/login")} title="Voltar para login">
                <ArrowLeft />
            </button>
            <h1 className="cadastro-title-big">Crie sua Conta</h1>
            <p className="cadastro-subtitle-center">
                Preencha os campos abaixo para se registrar
            </p>
            <div className="cadastro-card">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <h3 className="form-section-title">Dados Pessoais</h3>
                    <div className="cadastro-form-grid">
                        <div className="cadastro-form-group">
                            <label htmlFor="nomeCompleto">Nome Completo</label>
                            <input id="nomeCompleto" {...register("nomeCompleto")} />
                            {errors.nomeCompleto && <p className="cadastro-error">{errors.nomeCompleto.message}</p>}
                        </div>
                        <div className="cadastro-form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" {...register("email")} />
                            {errors.email && <p className="cadastro-error">{errors.email.message}</p>}
                        </div>
                        {/* CORREÇÃO 3: onChange ADICIONADO AO CPF */}
                        <div className="cadastro-form-group">
                            <label htmlFor="cpf">CPF</label>
                            <input id="cpf" {...register("cpf")} onChange={handleCpfChange} maxLength="14" placeholder="000.000.000-00" />
                            {errors.cpf && <p className="cadastro-error">{errors.cpf.message}</p>}
                        </div>
                        <div className="cadastro-form-group">
                            <label htmlFor="dataNascimento">Data de Nascimento</label>
                            <input id="dataNascimento" type="date" {...register("dataNascimento")} />
                            {errors.dataNascimento && <p className="cadastro-error">{errors.dataNascimento.message}</p>}
                        </div>
                        <div className="cadastro-form-group">
                            <label htmlFor="genero">Gênero</label>
                            <select id="genero" {...register('genero')}>
                                <option value="">Selecione</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                            </select>
                            {errors.genero && <p className="cadastro-error">{errors.genero.message}</p>}
                        </div>
                        {/* CORREÇÃO 4: onChange ADICIONADO AO TELEFONE */}
                        <div className="cadastro-form-group">
                            <label htmlFor="telefone">Telefone</label>
                            <input id="telefone" {...register("telefone")} onChange={handleTelefoneChange} maxLength="15" placeholder="(99) 99999-9999"/>
                            {errors.telefone && <p className="cadastro-error">{errors.telefone.message}</p>}
                        </div>
                        <div className="cadastro-form-group">
                            <label htmlFor="senha">Senha</label>
                            <input id="senha" type="password" {...register("senha")} />
                            {errors.senha && <p className="cadastro-error">{errors.senha.message}</p>}
                        </div>
                        <div className="cadastro-form-group">
                            <label htmlFor="confirmarSenha">Confirmar Senha</label>
                            <input id="confirmarSenha" type="password" {...register("confirmarSenha")} />
                            {errors.confirmarSenha && <p className="cadastro-error">{errors.confirmarSenha.message}</p>}
                        </div>
                    </div>

                    <h3 className="form-section-title">Endereço de Faturamento</h3>
                    <div className="cadastro-form-grid">
                        <div className="cadastro-form-group">
                            <label>CEP</label>
                            <input {...register('enderecoFaturamento.cep')} onBlur={(e) => handleCepBlur(e, 'enderecoFaturamento')} />
                            {errors.enderecoFaturamento?.cep && <p className="cadastro-error">{errors.enderecoFaturamento.cep.message}</p>}
                        </div>
                        <div className="cadastro-form-group">
                            <label>Logradouro</label>
                            <input {...register('enderecoFaturamento.logradouro')} />
                            {errors.enderecoFaturamento?.logradouro && <p className="cadastro-error">{errors.enderecoFaturamento.logradouro.message}</p>}
                        </div>
                        <div className="cadastro-form-group">
                            <label>Número</label>
                            <input {...register('enderecoFaturamento.numero')} />
                            {errors.enderecoFaturamento?.numero && <p className="cadastro-error">{errors.enderecoFaturamento.numero.message}</p>}
                        </div>
                        <div className="cadastro-form-group">
                            <label>Complemento</label>
                            <input {...register('enderecoFaturamento.complemento')} />
                        </div>
                        <div className="cadastro-form-group">
                            <label>Bairro</label>
                            <input {...register('enderecoFaturamento.bairro')} />
                            {errors.enderecoFaturamento?.bairro && <p className="cadastro-error">{errors.enderecoFaturamento.bairro.message}</p>}
                        </div>
                        <div className="cadastro-form-group">
                            <label>Cidade</label>
                            <input {...register('enderecoFaturamento.cidade')} />
                            {errors.enderecoFaturamento?.cidade && <p className="cadastro-error">{errors.enderecoFaturamento.cidade.message}</p>}
                        </div>
                        <div className="cadastro-form-group">
                            <label>UF</label>
                            <input {...register('enderecoFaturamento.uf')} maxLength={2} />
                            {errors.enderecoFaturamento?.uf && <p className="cadastro-error">{errors.enderecoFaturamento.uf.message}</p>}
                        </div>
                    </div>

                    <div className="checkbox-group">
                        <input type="checkbox" id="copiarFaturamento" checked={copiarFaturamento} onChange={(e) => setCopiarFaturamento(e.target.checked)} />
                        <label htmlFor="copiarFaturamento">Usar o mesmo endereço para entrega</label>
                    </div>

                    {!copiarFaturamento && (
                        <>
                            <h3 className="form-section-title">Endereço de Entrega</h3>
                            <div className="cadastro-form-grid">
                                <div className="cadastro-form-group">
                                    <label>CEP</label>
                                    <input {...register('enderecosEntrega.0.cep')} onBlur={(e) => handleCepBlur(e, 'enderecosEntrega.0')} />
                                    {errors.enderecosEntrega?.[0]?.cep && <p className="cadastro-error">{errors.enderecosEntrega[0].cep.message}</p>}
                                </div>
                                <div className="cadastro-form-group">
                                    <label>Logradouro</label>
                                    <input {...register('enderecosEntrega.0.logradouro')} />
                                    {errors.enderecosEntrega?.[0]?.logradouro && <p className="cadastro-error">{errors.enderecosEntrega[0].logradouro.message}</p>}
                                </div>
                                <div className="cadastro-form-group">
                                    <label>Número</label>
                                    <input {...register('enderecosEntrega.0.numero')} />
                                    {errors.enderecosEntrega?.[0]?.numero && <p className="cadastro-error">{errors.enderecosEntrega[0].numero.message}</p>}
                                </div>
                                <div className="cadastro-form-group">
                                    <label>Complemento</label>
                                    <input {...register('enderecosEntrega.0.complemento')} />
                                </div>
                                <div className="cadastro-form-group">
                                    <label>Bairro</label>
                                    <input {...register('enderecosEntrega.0.bairro')} />
                                    {errors.enderecosEntrega?.[0]?.bairro && <p className="cadastro-error">{errors.enderecosEntrega[0].bairro.message}</p>}
                                </div>
                                <div className="cadastro-form-group">
                                    <label>Cidade</label>
                                    <input {...register('enderecosEntrega.0.cidade')} />
                                    {errors.enderecosEntrega?.[0]?.cidade && <p className="cadastro-error">{errors.enderecosEntrega[0].cidade.message}</p>}
                                </div>
                                <div className="cadastro-form-group">
                                    <label>UF</label>
                                    <input {...register('enderecosEntrega.0.uf')} maxLength={2} />
                                    {errors.enderecosEntrega?.[0]?.uf && <p className="cadastro-error">{errors.enderecosEntrega[0].uf.message}</p>}
                                </div>
                            </div>
                        </>
                    )}

                    {mensagemApi && <p style={{ color: '#52658F', textAlign: 'center', marginTop: 12 }}>{mensagemApi}</p>}
                    <button type="submit" disabled={isSubmitting} className="cadastro-btn">
                        {isSubmitting ? "Cadastrando..." : "Criar Conta"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CadastroPage;