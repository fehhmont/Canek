import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('userToken');
        const storedUser = localStorage.getItem('userData');
        if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        // Armazena o token e os dados do usuário no localStorage
        localStorage.setItem('userToken', userData.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);

        // Define a "role" com base no 'cargo' (para admin) ou 'tipoUsuario' (para cliente)
        const role = userData.cargo || userData.tipoUsuario;

        // Redireciona com base na role
        switch (role) {
            case 'ADMIN':
            case 'ESTOQUISTA':
                navigate("/UserManagementPage");
                break;
            case 'cliente':
                navigate("/");
                break;
            default:
                // Se a role for desconhecida, redireciona para a home como padrão
                navigate("/");
                break;
        }
    };

    const logout = () => {
        // Limpa o localStorage e o estado
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        setUser(null);
        navigate('/');
    };

    const value = {
        isAuthenticated: !!user,
        user,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};