import React from "react";
import { Link } from "react-router-dom";

function Routers() {
    // Lista de todas as rotas extraídas do seu código
    const allRoutes = [
        { path: '/', name: 'Home' },
        { path: '/LoginPageBackOffice', name: 'Login BackOffice' },
        { path: '/LoginPage', name: 'Login Usuário' },
        { path: '/CadastroPage', name: 'Cadastro' },
        { path: '/minha-conta', name: 'Meu Perfil (Protegida)' }, // NOVA ROTA
        { path: '/DashboardPage', name: 'Dashboard (Protegida)' },
        { path: '/AdminDashboardPage', name: 'Dashboard Admin' },
        { path: '/UserManagementPage', name: 'Gerenciar Usuários' },
        { path: '/UserManagementPage/new', name: 'Novo Usuário (Admin)' },
        { path: '/UserManagementPage/edit/123', name: 'Editar Usuário (ID: 123)' },
        { path: '/GerenciarProductPage', name: 'Gerenciar Produtos' },
        { path: '/product/new', name: 'Novo Produto' },
        { path: '/product/edit/abc', name: 'Editar Produto (ID: abc)' },
        { path: '/pagina-invalida', name: 'Página Inválida (404)' }
      ];

    // CSS para estilizar a navegação e os botões
    const cssStyles = `
        .vertical-nav {
            display: flex;
            flex-direction: column;
            gap: 8px; /* Espaçamento entre os botões */
        }
        .nav-button {
            width: 100%;
            text-align: center;
            padding: 8px 12px;
            font-size: 0.875rem;
            background-color: #4f46e5;
            color: white;
            font-weight: 600;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            transition: all 0.2s ease-in-out;
            text-decoration: none; /* Remove o sublinhado padrão do link */
        }
        .nav-button:hover {
            background-color: #4338ca;
        }
    `;

    return (
        <>
            <style>{cssStyles}</style>
            <div className="p-4 bg-gray-100 rounded-lg shadow-inner">
                <h3 className="text-lg font-bold mb-3 text-gray-800">Navegação Completa:</h3>
                {/* A navegação agora usa a classe CSS personalizada 'vertical-nav' */}
                <nav className="vertical-nav">
                    {/* Mapeia a lista de rotas para criar um botão para cada uma */}
                    {allRoutes.map((route) => (
                        <Link
                            key={route.path}
                            to={route.path}
                            // O botão agora usa a classe CSS 'nav-button'
                            className="nav-button"
                        >
                            {route.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}

export default Routers;