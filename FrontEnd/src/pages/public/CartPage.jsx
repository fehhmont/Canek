// Arquivo: FrontEnd/src/pages/public/CartPage.jsx

import React, { useState } from "react";
import { useCart } from "../../components/CartContext.jsx";
import { Link } from "react-router-dom";
import './css/CartPage.css';

function CartPage() {
  const {
    cart,
    updateQuantity,
    decreaseQuantity,
    removeFromCart,
    getSubtotal,
    getFrete,
    getTotal,
    clearCart,
    setShippingOption, // Importe a nova função
  } = useCart();

  // Estados para o cálculo de frete
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCepChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    setCep(value.slice(0, 8)); // Limita a 8 dígitos
  };

  const handleCalculateShipping = async () => {
    if (cep.length !== 8) {
      setError('Por favor, digite um CEP válido com 8 dígitos.');
      return;
    }
    setError('');
    setIsLoading(true);
    setShippingOptions([]);
    setShippingOption(0); // Reseta o frete anterior

    try {
      const response = await fetch("http://localhost:8080/auth/produto/calcularFrete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep }),
      });

      if (!response.ok) {
        throw new Error('Não foi possível calcular o frete. Tente novamente.');
      }

      const data = await response.json();
      setShippingOptions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectShipping = (option) => {
    setShippingOption(option.valor);
  };


  if (cart.length === 0) {
    return (
      <div className="cart-bg">
        <div className="cart-card">
          <h2>Seu carrinho está vazio!</h2>
          <Link to="/" className="cart-back-btn">Continuar comprando</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-bg">
      <div className="cart-card">
        <h2 className="cart-title">Meu Carrinho</h2>
        <table className="cart-table">
          {/* ... seu a a tabela do carrinho continua igual ... */}
          <thead>
            <tr>
              <th>Produto</th>
              <th>Preço</th>
              <th>Qtd</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>R$ {item.price.toFixed(2).replace('.', ',')}</td>
                <td>
                  <button className="cart-qty-btn" onClick={() => decreaseQuantity(item.id)} disabled={item.quantity <= 1}>-</button>
                  <span className="cart-qty-text">{item.quantity}</span>
                  <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </td>
                <td>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</td>
                <td><button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="cart-bottom-section">
          {/* Seção de Cálculo de Frete */}
          <div className="shipping-calculator">
            <h4>Calcular Frete</h4>
            <div className="shipping-input-group">
              <input 
                type="text" 
                value={cep}
                onChange={handleCepChange}
                placeholder="Digite seu CEP" 
                className="shipping-cep-input"
              />
              <button onClick={handleCalculateShipping} disabled={isLoading} className="shipping-calc-btn">
                {isLoading ? 'Calculando...' : 'Calcular'}
              </button>
            </div>
            {error && <p className="shipping-error">{error}</p>}
            
            {/* Seção de Opções de Frete */}
            {shippingOptions.length > 0 && (
              <div className="shipping-options">
                {shippingOptions.map((option, index) => (
                  <label key={index} className="shipping-option">
                    <input 
                      type="radio" 
                      name="shipping" 
                      onChange={() => handleSelectShipping(option)} 
                    />
                    <div className="shipping-details">
                      <span className="transportadora">{option.transportadora}</span>
                      <span className="prazo">{option.prazoEstimado}</span>
                    </div>
                    <span className="valor">R$ {option.valor.toFixed(2).replace('.', ',')}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Resumo do Pedido */}
          <div className="cart-summary">
            <h3>Resumo do Pedido</h3>
            <p>Subtotal: <strong>R$ {getSubtotal().toFixed(2).replace('.', ',')}</strong></p>
            <p>Frete: <strong>R$ {getFrete().toFixed(2).replace('.', ',')}</strong></p>
            <p className="total-price">Total: <strong>R$ {getTotal().toFixed(2).replace('.', ',')}</strong></p>
          </div>
        </div>

        <div className="cart-actions">
          <button className="cart-clear-btn" onClick={clearCart}>Limpar Carrinho</button>
          <button className="cart-buy-btn" onClick={() => alert('Compra finalizada!')}>Finalizar Compra</button>
          <Link to="/" className="cart-back-btn">Continuar comprando</Link>
        </div>
      </div>
    </div>
  );
}

export default CartPage;