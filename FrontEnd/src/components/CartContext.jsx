// Arquivo: FrontEnd/src/components/CartContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isSideCartOpen, setIsSideCartOpen] = useState(false);
  const [shippingCost, setShippingCost] = useState(0); // NOVO: Estado para o custo do frete

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const openSideCart = () => setIsSideCartOpen(true);
  const closeSideCart = () => setIsSideCartOpen(false);

  function addToCart(product) {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      if (found) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(id, quantity) {
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(item => item.id !== id));
  }

  function clearCart() {
    setCart([]);
    setShippingCost(0); // Limpa o frete ao limpar o carrinho
  }

  function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // CORRIGIDO: Retorna o valor do estado do frete
  function getFrete() {
    return shippingCost;
  }

  // NOVO: Função para definir o valor do frete
  function setShippingOption(cost) {
    setShippingCost(cost);
  }

  function getTotal() {
    return getSubtotal() + getFrete();
  }
  
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getFrete,
        getTotal,
        isSideCartOpen,
        openSideCart,
        closeSideCart,
        setShippingOption, // Expondo a nova função
      }}
    >
      {children}
    </CartContext.Provider>
  );
}