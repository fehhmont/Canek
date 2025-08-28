import React, { useState } from "react"; // 1. Importe o useState
import './Header.css';
import { Search, User, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Link } from "react-router-dom";

function Header() {
    // 2. Declare as variáveis de estado com useState
    const [searchTerm, setSearchTerm] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0);

    // Defina a função para atualizar o termo de pesquisa
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
                            MugStore
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
                                value={searchTerm} // Use a variável de estado
                                onChange={(e) => onSearchChange(e.target.value)} // Use a função para atualizar o estado
                                className="search-input"
                                placeholder="Pesquisar canecas..."
                            />
                        </div>
                    </div>

                    {/* Menu de Usuário */}
                    <div className="nav-section">
                        <button className="nav-button">
                            Crie sua conta
                        </button>
                        <button className="nav-button">
                            Entre
                        </button>
                        <button className="nav-button">
                            Compras
                        </button>
                        <button className="cart-button">
                            <ShoppingCart className="h-6 w-6" />
                            {cartItemCount > 0 && ( // Use a variável de estado
                                <span className="cart-badge">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;