import React from "react";
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
  } = useCart();

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
                  <button
                    className="cart-qty-btn"
                    onClick={() => decreaseQuantity(item.id)}
                    disabled={item.quantity <= 1}
                    title="Diminuir"
                  >-</button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => updateQuantity(item.id, Number(e.target.value))}
                    className="cart-qty-input"
                  />
                  <button
                    className="cart-qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    title="Aumentar"
                  >+</button>
                </td>
                <td>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</td>
                <td>
                  <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="cart-summary">
          <p>Subtotal: <strong>R$ {getSubtotal().toFixed(2).replace('.', ',')}</strong></p>
          <p>Frete: <strong>R$ {getFrete().toFixed(2).replace('.', ',')}</strong></p>
          <p>Total: <strong>R$ {getTotal().toFixed(2).replace('.', ',')}</strong></p>
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