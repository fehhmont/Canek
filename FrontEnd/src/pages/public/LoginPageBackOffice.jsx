import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext.jsx';
import './css/LoginPageBackOffice.css';

// Ícone de seta para voltar
const ArrowLeft = () => (
  <svg width="28" height="28" fill="none" stroke="#52658F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}><polyline points="18 24 8 14 18 4"/></svg>
);

function LoginPageBackOffice() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensagemErro, setMensagemErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const auth = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMensagemErro('');
        setCarregando(true);

        const dadosLogin = { email, senha: password };

        try {
            const response = await fetch("http://localhost:8080/auth/administrador/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosLogin),
            });

            if (response.ok) {
                const data = await response.json();
                auth.login({ token: data.token, cargo: data.cargo }); 
            } else {
                const erroTexto = await response.text();
                setMensagemErro(erroTexto || "Email ou senha inválidos.");
            }
        } catch (error) {
            setMensagemErro("Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="backoffice-login-bg">
            <button className="backoffice-login-back-btn" onClick={() => navigate("/")} title="Voltar">
                <ArrowLeft />
            </button>
            <h1 className="backoffice-login-title">Acesso ao Backoffice</h1>
            <p className="backoffice-login-subtitle">
                Entre com suas credenciais para acessar o sistema
            </p>
            <div className="backoffice-login-card">
                <form onSubmit={handleSubmit}>
                    <div className="backoffice-login-form-group">
                        <label className="backoffice-login-label" htmlFor="email">Email</label>
                        <div className="backoffice-login-input-icon">
                            <Mail size={20} className="backoffice-login-input-svg" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite seu email"
                                className="backoffice-login-input"
                                required
                                disabled={carregando}
                            />
                        </div>
                    </div>
                    <div className="backoffice-login-form-group">
                        <label className="backoffice-login-label" htmlFor="senha">Senha</label>
                        <div className="backoffice-login-input-icon">
                            <Lock size={20} className="backoffice-login-input-svg" />
                            <input
                                type="password"
                                id="senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite sua senha"
                                className="backoffice-login-input"
                                required
                                disabled={carregando}
                            />
                        </div>
                    </div>
                    {mensagemErro && <p className="backoffice-login-error">{mensagemErro}</p>}
                    <button type="submit" disabled={carregando} className="backoffice-login-btn">
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPageBackOffice;