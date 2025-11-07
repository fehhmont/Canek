// FrontEnd/src/components/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('userToken');
            const storedUser = localStorage.getItem('userData');
            if (storedToken && storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Falha ao carregar dados do usuário:", error);
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData) => {
        // --- CORREÇÃO APLICADA AQUI ---
        // Garante que tanto 'tipoUsuario' quanto 'cargo' sejam armazenados
        const userToStore = {
            token: userData.token,
            tipoUsuario: userData.tipoUsuario, // Para clientes
            id: userData.id,                 // Para clientes
            cargo: userData.cargo,           // Para administradores
            nomeCompleto: userData.nomeCompleto // Adicionado para saudação no dashboard
        };
        
        localStorage.setItem('userToken', userToStore.token);
        localStorage.setItem('userData', JSON.stringify(userToStore));
        setUser(userToStore);

        const role = userData.cargo || userData.tipoUsuario;

        switch (role) {
            case 'ADMIN':
            case 'ESTOQUISTA':
                navigate("/AdminDashboardPage");
                break;
            case 'cliente':
                navigate("/");
                break;
            default:
                navigate("/");
                break;
        }
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        setUser(null);
        navigate('/');
    };

    const value = {
        isAuthenticated: !!user,
        user,
        loading,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};