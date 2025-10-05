import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../components/CartContext.jsx";
import './css/ProductDetailPage.css';

const placeholderImage = "https://via.placeholder.com/300x300.png/000000/FFFFFF?text=Imagem+Indisponivel";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
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

  if (loading) return <div className="product-detail-loading">Carregando...</div>;
  if (error) return <div className="product-detail-error">Erro: {error}</div>;
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
    });
    navigate('/carrinho');
  }

  return (
    <div className="product-detail-bg">
      <div className="product-detail-card">
        <img src={imageUrl} alt={product.nome} className="product-detail-img" />
        <div className="product-detail-info">
          <h2 className="product-detail-title">{product.nome}</h2>
          <p className="product-detail-price">R$ {product.preco?.toFixed(2).replace('.', ',')}</p>
          <p className="product-detail-desc">{product.descricao}</p>
          {product.avaliacao && (
            <p className="product-detail-rating">Avaliação: {product.avaliacao} / 5</p>
          )}
          <button className="product-buy-btn" onClick={handleComprar}>
            Comprar
          </button>
          <Link to="/" className="product-detail-back">Voltar para a Home</Link>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;