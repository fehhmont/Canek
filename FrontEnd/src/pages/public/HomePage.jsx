import React from 'react';
import { Link } from 'react-router-dom';


function HomePage() {
    return (
        <div>
            <h1>Pagina Principal</h1>
            <p>Pagina Principal</p>
            <Link to="/cadastro">Ir para tela de cadastro</Link>
        </div>
    )
}

export default HomePage;