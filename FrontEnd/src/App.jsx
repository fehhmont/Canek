import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Outlet } from 'react-router-dom';
import './App.css'

function App() {
  return (
    <div className="App">
      {/* O Outlet renderizará o componente da rota correspondente */}
      <Outlet />
    </div>
  );
}

export default App