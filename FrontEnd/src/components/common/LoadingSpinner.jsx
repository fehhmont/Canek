import React from 'react';
import './css/LoadingSpinner.css'; // Vamos criar este arquivo de CSS a seguir

const LoadingSpinner = ({ message = "Carregando..." }) => {
    return (
        <div className="spinner-overlay">
            <div className="spinner-container"></div>
            <p className="spinner-message">{message}</p>
        </div>
    );
};

export default LoadingSpinner;