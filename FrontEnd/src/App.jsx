// Arquivo: FrontEnd/src/App.jsx

import { Outlet } from 'react-router-dom';
import SideCart from './components/SideCart/SideCart'; // 1. Importe o novo componente
import './App.css';

function App() {
  return (
    <div className="App">
      {/* O Outlet renderizará o componente da rota correspondente */}
      <Outlet />

      {/* 2. Adicione o SideCart aqui. Ele vai se controlar sozinho via context */}
      <SideCart />
    </div>
  );
}

export default App;