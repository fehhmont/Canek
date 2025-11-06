import React, { useState } from "react";
import './Header.css';
import { useCart } from '../../components/CartContext.jsx';
import { Search, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Link } from "react-router-dom";
import { useAuth } from '../AuthContext.jsx';

function Header() {
    const [searchTerm, setSearchTerm] = useState('');
    const { isAuthenticated, logout } = useAuth();
    const { cart } = useCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const onSearchChange = (value) => {
        setSearchTerm(value);
    };

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-content">
                    {/* Logo e Nome da Empresa */}
                    <div className="logo-section">
                        <div className="logo-icon">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <h1 className="logo-text">
                            CaneK
                        </h1>
                    </div>

                    {/* Barra de Pesquisa */}
                    <div className="search-section">
                        <div className="search-container">
                            <div className="search-icon">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="search-input"
                                placeholder="Pesquisar canecas..."
                            />
                        </div>
                    </div>

                    {/* Navegação e Carrinho */}
                    <div className="nav-section">
                        <nav className="navigation">
                            {isAuthenticated ? (
                                // Se o usuário ESTÁ logado
                                <>
                                    <Link to="/minha-conta" className="nav-button">Minha Conta</Link>
                                    <button onClick={logout} className="nav-button">Sair</button>
                                </>
                            ) : (
                                // Se o usuário NÃO ESTÁ logado
                                <>
                                    <Link to="/CadastroPage" className="nav-button">
                                        Crie sua conta
                                    </Link>
                                    <Link to="/LoginPageBackOffice" className="nav-button">
                                        Login BackOffice
                                    </Link>
                                    <Link to="/LoginPage" className="nav-button">
                                        Login
                                    </Link>
                                    <Link to="/Routers" className="nav-button">
                                        Rotas
                                    </Link>
                                    
                                </>
                            )}
                        </nav>
                        <Link to="/carrinho">
                        <button className="cart-button">
                            <ShoppingCart className="h-6 w-6" />
                            {totalItems > 0 && (
                                <span className="cart-badge">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;