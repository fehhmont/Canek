import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // <-- 1. Adicionar estado de loading
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
            // Limpa em caso de dados corrompidos
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            setUser(null);
        } finally {
            setLoading(false); // <-- 2. Finaliza o carregamento após a verificação
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('userToken', userData.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);

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
        loading, // <-- 3. Expor o estado de loading
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};