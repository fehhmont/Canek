
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
import './css/MeuPerfilPage.css';
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


function pedidofinaL() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [pedidos, setPedidos] = useState([]); // 2. ADICIONAR ESTADO PARA PEDIDOS
    const [loading, setLoading] = useState(true);
    const [mensagemApi, setMensagemApi] = useState("");
    const [isError, setIsError] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

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
    
    



    // 5. FUNÇÕES AUXILIARES PARA FORMATAÇÃO

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
                                                <button className="btn-detalhes">
                                                    <Package size={16} />
                                                    Detalhes
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div> 
            </div>
        </div>
    );
}

export default pedidofinaL;