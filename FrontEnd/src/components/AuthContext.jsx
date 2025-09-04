import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Cria o Contexto
// O contexto é como um "armazém global" para o estado de autenticação.
const AuthContext = createContext(null);

// 2. Cria o Componente Provedor
// Este componente irá "envolver" sua aplicação, disponibilizando o estado e as funções de autenticação para todos os componentes filhos.
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Este `useEffect` é executado apenas uma vez, quando o aplicativo carrega.
    // Ele verifica se já existe um token no localStorage para manter o usuário logado entre as sessões.
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    // Função para realizar o login
    const login = (token, tipoUsuario) => {
        // Salva o token recebido da API no localStorage
        localStorage.setItem('userToken', token);
        // Atualiza o estado global para indicar que o usuário está autenticado
        setIsAuthenticated(true);

        // Redireciona o usuário com base no seu tipo, conforme definido na API
        switch (tipoUsuario) {
            case 'admin':
                navigate("/UserManagementPage");
                break;
            case 'cliente':
                navigate("/"); // Redireciona clientes para a HomePage
                break;
            case 'estoquista':
                navigate("/EstoquePage"); // Exemplo para estoquista
                break;
            default:
                // Se o tipo for desconhecido, envia para a página inicial por segurança
                navigate("/");
                break;
        }
    };

    // Função para realizar o logout
    const logout = () => {
        // Remove o token do localStorage
        localStorage.removeItem('userToken');
        // Atualiza o estado para indicar que o usuário não está mais autenticado
        setIsAuthenticated(false);
        // Redireciona o usuário para a página inicial/login
        navigate('/'); 
    };

    // Objeto contendo o estado e as funções que queremos disponibilizar para a aplicação
    const value = {
        isAuthenticated,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Cria um Hook customizado
// Este hook `useAuth` é um atalho para que outros componentes possam acessar facilmente o contexto
// sem precisar importar `useContext` e `AuthContext` toda vez.
export const useAuth = () => {
    return useContext(AuthContext);
};

