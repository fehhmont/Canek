// Arquivo: FrontEnd/src/components/ProductCard/ProductCard.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // 1. Importe o Link
import './ProductCard.css';
import { Star } from 'lucide-react';

const StarRating = ({ rating }) => {
    const totalStars = 5;
    const fullStars = Math.round(rating);

    return (
        <div className="star-rating">
            {[...Array(totalStars)].map((_, index) => (
                <Star 
                    key={index} 
                    size={16} 
                    fill={index < fullStars ? "#ffc107" : "#e4e5e9"} 
                    stroke={index < fullStars ? "#ffc107" : "#e4e5e9"}
                />
            ))}
        </div>
    );
};

// 2. Adicione 'onAddToCart' como uma propriedade (prop)
function ProductCard({ product, onAddToCart }) {
  const { id, name, price, image, description, rating } = product;

  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        {rating > 0 && <StarRating rating={rating} />}
        <p className="product-description">{description}</p>
        <p className="product-price">R$ {price.toFixed(2).replace('.', ',')}</p>
        
        {/* 3. Adicione a seção de botões */}
        <div className="product-actions">
            <Link to={`/produto/${id}`} className="product-detail-button">
                Detalhes
            </Link>
            <button className="add-to-cart-button" onClick={() => onAddToCart(product)}>
                Adicionar ao Carrinho
            </button>
        </div>

      </div>
    </div>
  );
}

export default ProductCard;