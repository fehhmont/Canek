import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
    const navigate = useNavigate();

    // Função para lidar com o logout
    const handleLogout = () => {
        // 1. Remove o token do localStorage
        localStorage.removeItem('userToken');

        // 2. Redireciona o usuário para a página de login
        navigate('/');
    };

    return(
        <div style={{ padding: '20px' }}>
            <h1>Tela Principal após o login</h1>
            <p>Você está em uma área segura do sistema.</p>
            <button
                onClick={handleLogout}>
                Sair (Logout)
            </button>
        </div>
    )
}

export default DashboardPage;