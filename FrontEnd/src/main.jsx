// Arquivo: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/AuthContext';

// Importe o novo componente
import AdminRoute from './components/AdminRoute'; // <-- ADICIONE ESTA LINHA

// Suas outras importações...
import HomePage from './pages/public/HomePage';
import LoginPageBackOffice from './pages/public/LoginPageBackOffice';
import CadastroPage from './pages/public/CadastroPage';
import DashboardPage from './pages/private/DashboardPage';
import LoginPage from './pages/public/LoginPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CadastroPageAdmin from './pages/admin/CadastroPageAdmin';
import EditAdminPage from './pages/admin/EditAdminPage';
import CadastroProductPage from './pages/admin/CadastroProductPage';
import GerenciarProductPage from './pages/admin/GerenciarProductPage';



import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />}>
            
            {/* Rotas Públicas */}
            <Route index element={<HomePage />} />
            <Route path="LoginPageBackOffice" element={<LoginPageBackOffice />} />
            <Route path="LoginPage" element={<LoginPage />} />
            <Route path="CadastroPage" element={<CadastroPage />} />

            {/* Rotas Protegidas para QUALQUER usuário logado */}
            <Route element={<ProtectedRoute />}>
              <Route path="DashboardPage" element={<DashboardPage />} />
              {/* Adicione aqui outras páginas que clientes logados podem ver */}
            </Route>

            {/* ROTAS PROTEGIDAS APENAS PARA ADMINS E ESTOQUISTAS */}
            <Route element={<AdminRoute />}>
              <Route path="AdminDashboardPage" element={<AdminDashboardPage />} />
              <Route path="UserManagementPage" element={<UserManagementPage />} />
              <Route path="UserManagementPage/new" element={<CadastroPageAdmin />} />
              <Route path="UserManagementPage/edit/:userId" element={<EditAdminPage />} />
              <Route path="CadastroProductPage" element={<CadastroProductPage />} />
              <Route path="GerenciarProductPage" element={<GerenciarProductPage />} />

            </Route>

            {/* Rota para páginas não encontradas */}
            <Route path="*" element={<h1>Página não encontrada</h1>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);