import React from 'react';
import './ProductCard.css';

// O componente recebe os dados do produto como "props"
function ProductCard({ product }) {
  const { name, price, image } = product;

  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-price">{price}</p>
        <button className="add-to-cart-button">Adicionar ao Carrinho</button>
      </div>
    </div>
  );
}

export default ProductCard;