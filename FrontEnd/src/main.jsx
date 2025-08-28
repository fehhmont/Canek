import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './App.jsx'
import './index.css';

// Importe as páginas públicas e privadas
import HomePage from "./pages/public/HomePage.jsx";
import CadastroPage from "./pages/public/CadastroPage.jsx";
import LoginPage from './pages/public/LoginPage.jsx';
import DashboardPage from './pages/private/DashboardPage.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UserManagementPage from "./pages/admin/UserManagementPage.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
        <Route index element={<HomePage />} />
        <Route path="cadastro" element={<CadastroPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="dashboardPage" element={<DashboardPage />} />
        <Route path="protectedRoute" element={<ProtectedRoute />} />
        <Route path="usermanagemenetpage" element={<UserManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)