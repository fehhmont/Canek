import React, { useState } from "react";
// Assumindo que você está usando a biblioteca 'lucide-react' para os ícones.
// Se for outra, basta ajustar a importação.
import { ArrowLeft, Users, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import './css/UserManagementPage.css';
import { useNavigate } from 'react-router-dom';

// Tipos de usuário e props (usando JSDoc para documentação)
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {'Ativo' | 'Inativo' | 'Administrador'} status
 * @property {string} lastLogin
 */

/**
 * @typedef {Object} UserManagementPageProps
 * @property {() => void} onBack
 * @property {() => void} onNewUser
 */

// O componente precisa receber as props definidas na interface
function UserManagementPage({ onBack, onNewUser }) {
    const navigate = useNavigate();

    // Função para lidar com o logout
    const handleLogout = () => {
        // 1. Remove o token do localStorage
        localStorage.removeItem('userToken');

        // 2. Redireciona o usuário para a página de login
        navigate('/');
    };
  const [searchTerm, setSearchTerm] = useState('');

  // Dados de exemplo (sem alterações)
  const users = [
    {
      id: '1',
      name: 'Marcos Silva',
      email: 'marcos.silva@mugstore.com',
      role: 'Admin',
      status: 'Administrador',
      lastLogin: '15/01/2025'
    },
    {
      id: '2',
      name: 'Mariana Lima',
      email: 'mariana.lima@mugstore.com',
      role: 'Operador',
      status: 'Ativo',
      lastLogin: '14/01/2025'
    },
    {
      id: '3',
      name: 'Roberto Silva',
      email: 'roberto.silva@mugstore.com',
      role: 'Vendedor',
      status: 'Ativo',
      lastLogin: '13/01/2025'
    }
  ];

  // Lógica de filtro (sem alterações)
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para classes de status (sem alterações)
  const getStatusClass = (status) => {
    switch (status) {
      case 'Administrador': return 'status-admin';
      case 'Ativo': return 'status-active';
      case 'Inativo': return 'status-inactive';
      default: return 'status-badge';
    }
  };

  // JSX (sem alterações na estrutura, apenas corrigido o uso das props)
  return (
    <div className="page-container">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <div className="header-content">
              <button onClick={onBack} className="back-button">
                <ArrowLeft className="icon-sm" />
              </button>
              <div className="header-title">
                <Users className="icon-md primary-color" />
                <h1 className="page-title">Gerenciamento de Usuários</h1>
              </div>
              <button
                onClick={handleLogout}>
                Sair (Logout)
            </button>
              <button onClick={onNewUser} className="btn-primary">
                <Plus className="icon-sm" />
                Adicionar Usuário
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
                    <th>ÚLTIMO ACESSO</th>
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
                        <span className={`status-badge ${getStatusClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="text-gray">{user.lastLogin}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view">
                            <Eye className="icon-xs" />
                          </button>
                          <button className="action-btn edit">
                            <Edit className="icon-xs" />
                          </button>
                          <button className="action-btn delete">
                            <Trash2 className="icon-xs" />
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