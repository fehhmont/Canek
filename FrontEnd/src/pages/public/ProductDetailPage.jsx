// Arquivo: FrontEnd/src/pages/public/ProductDetailPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../components/CartContext.jsx";
import MiniProductCard from "../../components/ProductCard/MiniProductCard.jsx";
import Header from "../../components/Header/Header.jsx";
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Importe os ícones
import './css/ProductDetailPage.css';

const placeholderImage = "https://via.placeholder.com/400x400.png/000000/FFFFFF?text=Imagem+Indisponivel";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Estado para o carrossel
  const { addToCart, openSideCart } = useCart(); // Pegando a função para abrir o carrinho lateral
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setProduct(null); // Limpa o produto anterior ao carregar um novo
      setCurrentImageIndex(0); // Reseta o carrossel
      try {
        const response = await fetch(`http://localhost:8080/auth/produto/${id}`);
        if (!response.ok) throw new Error('Produto não encontrado');
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return; // Só busca relacionados se o produto principal já carregou
    const fetchAllProducts = async () => {
        try {
            const response = await fetch(`http://localhost:8080/auth/produto/listarTodosAtivos/true?status=true`);
            if (!response.ok) return;
            const data = await response.json();
            setRelatedProducts(data.filter(p => p.id.toString() !== id).sort(() => 0.5 - Math.random()));
        } catch (err) {
            console.error("Erro ao buscar produtos relacionados:", err);
        }
    };
    fetchAllProducts();
  }, [id, product]);

  const handleComprar = () => {
    const principalImage = product.imagens?.find(img => img.principal) || product.imagens?.[0];
    const imageUrl = principalImage ? `http://localhost:8080${principalImage.caminhoImagem}` : placeholderImage;

    addToCart({
      id: product.id,
      name: product.nome,
      price: product.preco,
      image: imageUrl
    });
    openSideCart(); // Abre o carrinho lateral
  };

  // Funções de navegação do carrossel
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.imagens.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.imagens.length) % product.imagens.length);
  };


  if (loading) return <div className="detail-page-message">Carregando...</div>;
  if (error) return <div className="detail-page-message error">Erro: {error}</div>;
  if (!product) return null;

  const hasImages = product.imagens && product.imagens.length > 0;
  const currentImageUrl = hasImages 
    ? `http://localhost:8080${product.imagens[currentImageIndex].caminhoImagem}`
    : placeholderImage;

  return (
    <div className="product-detail-page">
      <Header />
      <main className="detail-main-content">
        <section className="product-main-section">
          
          {/* Coluna da Galeria de Imagens */}
          <div className="product-gallery">
            <div className="main-image-wrapper">
              {hasImages && product.imagens.length > 1 && (
                <button className="gallery-nav-btn prev" onClick={goToPrevImage}><ChevronLeft size={28} /></button>
              )}
              <img src={currentImageUrl} alt={`${product.nome} - Imagem ${currentImageIndex + 1}`} className="product-main-image" />
              {hasImages && product.imagens.length > 1 && (
                <button className="gallery-nav-btn next" onClick={goToNextImage}><ChevronRight size={28} /></button>
              )}
            </div>
            {hasImages && product.imagens.length > 1 && (
              <div className="thumbnail-strip">
                {product.imagens.map((img, index) => (
                  <img 
                    key={img.id}
                    src={`http://localhost:8080${img.caminhoImagem}`}
                    alt={`Miniatura ${index + 1}`}
                    className={`thumbnail-image ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Coluna de Informações do Produto */}
          <div className="product-info-container">
            <h1 className="product-main-title">{product.nome}</h1>
            <p className="product-main-price">R$ {product.preco?.toFixed(2).replace('.', ',')}</p>
            {product.avaliacao && (
              <p className="product-main-rating">Avaliação: {product.avaliacao} / 5</p>
            )}
            <p className="product-main-desc">{product.descricao}</p>
            <button className="buy-button" onClick={handleComprar}>
              Adicionar ao Carrinho
            </button>
            <Link to="/" className="back-link">Continuar comprando</Link>
          </div>
        </section>

        {/* Seção de Produtos Relacionados */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <h2 className="section-title">Produtos Relacionados</h2>
            <div className="product-carousel">
              {relatedProducts.slice(0, 5).map(p => <MiniProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default ProductDetailPage;