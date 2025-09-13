import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AdminRoute = () => {
    const { isAuthenticated, user } = useAuth();

    // 1. Verifica se o usuário está autenticado
    if (!isAuthenticated) {
        // Se não estiver, redireciona para a página inicial
        return <Navigate to="/" replace />;
    }

    // 2. Verifica se o usuário tem o cargo de ADMIN ou ESTOQUISTA
    const isAdminOrStocker = user?.cargo === 'ADMIN' || user?.cargo === 'ESTOQUISTA';

    // 3. Se for admin ou estoquista, permite o acesso à rota. Caso contrário, redireciona.
    return isAdminOrStocker ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;