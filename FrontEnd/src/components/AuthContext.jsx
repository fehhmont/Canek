import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Cria o Contexto
const AuthContext = createContext(null);

// 2. Cria o Componente Provedor
export const AuthProvider = ({ children }) => {
    // Agora, em vez de um simples booleano, o estado pode guardar mais informações do usuário
    const [user, setUser] = useState(null); 
    const navigate = useNavigate();

    // Este `useEffect` verifica se já existem dados do usuário no localStorage 
    // para manter a sessão ativa ao recarregar a página.
    useEffect(() => {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            // Se encontrou dados, transforma de string para objeto e atualiza o estado
            setUser(JSON.parse(storedUser));
        }
    }, []);

    /**
     * Função para realizar o login.
     * Agora ela recebe um objeto 'userData' que deve conter o token e outras informações.
     * Ex: { token: 'seu-token-jwt', tipoUsuario: 'ADMINISTRADOR', cargo: 'GERENTE_DE_VENDAS' }
     */
    const login = (userData) => {
        // Salva os dados do usuário (convertidos para string) no localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        // Atualiza o estado global com todas as informações do usuário
        setUser(userData);

        // O redirecionamento pode agora usar tanto o tipoUsuario quanto o cargo
        const { tipoUsuario, cargo } = userData;

        switch (userData) {
            case 'ADMINISTRADOR':
                // Você pode ter lógicas mais complexas aqui usando o cargo
                 navigate("/UserManagementPage");
                break;
            
            case 'cliente':
                navigate("/"); // Redireciona clientes para a HomePage
                break;
            
            case 'ESTOQUISTA':
                navigate("/UserManagementPage"); // Exemplo para estoquista
                break;
                
            default:
                // Se o tipo for desconhecido, envia para a página inicial por segurança
                navigate("/");
                break;
        }
    };

    // Função para realizar o logout
    const logout = () => {
        // Remove todos os dados do usuário do localStorage
        localStorage.removeItem('userData');
        // Limpa o estado global do usuário
        setUser(null);
        // Redireciona o usuário para a página inicial/login
        navigate('/');
    };

    // O objeto 'value' agora disponibiliza mais informações para a aplicação.
    // O 'isAuthenticated' agora é uma verificação derivada: !!user (true se user não for nulo)
    const value = {
        isAuthenticated: !!user, // Um atalho para saber se o usuário está logado
        user,                     // O objeto completo do usuário (com tipo, cargo, etc.)
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Hook customizado (continua o mesmo)
// Este hook `useAuth` facilita o acesso ao contexto em outros componentes.
export const useAuth = () => {
    return useContext(AuthContext);
};