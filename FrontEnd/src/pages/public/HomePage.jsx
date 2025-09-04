import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Corrigindo os caminhos de importação para garantir que os arquivos sejam encontrados
import Footer from '../../components/Footer/Footer.jsx';
import Header from '../../components/Header/Header.jsx';
import ProductCard from '../../components/ProductCard/ProductCard.jsx';
import './css/HomePage.css';
import { useAuth } from '../../components/AuthContext.jsx'; // Importa nosso hook de autenticação

import caneca1 from '../../assets/caneca_dev.png';
import caneca2 from '../../assets/caneca_dev.png';

// Array estático de produtos para simular a resposta da API
const products = [
  { id: 1, name: 'Caneca do Dev', price: 'R$ 49,90', image: caneca1 },
  { id: 2, name: 'Caneca do Café', price: 'R$ 54,90', image: caneca2 },
  { id: 3, name: 'Caneca Programador', price: 'R$ 59,90', image: caneca1 },
  { id: 4, name: 'Caneca do Código', price: 'R$ 65,90', image: caneca2 },
  { id: 5, name: 'Caneca do Café', price: 'R$ 54,90', image: caneca2 },
  { id: 6, name: 'Caneca Programador', price: 'R$ 59,90', image: caneca1 },
  { id: 7, name: 'Caneca de Viagem', price: 'R$ 75,00', image: caneca2 },
  { id: 8, name: 'Caneca do Escritório', price: 'R$ 45,00', image: caneca1 },
  { id: 9, name: 'Caneca do Geek', price: 'R$ 60,00', image: caneca2 },
];

function HomePage() {
    const { isAuthenticated } = useAuth(); // Pega o estado de autenticação do contexto!

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 6;
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    const goToNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    };

    const goToPrevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    return (
        <div className="app">
            <Header /> {/* O Header também pode usar o useAuth() para mostrar 'Login' ou 'Sair' */}

            <main className="main-content">
                
                

                <section className="customize-section">
                  <h2 className="customize-title">Personalize sua caneca</h2>
                  <p className="customize-description">
                      Crie algo único e especial. Use sua imaginação e personalize sua caneca do seu jeito!
                  </p>
                  <Link to="/customize">
                      <button className="customize-button">
                          Personalize sua caneca
                      </button>
                  </Link>
                </section>

                <div className="section-header">
                  <h2 className="section-title">
                    Nossa Coleção de Canecas
                  </h2>
                  <p className="section-description">
                    Encontre a caneca perfeita para cada momento. Qualidade premium,
                    designs únicos e entrega rápida.
                  </p>
                </div>

                <div className="product-grid">
                    {currentProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="pagination-controls">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  <span>Página {currentPage} de {totalPages}</span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </button>
                </div>

                
                     {/* Rodapé da Página */}
        <footer className="footer">
          <div className="footer-content">
            <h3 className="footer-title">
              MugStore - Sua loja de canecas online
            </h3>
            <div className="footer-features">
              <span>Entrega rápida</span>
              <span className="footer-separator">•</span>
              <span>Qualidade garantida</span>
              <span className="footer-separator">•</span>
              <span>Suporte 24h</span>
            </div>
          </div>
        </footer>
                
            </main>
        </div>
    );
}

export default HomePage;

