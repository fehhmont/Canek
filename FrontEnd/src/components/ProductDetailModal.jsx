import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './ProductDetailModal.css';

const ProductDetailModal = ({ product, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!product) {
        return null;
    }

    const hasImages = product.imagens && product.imagens.length > 0;

    const goToPrevious = () => {
        const isFirstImage = currentImageIndex === 0;
        const newIndex = isFirstImage ? product.imagens.length - 1 : currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
    };

    const goToNext = () => {
        const isLastImage = currentImageIndex === product.imagens.length - 1;
        const newIndex = isLastImage ? 0 : currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
    };

    const getImageUrl = (path) => {
        if (!path) return '';
        // Garante que o caminho comece com /uploads/
        if (path.startsWith('/uploads/')) {
            return `http://localhost:8080${path}`;
        }
        // Fallback para outros formatos, se necessário
        return `http://localhost:8080/uploads/${path.split('/').pop()}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
                
                <div className="modal-body">
                    <div className="carousel-container">
                        {hasImages && product.imagens.length > 1 && (
                            <button className="carousel-btn prev" onClick={goToPrevious}>
                                <ChevronLeft size={28} />
                            </button>
                        )}
                        
                        <div className="carousel-image-wrapper">
                            {hasImages ? (
                                <img 
                                    src={getImageUrl(product.imagens[currentImageIndex].caminhoImagem)} 
                                    alt={`${product.nome} - Imagem ${currentImageIndex + 1}`} 
                                    className="carousel-image"
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/300?text=Imagem+Nao+Encontrada"; }}
                                />
                            ) : (
                                <div className="no-image-placeholder">
                                    <span>Imagem não disponível</span>
                                </div>
                            )}
                        </div>

                        {hasImages && product.imagens.length > 1 && (
                             <button className="carousel-btn next" onClick={goToNext}>
                                <ChevronRight size={28} />
                            </button>
                        )}
                        
                        {hasImages && product.imagens.length > 1 && (
                            <div className="carousel-dots">
                                {product.imagens.map((_, index) => (
                                    <span 
                                        key={index} 
                                        className={`dot ${currentImageIndex === index ? 'active' : ''}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    ></span>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="product-details">
                        <h2 className="product-title">{product.nome}</h2>
                        <p className="product-description">{product.descricao}</p>
                        <div className="product-meta">
                            <div className="meta-item">
                                <span className="meta-label">ID:</span>
                                <span className="meta-value">{product.id}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Preço:</span>
                                <span className="meta-value price">R$ {product.preco.toFixed(2)}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Estoque:</span>
                                <span className="meta-value">{product.estoque} unidades</span>
                            </div>
                             <div className="meta-item">
                                <span className="meta-label">Status:</span>
                                <span className={`status-badge ${product.status ? 'status-active' : 'status-inactive'}`}>
                                    {product.status ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Avaliação:</span>
                                <span className="meta-value">{product.avaliacao || 'Não avaliado'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;