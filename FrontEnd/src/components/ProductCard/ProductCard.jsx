// Arquivo: FrontEnd/src/components/ProductCard/ProductCard.jsx

import React from 'react';
import './ProductCard.css';
import { Star } from 'lucide-react';

// Componente auxiliar para renderizar as estrelas de avaliação
const StarRating = ({ rating }) => {
    const totalStars = 5;
    const fullStars = Math.round(rating); // Arredonda para a estrela mais próxima

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

function ProductCard({ product }) {
  const { name, price, image, description, rating } = product;

  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        {/* Renderiza a avaliação se ela for maior que 0 */}
        {rating > 0 && <StarRating rating={rating} />}
        <p className="product-description">{description}</p>
        <p className="product-price">{price}</p>
        <button className="add-to-cart-button">Adicionar ao Carrinho</button>
      </div>
    </div>
  );
}

export default ProductCard;