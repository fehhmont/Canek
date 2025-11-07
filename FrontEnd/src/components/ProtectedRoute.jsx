import React from "react";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext'; // <-- Importe o useAuth

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth(); // <-- Use o contexto

    if (loading) {
        return <div>Carregando...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;