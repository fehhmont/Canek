import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      <p>&copy; {new Date().getFullYear()} Meu Sistema. Todos os direitos reservados.</p>
    </footer>
  );
}

export default Footer;