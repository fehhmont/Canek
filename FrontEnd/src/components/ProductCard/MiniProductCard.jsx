import React from 'react';
import { Link } from 'react-router-dom';
import './MiniProductCard.css';

const placeholderImage = "https://via.placeholder.com/150x150.png/000000/FFFFFF?text=Canek";

const MiniProductCard = ({ product }) => {
    const principalImage = product.imagens?.find(img => img.principal) || product.imagens?.[0];
    const imageUrl = principalImage
        ? `http://localhost:8080${principalImage.caminhoImagem}`
        : placeholderImage;

    return (
        <Link to={`/produto/${product.id}`} className="mini-product-card">
            <div className="mini-card-image-wrapper">
                <img 
                    src={imageUrl} 
                    alt={product.nome} 
                    className="mini-card-image"
                    onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
                />
            </div>
            <div className="mini-card-info">
                <p className="mini-card-name">{product.nome}</p>
                <p className="mini-card-price">R$ {product.preco.toFixed(2).replace('.', ',')}</p>
            </div>
        </Link>
    );
};

export default MiniProductCard;