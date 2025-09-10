// Arquivo: src/pages/admin/UserManagementPage.jsx (CORRIGIDO)

import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './css/UserManagementPage.css';

function UserManagementPage() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) {
                    throw new Error("Token de autenticação не найден. Por favor, faça o login novamente.");
                }

                // Endpoint correto para buscar administradores
                const response = await fetch("http://localhost:8080/auth/administrador/findAll", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Falha ao buscar usuários. Verifique suas permissões.');
                }

                const dataFromApi = await response.json();

                // 3. Mapeia os dados brutos da API para o formato que a nossa tabela precisa
                const formattedUsers = dataFromApi.map(user => {
                    // CORREÇÃO: Usar 'tipoUsuarioOuCargo' em vez de 'cargo'
                    const role = user.tipoUsuarioOuCargo || ''; // Garante que role seja uma string
                    const roleFormatted = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

                    return {
                        id: user.id,
                        name: user.nomeCompleto,
                        email: user.email,
                        role: roleFormatted,
                        status: role === 'ADMIN' ? 'Administrador' : 'Ativo', // Lógica de status baseada na role
                        // CORREÇÃO: A propriedade correta é 'dataCadastro' (conforme DTO)
                        lastLogin: new Date(user.dataCadastro).toLocaleDateString('pt-BR')
                    };
                });

                setUsers(formattedUsers);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData'); // Limpar também os dados do usuário
        navigate('/');
    };

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusClass = (role) => {
        if (role === 'Admin') return 'status-admin';
        return 'status-active';
    };

    if (loading) {
        return <div className="page-container"><div className="card"><p>Carregando usuários...</p></div></div>;
    }

    if (error) {
        return <div className="page-container"><div className="card"><p style={{ color: 'red' }}>Erro: {error}</p></div></div>;
    }

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
                                                    {user.status}
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