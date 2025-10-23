import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/AuthContext';
import { CartProvider } from './components/CartContext';
import AdminRoute from './components/AdminRoute';

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
import GerenciarProductPage from './pages/admin/GerenciarProductPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CartPage from './pages/public/CartPage';
import Routers from './pages/Routers';
import MeuPerfilPage from './pages/private/MeuPerfilPage'; // NOVO IMPORT

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<App />}>
              
              {/* Rotas Públicas */}
              <Route index element={<HomePage />} />
              <Route path="LoginPageBackOffice" element={<LoginPageBackOffice />} />
              <Route path="LoginPage" element={<LoginPage />} />
              <Route path="CadastroPage" element={<CadastroPage />} />
              <Route path="produto/:id" element={<ProductDetailPage />} />
              <Route path="carrinho" element={<CartPage />} />
              <Route path='Routers' element={<Routers />} />

              {/* Rotas Protegidas para QUALQUER usuário logado */}
              <Route element={<ProtectedRoute />}>
                <Route path="DashboardPage" element={<DashboardPage />} />
                <Route path="minha-conta" element={<MeuPerfilPage />} /> {/* NOVA ROTA */}
              </Route>

              {/* ROTAS PROTEGIDAS APENAS PARA ADMINS E ESTOQUISTAS */}
              <Route element={<AdminRoute />}>
                <Route path="AdminDashboardPage" element={<AdminDashboardPage />} />
                <Route path="UserManagementPage" element={<UserManagementPage />} />
                <Route path="UserManagementPage/new" element={<CadastroPageAdmin />} />
                <Route path="UserManagementPage/edit/:userId" element={<EditAdminPage />} />
                <Route path="GerenciarProductPage" element={<GerenciarProductPage />} />
                <Route path="ProductFormPage" element={<ProductFormPage />} />

                {/* Novas rotas para criar e editar produtos */}
                <Route path="product/new" element={<ProductFormPage />} />
                <Route path="product/edit/:productId" element={<ProductFormPage />} />
              </Route>

              {/* Rota para páginas não encontradas */}
              <Route path="*" element={<h1>Página não encontrada</h1>} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);