// Arquivo: src/pages/admin/ProductManagementPage.jsx (NOME SUGERIDO)

import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Package, Plus, Search, Eye, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './css/UserManagementPage.css'; // Mantenha seu CSS ou renomeie se preferir
import LoadingSpinner from '../../components/common/LoadingSpinner';

function ProductManagementPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false); // Inicia como false
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Função para buscar produtos, agora separada para ser reutilizável
    const fetchProducts = useCallback(async (name) => {
        setLoading(true);
        setError(null);
        
        // Define o endpoint baseado no termo de pesquisa
        // **IMPORTANTE**: Ajuste o endpoint de "listarTodos" se for diferente
        const endpoint = name 
            ? `http://localhost:8080/auth/produto/listarPorNome/${name}` 
            : `http://localhost:8080/auth/produto/listarTodos`; // Endpoint para buscar todos

        try {
            const token = localStorage.getItem('userToken');
            if (!token) throw new Error("Token não encontrado.");

            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Falha ao buscar produtos.');
            
            const dataFromApi = await response.json();
            
            // **IMPORTANTE**: Ajuste os campos abaixo para corresponder à sua API de produto
            const formattedProducts = dataFromApi.map(product => ({
                id: product.id,
                name: product.nome, // Ex: 'nome' do produto
                category: product.categoria, // Ex: 'categoria' do produto
                price: product.preco, // Ex: 'preco' do produto
                stock: product.estoque, // Ex: 'estoque' do produto
                ativo: product.status, // Ex: 'status' do produto
            }));

            setProducts(formattedProducts);
        } catch (err) {
            setError(err.message);
            setProducts([]); // Limpa a lista em caso de erro
        } finally {
            setLoading(false);
        }
    }, []); // useCallback para evitar recriação da função

    // useEffect para buscar os dados (pesquisa com debounce)
    useEffect(() => {
        // Quando o componente monta, busca todos os produtos
        if (searchTerm.trim() === '') {
            fetchProducts(''); // Passa string vazia para buscar todos
            return;
        }

        // Configura o debounce para a pesquisa
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(searchTerm);
        }, 500); // Aguarda 500ms após o usuário parar de digitar

        // Função de limpeza: cancela o timeout anterior se o usuário continuar digitando
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchProducts]); // Executa quando searchTerm ou fetchProducts muda

    // --- Seus outros handlers (handleLogout, handleToggleStatus) iriam aqui ---
    // Você precisará adaptá-los para a lógica de 'produto' se necessário.
    
    // O resto do seu componente JSX, adaptado para produtos
    return (
        <div className="page-container">
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <div className="header-content">
                            <button onClick={() => navigate(-1)} className="back-button"><ArrowLeft className="icon-sm" /></button>
                            {/* Ícone e título alterados para Produtos */}
                            <div className="header-title"><Package className="icon-md primary-color" /><h1 className="page-title">Gerenciamento de Produtos</h1></div>
                            {/* Você pode adicionar o botão de logout de volta se precisar */}
                            <button onClick={() => navigate('/ProductManagementPage/new')} className="btn-primary">
                                <Plus className="icon-sm" /> Adicionar Produto
                            </button>
                        </div>
                    </div>
                    <div className="card-content">
                        <div className="search-section">
                            <div className="search-container">
                                <Search className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por nome do produto..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="search-input" 
                                />
                            </div>
                        </div>
                        <div className="table-container">
                            {loading ? (
                                <LoadingSpinner message="Buscando produtos..." />
                            ) : error ? (
                                <p style={{ color: 'red', textAlign: 'center' }}>Erro: {error}</p>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            {/* **IMPORTANTE**: Ajuste os cabeçalhos da tabela */}
                                            <th>NOME DO PRODUTO</th>
                                            <th>CATEGORIA</th>
                                            <th>PREÇO</th>
                                            <th>ESTOQUE</th>
                                            <th>STATUS</th>
                                            <th>AÇÕES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length > 0 ? products.map((product) => (
                                            <tr key={product.id}>
                                                {/* **IMPORTANTE**: Ajuste os dados das células */}
                                                <td className="font-medium">{product.name}</td>
                                                <td className="text-gray">{product.category}</td>
                                                <td className="text-gray">R$ {product.price?.toFixed(2)}</td>
                                                <td className="text-gray">{product.stock}</td>
                                                <td><span className={`status-badge ${product.ativo ? 'status-active' : 'status-inactive'}`}>{product.ativo ? 'Ativo' : 'Inativo'}</span></td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="action-btn view" title="Visualizar"><Eye className="icon-xs" /></button>
                                                        <button onClick={() => navigate(`/ProductManagementPage/edit/${product.id}`)} className="action-btn edit" title="Editar"><Edit className="icon-xs" /></button>
                                                        {/* Adapte o botão de status se necessário */}
                                                        {/* <button onClick={() => handleToggleStatus(product.id, product.ativo)} ... > */}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Nenhum produto encontrado.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductManagementPage;