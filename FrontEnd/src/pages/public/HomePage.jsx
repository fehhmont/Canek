import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import { Carousel } from '../../components/Header/Carousel';
import './css/HomePage.css'


function HomePage() {
    return (
        <div className="app">
      <Header />
      
      <Carousel />
      
      <main className="main-content">
        {/* Título da Seção */}
        <div className="section-header">
          <h2 className="section-title">
            Nossa Coleção de Canecas
          </h2>
          <p className="section-description">
            Encontre a caneca perfeita para cada momento. Qualidade premium, 
            designs únicos e entrega rápida.
          </p>
        </div>

        

        {/* Grid de Produtos */}
       

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