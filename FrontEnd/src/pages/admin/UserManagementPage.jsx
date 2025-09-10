// Arquivo: src/pages/admin/UserManagementPage.jsx (CORRIGIDO)

import React, { useState, useEffect } from "react";
// CORREÇÃO 1: Adicionar ToggleLeft e ToggleRight à importação
import { ArrowLeft, Users, Plus, Search, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
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
                if (!token) throw new Error("Token não encontrado.");

                const response = await fetch("http://localhost:8080/auth/administrador/findAll", {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Falha ao buscar usuários.');

                const dataFromApi = await response.json();

                // CORREÇÃO 2: Simplificar a formatação dos dados
                const formattedUsers = dataFromApi.map(user => ({
                    id: user.id,
                    name: user.nomeCompleto,
                    email: user.email,
                    role: user.tipoUsuarioOuCargo.charAt(0).toUpperCase() + user.tipoUsuarioOuCargo.slice(1).toLowerCase(),
                    // Manter o campo 'ativo' como booleano (true/false)
                    ativo: user.status, 
                    lastLogin: new Date(user.dataCadastro).toLocaleDateString('pt-BR')
                }));
                setUsers(formattedUsers);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleToggleStatus = async (userId, currentStatus) => {
        if (!window.confirm(`Deseja ${currentStatus ? "inativar" : "ativar"} este administrador?`)) return;

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:8080/auth/administrador/${userId}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Falha ao alterar o status.");

            setUsers(users.map(u => u.id === userId ? { ...u, ativo: !u.ativo } : u));
        } catch (err) {
            setError(err.message);
        }
    };
    
    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        navigate('/');
    };

    // CORREÇÃO 3: Esta função agora recebe o booleano 'ativo' diretamente
    const getStatusClass = (ativo) => (ativo ? 'status-active' : 'status-inactive');

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="page-container"><div className="card"><p>Carregando...</p></div></div>;
    if (error) return <div className="page-container"><div className="card"><p style={{ color: 'red' }}>Erro: {error}</p></div></div>;

    return (
        <div className="page-container">
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <div className="header-content">
                            <button onClick={() => navigate(-1)} className="back-button"><ArrowLeft className="icon-sm" /></button>
                            <div className="header-title"><Users className="icon-md primary-color" /><h1 className="page-title">Gerenciamento de Admins</h1></div>
                            <button onClick={handleLogout}>Sair</button>
                            <button className="btn-primary"><Plus className="icon-sm" /> Adicionar Admin</button>
                        </div>
                    </div>
                    <div className="card-content">
                        <div className="search-section">
                            <div className="search-container">
                                <Search className="search-icon" />
                                <input type="text" placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                            </div>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>NOME</th><th>EMAIL</th><th>PERFIL</th><th>STATUS</th><th>DATA DE CADASTRO</th><th>AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="font-medium">{user.name}</td>
                                            <td className="text-gray">{user.email}</td>
                                            <td className="text-gray">{user.role}</td>
                                            {/* CORREÇÃO 4: A lógica de exibição agora está correta */}
                                            <td><span className={`status-badge ${getStatusClass(user.ativo)}`}>{user.ativo ? 'Ativo' : 'Inativo'}</span></td>
                                            <td className="text-gray">{user.lastLogin}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="action-btn view" title="Visualizar"><Eye className="icon-xs" /></button>
                                                    <button className="action-btn edit" title="Editar"><Edit className="icon-xs" /></button>
                                                    <button onClick={() => handleToggleStatus(user.id, user.ativo)} className={`action-btn ${user.ativo ? 'delete' : 'edit'}`} title={user.ativo ? 'Inativar' : 'Ativar'}>
                                                        {user.ativo ? <ToggleLeft className="icon-xs" /> : <ToggleRight className="icon-xs" />}
                                                    </button>
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