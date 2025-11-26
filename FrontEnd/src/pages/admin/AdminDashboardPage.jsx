// Arquivo: src/pages/admin/AdminDashboardPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { Box, Users, ClipboardList, ChevronRight } from 'lucide-react';
import './css/AdminDashboardPage.css';

function AdminDashboardPage() {
    // Busca os dados do usuário logado (nome, cargo, etc.)
    const { user } = useAuth();
    
    // Extrai o primeiro nome para uma saudação mais pessoal
    const firstName = user?.nomeCompleto?.split(' ')[0] || 'Admin';

    // Verifica se o usuário é um Administrador
    const isAdmin = user?.cargo === 'ADMIN';

    return (
        <>
            {/* Elementos de fundo que ocupam a tela inteira */}
            <div className="bg-pattern"></div>
            <div className="bg-gradient"></div>
            
            <div className="dashboard-container">
                <main className="dashboard-content">
                    {/* Seção de Boas-vindas */}
                    <div className="welcome-section">
                        <h1 className="welcome-title">
                            Bem-vindo, <span className="highlight">{firstName}</span>!
                        </h1>
                        <p className="welcome-subtitle">O que você gostaria de fazer hoje?</p>
                    </div>

                    {/* Seção de Ações */}
                    <div className="actions-section">
                        <div className="button-container">
                            
                            {/* Botão para Gerenciar Usuários (SÓ APARECE PARA ADMIN) */}
                            {isAdmin && (
                                <Link to="/UserManagementPage" className="nav-button users-btn">
                                    <div className="button-icon">
                                        <Users size={24} />
                                    </div>
                                    <div className="button-content">
                                        <span className="button-title">Gerenciar Admins</span>
                                        <span className="button-description">Administre contas e permissões</span>
                                    </div>
                                    <div className="button-arrow">
                                        <ChevronRight size={20} />
                                    </div>
                                </Link>
                            )}
                            
                            {/* Botão para Gerenciar Produtos */}
                            <Link to="/GerenciarProductPage" className="nav-button products-btn">
                                <div className="button-icon">
                                    <Box size={24} />
                                </div>
                                <div className="button-content">
                                    <span className="button-title">Gerenciar Produtos</span>
                                    <span className="button-description">Visualize e edite seu catálogo</span>
                                </div>
                                <div className="button-arrow">
                                    <ChevronRight size={20} />
                                </div>
                                
                            </Link>
                            
                            {/* Botão para Listar Pedidos */}
                            <Link to="/" className="nav-button orders-btn">
                                <div className="button-icon">
                                    <ClipboardList size={24} />
                                </div>
                                <div className="button-content">
                                     <span className="button-title">Listar Pedidos</span>
                                     <span className="button-description">Monitore vendas e entregas</span>
                                </div>
                                <div className="button-arrow">
                                    <ChevronRight size={20} />
                                </div>
                            </Link>

                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default AdminDashboardPage;