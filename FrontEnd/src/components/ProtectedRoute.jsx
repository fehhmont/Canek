import React from "react";
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    
    // Pegar o token da sessao do localstorage
    const token = localStorage.getItem('userToken');

     //Verifica se o token existe
    // Se 'token' for nulo ou vazio, o usuário não está logado.
    const isAuthenticated = token ? true : false;

    // 3. Decide o que renderizar
    if (isAuthenticated) {
        // Se o usuário está autenticado, renderiza o componente filho da rota.
        // O <Outlet /> é um placeholder do React Router para o componente da rota aninhada.
        return <Outlet />;
    } else {
        // Se não estiver autenticado, redireciona para a página de login.
        // O `replace` impede que o usuário volte para a página protegida usando o botão "Voltar" do navegador.
        return <Navigate to="/" replace />;
    }


}

export default ProtectedRoute;