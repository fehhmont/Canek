// FrontEnd/src/pages/private/MeuPerfilPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../components/AuthContext';
// 1. IMPORTAR O NOVO ÍCONE
import { ArrowLeft, User, MapPin, Plus, X, ClipboardList, Package } from 'lucide-react';
import { buscarCep } from '../../utils/cepService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrderDetailsModal from '../../components/OrderDetailsModal';
import './css/MeuPerfilPage.css';

// ... (Schemas de validação permanecem os mesmos)
const profileSchema = yup.object().shape({
    nomeCompleto: yup.string().required('O nome completo é obrigatório'),
    dataNascimento: yup.string().required('Data de nascimento é obrigatória'),
    genero: yup.string().oneOf(['Masculino', 'Feminino', 'Outro'], 'Gênero inválido').required('Gênero é obrigatório'),
    novaSenha: yup.string()
        .transform(value => value || null)
        .nullable(),
    confirmarSenha: yup.string()
        .transform(value => value || null)
        .nullable()
        .when('novaSenha', (novaSenha, schema) => {
            return novaSenha[0]
                ? schema.required('A confirmação de senha é obrigatória').oneOf([yup.ref('novaSenha')], 'As senhas devem ser iguais')
                : schema;
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
    const [pedidos, setPedidos] = useState([]); // 2. ADICIONAR ESTADO PARA PEDIDOS
    const [loading, setLoading] = useState(true);
    const [mensagemApi, setMensagemApi] = useState("");
    const [isError, setIsError] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // ... (useForm hooks permanecem os mesmos)
    const { register: registerProfile, handleSubmit: handleSubmitProfile, reset: resetProfile, formState: { errors: errorsProfile, isSubmitting: isSubmittingProfile } } = useForm({ resolver: yupResolver(profileSchema) });
    const { register: registerAddress, handleSubmit: handleSubmitAddress, reset: resetAddress, setValue: setValueAddress, formState: { errors: errorsAddress } } = useForm({ resolver: yupResolver(newAddressSchema) });

    // 3. ATUALIZAR A FUNÇÃO DE BUSCA DE DADOS
    const fetchUserDataAndOrders = async () => {
        setLoading(true);
        setMensagemApi("");
        setIsError(false);
        
        const token = localStorage.getItem('userToken');
        if (!token) {
            logout();
            return;
        }

        try {
            // Promise.all para buscar dados do perfil E pedidos em paralelo
            const [perfilResponse, pedidosResponse] = await Promise.all([
                fetch(`http://localhost:8080/auth/usuario/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`http://localhost:8080/auth/pedidos/meus-pedidos`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            // Processar Perfil
            if (!perfilResponse.ok) {
                throw new Error('Falha ao buscar dados do perfil. Sua sessão pode ter expirado.');
            }
            const dataPerfil = await perfilResponse.json();
            setUserData(dataPerfil);
            resetProfile({
                nomeCompleto: dataPerfil.nomeCompleto || '',
                dataNascimento: dataPerfil.dataNascimento || '',
                genero: dataPerfil.genero || '',
                novaSenha: '',
                confirmarSenha: '',
            });

            // Processar Pedidos
            if (!pedidosResponse.ok) {
                throw new Error('Falha ao buscar histórico de pedidos.');
            }
            const dataPedidos = await pedidosResponse.json();
            // Ordena os pedidos do mais recente para o mais antigo
            dataPedidos.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
            setPedidos(dataPedidos);

        } catch (error) {
            setMensagemApi(error.message);
            setIsError(true);
            if (error.message.includes("perfil")) {
                setTimeout(logout, 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    // 4. ATUALIZAR O useEffect
    useEffect(() => {
        fetchUserDataAndOrders();
    }, []); // Dependência vazia, roda apenas uma vez

    // ... (onSubmitProfile, onSearchCep, onSubmitAddress, handleSetPrincipal, formatCep permanecem os mesmos)
    const onSubmitProfile = async (data) => {
        setMensagemApi("");
        setIsError(false);

        if (!userData || !userData.id) {
            setMensagemApi("Erro: Não foi possível identificar o usuário. Tente recarregar a página.");
            setIsError(true);
            return;
        }

        const payload = {
            nomeCompleto: data.nomeCompleto,
            dataNascimento: data.dataNascimento,
            genero: data.genero,
            novaSenha: (data.novaSenha && data.novaSenha.length > 0) ? data.novaSenha : null,
        };

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:8080/auth/usuario/atualizar/${userData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMensagemApi("Perfil atualizado com sucesso!");
                setIsError(false);
                resetProfile((prev) => ({ ...prev, novaSenha: '', confirmarSenha: '' }));
                fetchUserDataAndOrders(); // Recarrega os dados
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
        
        if (!userData || !userData.id) {
            setMensagemApi("Erro: Não foi possível identificar o usuário. Tente recarregar a página.");
            setIsError(true);
            setIsSubmittingAddress(false);
            return;
        }

        const payload = { ...data, cep: data.cep.replace(/\D/g, '') };

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:8080/auth/usuario/${userData.id}/enderecos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMensagemApi("Novo endereço de entrega adicionado com sucesso!");
                setIsError(false);
                resetAddress({ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', principal: false });
                setIsAddingAddress(false);
                fetchUserDataAndOrders(); // Recarrega os dados
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
        if (!userData || !userData.id) return;
        setMensagemApi("");
        setIsError(false);

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:8080/auth/usuario/${userData.id}/enderecos/${enderecoId}/principal`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setMensagemApi("Endereço definido como padrão para entrega.");
                setIsError(false);
                fetchUserDataAndOrders(); // Recarrega os dados
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

    // 5. FUNÇÕES AUXILIARES PARA FORMATAÇÃO
    const formatStatus = (status) => {
        const statusMap = {
            'AGUARDANDO_PAGAMENTO': 'Aguardando Pagamento',
            'PAGO': 'Pagamento Aprovado',
            'CANCELADO': 'Cancelado',
            'ENVIADO': 'Enviado',
            'ENTREGUE': 'Entregue'
        };
        return statusMap[status] || status;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    
    if (loading && !userData) { // Ajuste na lógica de loading
        return <div className="perfil-bg"><LoadingSpinner message="Carregando seu perfil..." /></div>;
    }
    
    const faturamentoAddress = userData?.enderecos?.find(e => e.tipoEndereco === 'FATURAMENTO');
    const entregaAddresses = userData?.enderecos?.filter(e => e.tipoEndereco === 'ENTREGA');

    return (
        <div className="perfil-bg">
            <div className="perfil-header">
                <button className="perfil-back-btn" onClick={() => navigate("/")} title="Voltar">
                    <ArrowLeft size={28} />
                </button>
                <h1 className="perfil-title-big">Minha Conta</h1>
                <button onClick={logout} className="perfil-logout-btn">Sair</button>
            </div>
            
            {/* Mensagem de API global, se houver */}
            {mensagemApi && (
                <p className={`api-message-global ${isError ? 'error' : 'success'}`}>{mensagemApi}</p>
            )}

            <div className="perfil-card-container">
                {/* Card de Dados Pessoais (Sem alteração) */}
                <div className="perfil-card">
                    <h2 className="card-title"><User size={20} /> Dados Pessoais e Acesso</h2>
                    <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
                        {/* ... (formulário de perfil existente) ... */}
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
                        <button type="submit" disabled={isSubmittingProfile} className="perfil-btn-primary">
                            {isSubmittingProfile ? "Salvando..." : "Salvar Dados Pessoais"}
                        </button>
                    </form>
                </div>

                {/* --- 6. NOVO CARD DE PEDIDOS --- */}
                <div className="perfil-card">
                    <h2 className="card-title"><ClipboardList size={20} /> Meus Pedidos</h2>
                    <div className="pedidos-list">
                        {loading && !pedidos.length && <p>Carregando pedidos...</p>}
                        {!loading && pedidos.length === 0 && (
                            <p className="text-muted">Você ainda não fez nenhum pedido.</p>
                        )}
                        {pedidos.length > 0 && (
                            <table className="pedidos-table">
                                <thead>
                                    <tr>
                                        <th>Pedido</th>
                                        <th>Data</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidos.map((pedido) => (
                                        <tr key={pedido.id}>
                                            <td data-label="Pedido">#{pedido.numeroPedido}</td>
                                            <td data-label="Data">{formatDate(pedido.dataCriacao)}</td>
                                            <td data-label="Status">
                                                <span className={`status-badge status-${pedido.status}`}>
                                                    {formatStatus(pedido.status)}
                                                </span>
                                            </td>
                                            <td data-label="Total">R$ {pedido.valorTotal.toFixed(2).replace('.', ',')}</td>
                                            <td data-label="Ações">
                                                <button className="btn-detalhes" onClick={() => setSelectedOrder(pedido)}>
    <Package size={16} /> Detalhes
</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Card de Endereços (Sem alteração) */}
                <div className="perfil-card">
                    <h2 className="card-title"><MapPin size={20} /> Endereços</h2>
                    {/* ... (todo o JSX de endereços existente) ... */}
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
                    <div className="address-section">
                        <div className="address-list-header">
                            <h4>Endereços de Entrega</h4>
                            <button onClick={() => setIsAddingAddress(prev => !prev)} className="btn-add-address">
                                {isAddingAddress ? <X size={16} /> : <Plus size={16} />}
                                {isAddingAddress ? "Cancelar" : "Adicionar Novo"}
                            </button>
                        </div>
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
                                        <button type="submit" disabled={isSubmittingAddress} className="perfil-btn-primary small">
                                            {isSubmittingAddress ? "Adicionando..." : "Adicionar Endereço"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
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
                {selectedOrder && (
    <OrderDetailsModal 
        pedido={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
    />
)}
            </div>
        </div>
    );
}

export default MeuPerfilPage;