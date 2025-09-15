import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AdminRoute = () => {
    const { isAuthenticated, user, loading } = useAuth(); // <-- 1. Obter o estado de loading

    // 2. Se estiver carregando, exibe uma mensagem ou componente de loading
    if (loading) {
        return <div>Carregando...</div>; // Ou um spinner/componente de sua preferência
    }

    // 3. Após o carregamento, executa a lógica de verificação
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const isAdminOrStocker = user?.cargo === 'ADMIN' || user?.cargo === 'ESTOQUISTA';

    return isAdminOrStocker ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;