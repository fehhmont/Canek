import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../components/AuthContext';
import { ArrowLeft, User, MapPin, Plus, X } from 'lucide-react';
import { buscarCep } from '../../utils/cepService'; 
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './css/MeuPerfilPage.css'; 

// --- SCHEMAS (permanecem os mesmos) ---
const profileSchema = yup.object().shape({
    nomeCompleto: yup.string().required('O nome completo é obrigatório'),
    dataNascimento: yup.string().required('Data de nascimento é obrigatória'), // Alterado para string para simplicidade
    genero: yup.string().oneOf(['Masculino', 'Feminino', 'Outro'], 'Gênero inválido').required('Gênero é obrigatório'),
    novaSenha: yup.string().nullable().notRequired().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
    confirmarSenha: yup.string().nullable().when('novaSenha', {
        is: (val) => val && val.length > 0,
        then: (schema) => schema.oneOf([yup.ref('novaSenha')], 'As senhas devem ser iguais').required('Confirmação de senha é obrigatória'),
        otherwise: (schema) => schema.notRequired(),
    }),
});

const newAddressSchema = yup.object().shape({
    cep: yup.string().required('CEP é obrigatório'),
    logradouro: yup.string().required('Logradouro é obrigatório'),
    numero: yup.string().required('Número é obrigatório'),
    complemento: yup.string().nullable().optional(),
    bairro: yup.string().required('Bairro é obrigatório'),
    cidade: yup.string().required('Cidade é obrigatória'),
    uf: yup.string().required('UF é obrigatória'),
    principal: yup.boolean().optional(),
});

function MeuPerfilPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mensagemApi, setMensagemApi] = useState("");
    const [isError, setIsError] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

    const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, formState: { errors: errorsProfile, isSubmitting: isSubmittingProfile } } = useForm({ resolver: yupResolver(profileSchema) });
    const { register: registerAddress, handleSubmit: handleSubmitAddress, reset: resetAddress, setValue: setValueAddress, formState: { errors: errorsAddress } } = useForm({ resolver: yupResolver(newAddressSchema) });

    // ATUALIZADO: Função para buscar dados do usuário
    const fetchUserData = async () => {
        setLoading(true);
        const token = localStorage.getItem('userToken');
        if (!token) {
            logout(); // Se não há token, desloga
            return;
        }

        try {
            // Chama o novo endpoint que não precisa de ID
            const response = await fetch(`http://localhost:8080/auth/usuario/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar dados do perfil. Sua sessão pode ter expirado.');
            }

            const data = await response.json();
            setUserData(data);

            resetProfile({
                nomeCompleto: data.nomeCompleto || '',
                dataNascimento: data.dataNascimento || '', 
                genero: data.genero || '',
                novaSenha: '',
                confirmarSenha: '',
            });

        } catch (error) {
            setMensagemApi(error.message);
            setIsError(true);
            // Se houver erro (ex: token inválido), desloga o usuário
            setTimeout(logout, 3000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []); // Executa apenas uma vez ao montar o componente

    // ... (o restante do seu componente, como onSubmitProfile, onSearchCep, etc., permanece igual) ...

    // RESTANTE DO COMPONENTE...
    const onSubmitProfile = async (data) => {
        setMensagemApi("");
        setIsError(false);

        const payload = {
            nomeCompleto: data.nomeCompleto,
            dataNascimento: data.dataNascimento,
            genero: data.genero,
            novaSenha: data.novaSenha || null,
        };

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:8080/auth/usuario/atualizar/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMensagemApi("Perfil atualizado com sucesso!");
                setIsError(false);
                resetProfile((prev) => ({ ...prev, novaSenha: '', confirmarSenha: '' }));
                fetchUserData(); // Re-busca os dados para atualizar a tela
            } else {
                const erroTexto = await response.text();
                setMensagemApi(erroTexto || "Erro ao atualizar perfil.");
                setIsError(true);
            }
        } catch (error) {
            setMensagemApi("Falha na conexão com o servidor.");
            setIsError(true);
        }
    };

    const onSearchCep = async (e) => {
        const cep = e.target.value;
        try {
            const { logradouro, bairro, localidade, uf } = await buscarCep(cep);
            setValueAddress('logradouro', logradouro || '');
            setValueAddress('bairro', bairro || '');
            setValueAddress('cidade', localidade || '');
            setValueAddress('uf', uf || '');
        } catch (err) {
            // Limpa os campos se o CEP for inválido
            setValueAddress('logradouro', '');
            setValueAddress('bairro', '');
            setValueAddress('cidade', '');
            setValueAddress('uf', '');
            console.error("Erro ao buscar CEP:", err);
        }
    };

    const onSubmitAddress = async (data) => {
        setMensagemApi("");
        setIsError(false);
        setIsSubmittingAddress(true);

        const payload = { ...data, cep: data.cep.replace(/\D/g, '') };

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:8080/auth/usuario/${user.id}/enderecos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMensagemApi("Novo endereço de entrega adicionado com sucesso!");
                setIsError(false);
                resetAddress({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', principal: false });
                setIsAddingAddress(false);
                fetchUserData();
            } else {
                const erroTexto = await response.text();
                setMensagemApi(erroTexto || "Erro ao adicionar endereço.");
                setIsError(true);
            }
        } catch (error) {
            setMensagemApi("Falha na conexão com o servidor.");
            setIsError(true);
        } finally {
            setIsSubmittingAddress(false);
        }
    };
    
    const handleSetPrincipal = async (enderecoId) => {
        setMensagemApi("");
        setIsError(false);

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:8080/auth/usuario/${user.id}/enderecos/${enderecoId}/principal`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMensagemApi("Endereço definido como padrão para entrega.");
                setIsError(false);
                fetchUserData();
            } else {
                const erroTexto = await response.text();
                setMensagemApi(erroTexto || "Erro ao definir endereço padrão.");
                setIsError(true);
            }
        } catch (error) {
            setMensagemApi("Falha na conexão com o servidor.");
            setIsError(true);
        }
    };

    const formatCep = (cep) => {
        const raw = String(cep).replace(/\D/g, '');
        return raw.length === 8 ? raw.replace(/^(\d{5})(\d{3})$/, '$1-$2') : cep;
    };
    
    if (loading) {
        return <div className="perfil-bg"><LoadingSpinner message="Carregando seu perfil..." /></div>;
    }
    
    // Filtra e separa os endereços
    const faturamentoAddress = userData?.enderecos?.find(e => e.tipoEndereco === 'FATURAMENTO');
    const entregaAddresses = userData?.enderecos?.filter(e => e.tipoEndereco === 'ENTREGA');

    return (
        <div className="perfil-bg">
            <div className="perfil-header">
                <button className="perfil-back-btn" onClick={() => navigate("/")} title="Voltar">
                    <ArrowLeft size={28} />
                </button>
                <h1 className="perfil-title-big">Meu Perfil</h1>
                <button onClick={logout} className="perfil-logout-btn">Sair</button>
            </div>
            
            <div className="perfil-card-container">
                {/* Seção 1: Dados Pessoais e Senha */}
                <div className="perfil-card">
                    <h2 className="card-title"><User size={20} /> Dados Pessoais e Acesso</h2>
                    <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
                        
                        {/* Campos de Dados Pessoais */}
                        <div className="form-section-grid">
                            <div className="form-group">
                                <label className="perfil-label">Nome Completo</label>
                                <input type="text" {...registerProfile("nomeCompleto")} className="perfil-input" />
                                {errorsProfile.nomeCompleto && <p className="perfil-error">{errorsProfile.nomeCompleto.message}</p>}
                            </div>
                            <div className="form-group">
                                <label className="perfil-label">Data de Nascimento</label>
                                <input type="date" {...registerProfile("dataNascimento")} className="perfil-input" />
                                {errorsProfile.dataNascimento && <p className="perfil-error">{errorsProfile.dataNascimento.message}</p>}
                            </div>
                            <div className="form-group">
                                <label className="perfil-label">Gênero</label>
                                <select {...registerProfile('genero')} className="perfil-input">
                                    <option value="">Selecione</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Feminino">Feminino</option>
                                    <option value="Outro">Outro</option>
                                </select>
                                {errorsProfile.genero && <p className="perfil-error">{errorsProfile.genero.message}</p>}
                            </div>
                            
                            {/* Campos de Senha */}
                            <div className="form-group">
                                <label className="perfil-label">Nova Senha (opcional)</label>
                                <input type="password" {...registerProfile("novaSenha")} className="perfil-input" />
                                {errorsProfile.novaSenha && <p className="perfil-error">{errorsProfile.novaSenha.message}</p>}
                            </div>
                            <div className="form-group">
                                <label className="perfil-label">Confirmar Nova Senha</label>
                                <input type="password" {...registerProfile("confirmarSenha")} className="perfil-input" />
                                {errorsProfile.confirmarSenha && <p className="perfil-error">{errorsProfile.confirmarSenha.message}</p>}
                            </div>
                        </div>

                        {/* Mensagem da API */}
                        {mensagemApi && !isAddingAddress && (
                            <p className={`api-message ${isError ? 'error' : 'success'}`}>{mensagemApi}</p>
                        )}
                        
                        <button type="submit" disabled={isSubmittingProfile} className="perfil-btn-primary">
                            {isSubmittingProfile ? "Salvando..." : "Salvar Dados Pessoais"}
                        </button>
                    </form>
                </div>

                {/* Seção 2: Endereços */}
                <div className="perfil-card">
                    <h2 className="card-title"><MapPin size={20} /> Endereços</h2>
                    
                    {/* Endereço de Faturamento */}
                    <div className="address-section">
                        <h4>Endereço de Faturamento (Não Editável)</h4>
                        {faturamentoAddress ? (
                             <div className="address-card principal">
                                 <p className="address-line">CEP: {formatCep(faturamentoAddress.cep)}</p>
                                 <p className="address-line">{faturamentoAddress.logradouro}, {faturamentoAddress.numero} {faturamentoAddress.complemento}</p>
                                 <p className="address-line">{faturamentoAddress.bairro} - {faturamentoAddress.cidade}/{faturamentoAddress.estado}</p>
                                 <span className="badge">Faturamento</span>
                             </div>
                        ) : (<p className="text-muted">Endereço de faturamento não encontrado.</p>)}
                    </div>

                    {/* Endereços de Entrega */}
                    <div className="address-section">
                        <div className="address-list-header">
                            <h4>Endereços de Entrega</h4>
                            <button onClick={() => setIsAddingAddress(prev => !prev)} className="btn-add-address">
                                {isAddingAddress ? <X size={16} /> : <Plus size={16} />} 
                                {isAddingAddress ? "Cancelar" : "Adicionar Novo"}
                            </button>
                        </div>
                        
                        {/* Formulário de Adição de Endereço */}
                        {isAddingAddress && (
                            <div className="address-form-card">
                                <form onSubmit={handleSubmitAddress(onSubmitAddress)} className="form-section-grid">
                                    <div className="form-group">
                                        <label className="perfil-label">CEP</label>
                                        <input type="text" {...registerAddress('cep')} onBlur={onSearchCep} className="perfil-input" />
                                        {errorsAddress.cep && <p className="perfil-error">{errorsAddress.cep.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="perfil-label">Logradouro</label>
                                        <input type="text" {...registerAddress('logradouro')} className="perfil-input" />
                                        {errorsAddress.logradouro && <p className="perfil-error">{errorsAddress.logradouro.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="perfil-label">Número</label>
                                        <input type="text" {...registerAddress('numero')} className="perfil-input" />
                                        {errorsAddress.numero && <p className="perfil-error">{errorsAddress.numero.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="perfil-label">Complemento (Opcional)</label>
                                        <input type="text" {...registerAddress('complemento')} className="perfil-input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="perfil-label">Bairro</label>
                                        <input type="text" {...registerAddress('bairro')} className="perfil-input" />
                                        {errorsAddress.bairro && <p className="perfil-error">{errorsAddress.bairro.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label className="perfil-label">Cidade / UF</label>
                                        <div className="cidade-uf-group">
                                            <input type="text" {...registerAddress('cidade')} placeholder="Cidade" className="perfil-input" />
                                            <input type="text" {...registerAddress('uf')} placeholder="UF" className="perfil-input uf-input" maxLength={2} />
                                        </div>
                                        {errorsAddress.cidade && <p className="perfil-error">{errorsAddress.cidade.message}</p>}
                                        {errorsAddress.uf && <p className="perfil-error">{errorsAddress.uf.message}</p>}
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <input type="checkbox" id="principal" {...registerAddress('principal')} />
                                        <label htmlFor="principal" className="perfil-label">Endereço Padrão para Checkout</label>
                                    </div>
                                    <div className="form-group full-width">
                                        {mensagemApi && isAddingAddress && (
                                            <p className={`api-message ${isError ? 'error' : 'success'}`}>{mensagemApi}</p>
                                        )}
                                        <button type="submit" disabled={isSubmittingAddress} className="perfil-btn-primary small">
                                            {isSubmittingAddress ? "Adicionando..." : "Adicionar Endereço"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        {/* Lista de Endereços de Entrega */}
                        {entregaAddresses?.length > 0 ? (
                            <div className="address-list">
                                {entregaAddresses.map((addr) => (
                                    <div key={addr.id} className={`address-card ${addr.principal ? 'principal' : ''}`}>
                                        <div className="address-details">
                                            <p className="address-line">CEP: {formatCep(addr.cep)}</p>
                                            <p className="address-line">{addr.logradouro}, {addr.numero} {addr.complemento ? `(${addr.complemento})` : ''}</p>
                                            <p className="address-line">{addr.bairro} - {addr.cidade}/{addr.estado}</p>
                                        </div>
                                        <div className="address-actions">
                                            {addr.principal ? (
                                                <span className="badge">Padrão</span>
                                            ) : (
                                                <button onClick={() => handleSetPrincipal(addr.id)} className="btn-set-principal">
                                                    Definir como Padrão
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (!isAddingAddress && <p className="text-muted">Nenhum endereço de entrega cadastrado.</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MeuPerfilPage;