import React, { useState, useEffect } from "react";
import { ArrowLeft, Package, Plus, Search, Eye, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './css/GerenciarProductPage.css'; 
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductDetailModal from '../../components/ProductDetailModal'; // Importe o novo componente

function GerenciarProductPage() {
    const navigate = useNavigate();
    const [allProducts, setAllProducts] = useState([]); // Armazena todos os produtos com detalhes
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    // Estados para o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            try {
                const response = await fetch("http://localhost:8080/auth/produto/listar");
                if (!response.ok) throw new Error('Falha ao buscar produtos.');
                const dataFromApi = await response.json();
                setAllProducts(dataFromApi); // Armazena os dados completos
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Função para abrir o modal
    const handleViewProduct = (productId) => {
        const product = allProducts.find(p => p.id === productId);
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // Função para fechar o modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleToggleStatus = async (productId, currentStatus) => {
        if (!window.confirm(`Deseja ${currentStatus ? "inativar" : "ativar"} este produto?`)) return;
        
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:8080/auth/produto/${productId}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Falha ao alterar o status do produto.");

            setAllProducts(allProducts.map(p => p.id === productId ? { ...p, status: !p.status } : p));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        navigate('/');
    };

    const getStatusClass = (status) => (status ? 'status-active' : 'status-inactive');

    const filteredProducts = allProducts.filter(product =>
        (product.nome && product.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return (
            <div className="page-container">
                <div className="container">
                    <div className="card" style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <LoadingSpinner message="Buscando produtos..." />
                    </div>
                </div>
            </div>
        );
    }

    if (error) return <div className="page-container"><div className="card"><p style={{ color: 'red' }}>Erro: {error}</p></div></div>;

    return (
        <div className="page-container">
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <div className="header-content">
                            <button onClick={() => navigate(-1)} className="back-button"><ArrowLeft className="icon-sm" /></button>
                            <div className="header-title"><Package className="icon-md primary-color" /><h1 className="page-title">Gerenciamento de Produtos</h1></div>
                            <button onClick={handleLogout}>Sair</button>
                            <button onClick={() => navigate('/CadastroProductPage')} className="btn-primary">
                                <Plus className="icon-sm" /> Adicionar Produto
                            </button>
                        </div>
                    </div>
                    <div className="card-content">
                        <div className="search-section">
                            <div className="search-container">
                                <Search className="search-icon" />
                                <input type="text" placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                            </div>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th><th>NOME</th><th>QUANTIDADE</th><th>VALOR</th><th>STATUS</th><th>AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td className="font-medium">{product.id}</td>
                                            <td className="text-gray">{product.nome}</td>
                                            <td className="text-gray">{product.estoque}</td>
                                            <td className="text-gray">R$ {product.preco.toFixed(2)}</td>
                                            <td><span className={`status-badge ${getStatusClass(product.status)}`}>{product.status ? 'Ativo' : 'Inativo'}</span></td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button onClick={() => handleViewProduct(product.id)} className="action-btn view" title="Visualizar"><Eye className="icon-xs" /></button>
                                                    <button onClick={() => navigate(`/GerenciarProductPage/edit/${product.id}`)} className="action-btn edit" title="Editar">
                                                        <Edit className="icon-xs" />
                                                    </button>
                                                    <button onClick={() => handleToggleStatus(product.id, product.status)} className={`action-btn ${product.status ? 'delete' : 'edit'}`} title={product.status ? 'Inativar' : 'Ativar'}>
                                                        {product.status ? <ToggleLeft className="icon-xs" /> : <ToggleRight className="icon-xs" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="pagination">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => paginate(page)} className={currentPage === page ? 'active' : ''}>
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />}
        </div>
    );
}

export default GerenciarProductPage;