import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext.jsx';
import './css/LoginPage.css';

// Ícone de seta para voltar
const ArrowLeft = () => (
  <svg width="28" height="28" fill="none" stroke="#52658F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}><polyline points="18 24 8 14 18 4"/></svg>
);

function LoginPage() {
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
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosLogin),
            });

            if (response.ok) {
                const data = await response.json();
                auth.login(data.token, data.tipoUsuario); 
            } else {
                const erroTexto = await response.text();
                setMensagemErro(erroTexto || "Email ou senha inválidos.");
            }
        } catch {
            setMensagemErro("Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="cadastro-bg">
            <button className="cadastro-back-btn" onClick={() => navigate("/")} title="Voltar">
                <ArrowLeft />
            </button>
            <h1 className="cadastro-title-big">Acesso ao Backoffice</h1>
            <p className="cadastro-subtitle-center">
                Entre com suas credenciais para acessar o sistema
            </p>
            <div className="cadastro-card">
                <form onSubmit={handleSubmit}>
                    <div className="cadastro-form-group">
                        <label className="cadastro-label" htmlFor="email">Email</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Mail size={20} style={{ position: 'absolute', left: 10, color: '#52658F' }} />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite seu email"
                                className="cadastro-input"
                                required
                                disabled={carregando}
                                style={{ paddingLeft: 38 }}
                            />
                        </div>
                    </div>
                    <div className="cadastro-form-group">
                        <label className="cadastro-label" htmlFor="senha">Senha</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Lock size={20} style={{ position: 'absolute', left: 10, color: '#52658F' }} />
                            <input
                                type="password"
                                id="senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite sua senha"
                                className="cadastro-input"
                                required
                                disabled={carregando}
                                style={{ paddingLeft: 38 }}
                            />
                        </div>
                    </div>
                    {mensagemErro && <p className="cadastro-error">{mensagemErro}</p>}
                    <button type="submit" disabled={carregando} className="cadastro-btn">
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;