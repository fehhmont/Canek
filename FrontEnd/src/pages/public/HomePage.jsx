import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header.jsx';
import { useCart } from '../../components/CartContext.jsx';
import './css/HomePage.css';

const placeholderImage = "https://via.placeholder.com/300x300.png/000000/FFFFFF?text=Imagem+Indisponivel";

function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:8080/auth/produto/listarTodosAtivos/true?status=true");
                if (!response.ok) {
                    throw new Error('Falha ao buscar produtos do servidor.');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 6;
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const formatProductForCard = (product) => {
        const principalImage = product.imagens?.find(img => img.principal) || product.imagens?.[0];
        const imageUrl = principalImage 
            ? `http://localhost:8080${principalImage.caminhoImagem}` 
            : placeholderImage;

        return {
            id: product.id,
            name: product.nome,
            price: product.preco,
            image: imageUrl,
            description: product.descricao,
            rating: product.avaliacao
        };
    };

    function handleComprar(cardProduct) {
        addToCart({
            id: cardProduct.id,
            name: cardProduct.name,
            price: cardProduct.price,
        });
        navigate('/carrinho');
    }

    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <section className="customize-section">
                    <h2 className="customize-title">Personalize sua caneca</h2>
                    <p className="customize-description">
                        Crie algo único e especial. Use sua imaginação e personalize sua caneca do seu jeito!
                    </p>
                    <Link to="/customize">
                        <button className="customize-button">
                            Personalize sua caneca
                        </button>
                    </Link>
                </section>

                <div className="section-header">
                    <h2 className="section-title">Nossa Coleção de Canecas</h2>
                    <p className="section-description">
                        Encontre a caneca perfeita para cada momento. Qualidade premium,
                        designs únicos e entrega rápida.
                    </p>
                </div>

                {loading && <p style={{ textAlign: 'center' }}>Carregando produtos...</p>}
                {error && <p style={{ color: 'red', textAlign: 'center' }}>Erro: {error}</p>}
                
                {!loading && !error && (
                    <>
                        <div className="product-grid">
                            {currentProducts.map((product) => {
                                const cardProduct = formatProductForCard(product);
                                return (
                                    <div key={cardProduct.id} className="product-card">
                                        <img src={cardProduct.image} alt={cardProduct.name} className="product-card-img" />
                                        <h3 className="product-card-title">{cardProduct.name}</h3>
                                        <p className="product-card-price">R$ {cardProduct.price.toFixed(2).replace('.', ',')}</p>
                                        <p className="product-card-desc">{cardProduct.description}</p>
                                        <Link to={`/produto/${cardProduct.id}`}>
                                            <button className="product-detail-btn">Detalhe</button>
                                        </Link>
                                        <button className="product-buy-btn" onClick={() => handleComprar(cardProduct)}>
                                            Comprar
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {products.length > productsPerPage && (
                            <div className="pagination-controls">
                                <button onClick={goToPrevPage} disabled={currentPage === 1}>
                                    Anterior
                                </button>
                                <span>Página {currentPage} de {totalPages}</span>
                                <button onClick={goToNextPage} disabled={currentPage === totalPages}>
                                    Próxima
                                </button>
                            </div>
                        )}
                    </>
                )}
                
                <footer className="footer">
                    <div className="footer-content">
                        <h3 className="footer-title">
                            CaneK - Sua loja de canecas online
                        </h3>
                        <div className="footer-features">
                            <span>Entrega rápida</span>
                            <span className="footer-separator">•</span>
                            <span>Qualidade garantida</span>
                            <span className="footer-separator">•</span>
                            <span>Suporte 24h</span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}

export default HomePage;