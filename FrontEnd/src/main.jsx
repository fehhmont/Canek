// Arquivo: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importa o componente de Layout
import App from './App';

// Importa o provedor de autenticação
import { AuthProvider } from './components/AuthContext';

// Importa todas as suas páginas
import HomePage from './pages/public/HomePage';
import LoginPageBackOffice from './pages/public/LoginPageBackOffice';
import CadastroPage from './pages/public/CadastroPage';
import DashboardPage from './pages/private/DashboardPage';
import LoginPage from './pages/public/LoginPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage'; 

// Importa o CSS global
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Esta é a Rota de Layout. Ela diz: "Para qualquer URL que comece com '/', 
            renderize o componente App. As rotas filhas serão renderizadas
            dentro do <Outlet /> do App."
          */}
          <Route path="/" element={<App />}>
            
            {/* Rotas Públicas (filhas do layout) */}
            <Route index element={<HomePage />} />
            <Route path="LoginPageBackOffice" element={<LoginPageBackOffice />} />
            <Route path="loginPage" element={<LoginPage />} />
            <Route path="cadastro" element={<CadastroPage />} />

            {/* Rotas Protegidas (também filhas do layout) */}
            <Route element={<ProtectedRoute />}>
              <Route path="DashboardPage" element={<DashboardPage />} />
              <Route path="AdminDashboardPage" element={<AdminDashboardPage />} />
              <Route path="UserManagementPage" element={<UserManagementPage />} />
            </Route>

            {/* Rota para páginas não encontradas */}
            <Route path="*" element={<h1>Página não encontrada</h1>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);