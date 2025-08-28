import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Carousel.css';

const carouselImages = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Canecas Personalizadas",
    subtitle: "Crie sua caneca única com design exclusivo"
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Coffee Lovers",
    subtitle: "Para os verdadeiros amantes de café"
  },
  {
    id: 3,
    image: "https://images.pexels.com/photos/982612/pexels-photo-982612.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Estilo Profissional",
    subtitle: "Elegância para o ambiente de trabalho"
  },
  {
    id: 4,
    image: "https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Coleção Especial",
    subtitle: "Designs únicos e limitados"
  }
];

export const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Muda a cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? carouselImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  return (
    <div className="carousel">
      {/* Container das Imagens */}
      <div 
        className="carousel-container"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {carouselImages.map((slide) => (
          <div
            key={slide.id}
            className="carousel-slide"
          >
            {/* Overlay com gradiente */}
            <div className="carousel-overlay"></div>
            
            {/* Imagem de fundo */}
            <img
              src={slide.image}
              alt={slide.title}
              className="carousel-image"
            />
            
            {/* Conteúdo sobreposto */}
            <div className="carousel-content">
              <h2 className="carousel-title">
                {slide.title}
              </h2>
              <p className="carousel-subtitle">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Botões de Navegação */}
      <button
        onClick={goToPrevious}
        className="carousel-nav-button carousel-nav-left"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        className="carousel-nav-button carousel-nav-right"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicadores de Slide */}
      <div className="carousel-indicators">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`carousel-indicator ${
              index === currentSlide
                ? 'active'
                : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
};