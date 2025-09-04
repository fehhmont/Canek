// Arquivo: src/pages/admin/UserManagementPage.jsx

import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './css/UserManagementPage.css';

function UserManagementPage() {
    const navigate = useNavigate();

    // 1. Estados para os dados, carregamento e erros
    const [users, setUsers] = useState([]); // Armazena a lista de usuários vinda da API
    const [loading, setLoading] = useState(true); // Controla a exibição da mensagem "Carregando..."
    const [error, setError] = useState(null); // Armazena mensagens de erro
    const [searchTerm, setSearchTerm] = useState('');

    // 2. useEffect para buscar os dados na API quando a página carrega
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) {
                    throw new Error("Token de autenticação не найден. Por favor, faça o login novamente.");
                }

                // Faz a chamada para a API usando o token de autorização
                const response = await fetch("http://localhost:8080/auth/findAll", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    // Se a resposta não for OK (ex: 403 Forbidden), lança um erro
                    throw new Error('Falha ao buscar usuários. Verifique suas permissões.');
                }

                const dataFromApi = await response.json();

                // 3. Mapeia os dados brutos da API para o formato que a nossa tabela precisa
                const formattedUsers = dataFromApi.map(user => ({
                    id: user.id,
                    name: user.nomeCompleto,
                    email: user.email,
                    // Capitaliza a primeira letra do tipo de usuário (ex: "admin" -> "Admin")
                    role: user.tipoUsuario.charAt(0).toUpperCase() + user.tipoUsuario.slice(1),
                    status: user.tipoUsuario === 'admin' ? 'Administrador' : 'Ativo', // Lógica de exemplo para o status
                    // Formata a data para o padrão brasileiro
                    lastLogin: new Date(user.dataCadastro).toLocaleDateString('pt-BR')
                }));

                setUsers(formattedUsers); // Guarda os usuários formatados no estado
            } catch (err) {
                setError(err.message); // Guarda a mensagem de erro no estado
            } finally {
                setLoading(false); // Garante que o estado de carregamento termine, com sucesso ou erro
            }
        };

        fetchUsers();
    }, []); // O array de dependências vazio [] faz com que o useEffect rode apenas uma vez, quando o componente é montado.

    // Função de logout (sem alterações)
    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/');
    };

    // Filtro (agora funciona com os dados da API)
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Função para classes de status (ajustada para usar o `role`)
    const getStatusClass = (role) => {
        if (role === 'Admin') return 'status-admin';
        return 'status-active'; // Para 'Cliente', 'Estoquista', etc.
    };

    // 4. Renderização condicional para feedback de carregamento e erro
    if (loading) {
        return <div className="page-container"><div className="card"><p>Carregando usuários...</p></div></div>;
    }

    if (error) {
        return <div className="page-container"><div className="card"><p style={{ color: 'red' }}>Erro: {error}</p></div></div>;
    }

    // JSX principal (a estrutura continua a mesma, mas agora os dados são dinâmicos)
    return (
        <div className="page-container">
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <div className="header-content">
                            <button onClick={() => navigate(-1)} className="back-button">
                                <ArrowLeft className="icon-sm" />
                            </button>
                            <div className="header-title">
                                <Users className="icon-md primary-color" />
                                <h1 className="page-title">Gerenciamento de Usuários</h1>
                            </div>
                            <button onClick={handleLogout}>Sair</button>
                            <button className="btn-primary">
                                <Plus className="icon-sm" /> Adicionar Usuário
                            </button>
                        </div>
                    </div>

                    <div className="card-content">
                        <div className="search-section">
                            <div className="search-container">
                                <Search className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>NOME</th>
                                        <th>EMAIL</th>
                                        <th>PERFIL</th>
                                        <th>STATUS</th>
                                        <th>DATA DE CADASTRO</th>
                                        <th>AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="font-medium">{user.name}</td>
                                            <td className="text-gray">{user.email}</td>
                                            <td className="text-gray">{user.role}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="text-gray">{user.lastLogin}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="action-btn view"><Eye className="icon-xs" /></button>
                                                    <button className="action-btn edit"><Edit className="icon-xs" /></button>
                                                    <button className="action-btn delete"><Trash2 className="icon-xs" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserManagementPage;