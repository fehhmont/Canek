import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../components/CartContext.jsx";
import MiniProductCard from "../../components/ProductCard/MiniProductCard.jsx";
import Header from "../../components/Header/Header.jsx"; // Importado
import Footer from "../../components/Footer/Footer.jsx"; // Importado
import './css/ProductDetailPage.css';

const placeholderImage = "https://via.placeholder.com/300x300.png/000000/FFFFFF?text=Imagem+Indisponivel";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Efeito para buscar o produto principal
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
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

  // Efeito para buscar todos os outros produtos (para as seções extras)
  useEffect(() => {
    const fetchAllProducts = async () => {
        try {
            const response = await fetch(`http://localhost:8080/auth/produto/listarTodosAtivos/true?status=true`);
            if (!response.ok) return;
            const data = await response.json();
            // Filtra o produto atual da lista e embaralha para variedade
            setRelatedProducts(data.filter(p => p.id.toString() !== id).sort(() => 0.5 - Math.random()));
        } catch (err) {
            console.error("Erro ao buscar produtos relacionados:", err);
        }
    };
    fetchAllProducts();
  }, [id]);

  if (loading) return <div className="detail-page-message">Carregando...</div>;
  if (error) return <div className="detail-page-message error">Erro: {error}</div>;
  if (!product) return null;

  const principalImage = product.imagens?.find(img => img.principal) || product.imagens?.[0];
  const imageUrl = principalImage
    ? `http://localhost:8080${principalImage.caminhoImagem}`
    : placeholderImage;

  function handleComprar() {
    addToCart({
      id: product.id,
      name: product.nome,
      price: product.preco,
      image: imageUrl
    });
    navigate('/carrinho');
  }

  return (
    <div className="product-detail-page">
      <Header /> {/* Adicionado aqui */}
      <main className="detail-main-content">
        {/* Seção Principal do Produto */}
        <section className="product-main-section">
          <div className="product-image-container">
            <img src={imageUrl} alt={product.nome} className="product-main-image" />
          </div>
          <div className="product-info-container">
            <h1 className="product-main-title">{product.nome}</h1>
            <p className="product-main-price">R$ {product.preco?.toFixed(2).replace('.', ',')}</p>
            {product.avaliacao && (
              <p className="product-main-rating">Avaliação: {product.avaliacao} / 5</p>
            )}
            <p className="product-main-desc">{product.descricao}</p>
            <button className="product-buy-btn" onClick={handleComprar}>
              Comprar
            </button>
            <Link to="/" className="back-link">Voltar para a Home</Link>
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

        {/* Seção Veja Mais */}
        {relatedProducts.length > 5 && (
          <section className="see-more-section">
            <h2 className="section-title">Veja Mais</h2>
            <div className="product-carousel">
              {relatedProducts.slice(5, 10).map(p => <MiniProductCard key={p.id} product={p} />)}
            </div>
          </section>
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

export default ProductDetailPage;