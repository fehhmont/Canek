// Arquivo: FrontEnd/src/components/SideCart/SideCart.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import './SideCart.css';

const placeholderImage = "https://via.placeholder.com/80x80.png/000000/FFFFFF?text=Canek";

function SideCart() {
    const { 
        isSideCartOpen, 
        closeSideCart, 
        cart, 
        getSubtotal, 
        removeFromCart,
        addToCart,
        decreaseQuantity
    } = useCart();
    const navigate = useNavigate();

    const handleContinue = () => {
        closeSideCart();
        navigate('/carrinho');
    };

    if (!isSideCartOpen) {
        return null;
    }

    return (
        <div className={`side-cart-overlay ${isSideCartOpen ? 'show' : ''}`} onClick={closeSideCart}>
            <div className={`side-cart-panel ${isSideCartOpen ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="side-cart-header">
                    <h3>Meu Carrinho</h3>
                    <button onClick={closeSideCart} className="close-btn">
                        <X size={24} />
                    </button>
                </div>

                <div className="side-cart-body">
                    {cart.length === 0 ? (
                        <p className="empty-message">Seu carrinho está vazio.</p>
                    ) : (
                        cart.map(item => (
                            // 1. Adicione a classe 'cart-item-card'
                            <div key={item.id} className="cart-item-card">
                                <img 
                                    src={item.image || placeholderImage} 
                                    alt={item.name} 
                                    className="item-image"
                                    onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
                                />
                                <div className="item-main-info"> {/* Novo wrapper para nome e preço/quantidade */}
                                    <div className="item-header-row">
                                        <p className="item-name">{item.name}</p>
                                        <button onClick={() => removeFromCart(item.id)} className="remove-item-btn">
                                            <X size={18} /> {/* Ícone 'X' para remover */}
                                        </button>
                                    </div>
                                    
                                    <div className="item-footer-row"> {/* Novo wrapper para quantidade e preço */}
                                        <div className="item-quantity-controls">
                                            <button 
                                                onClick={() => decreaseQuantity(item.id)} 
                                                disabled={item.quantity <= 1}
                                                className="quantity-btn"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="item-quantity">{item.quantity}</span>
                                            <button onClick={() => addToCart(item)} className="quantity-btn">
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <p className="item-price">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p> {/* Preço total do item */}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="side-cart-footer">
                    <div className="subtotal">
                        <span>Subtotal:</span>
                        <span>R$ {getSubtotal().toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button className="continue-btn" onClick={handleContinue}>
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SideCart;