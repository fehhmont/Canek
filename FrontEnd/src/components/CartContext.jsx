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
  
  // 1. Adicione o estado para o modal lateral
  const [isSideCartOpen, setIsSideCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 2. Crie as funções para controlar o modal
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

  // ... (o restante das suas funções: updateQuantity, removeFromCart, etc. permanecem iguais)
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
  }

  function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function getFrete() {
    const subtotal = getSubtotal();
    return subtotal >= 150 ? 0 : 15;
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
        // 3. Exponha o estado e as funções no 'value' do provider
        isSideCartOpen,
        openSideCart,
        closeSideCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}