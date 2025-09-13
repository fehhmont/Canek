import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../components/AuthContext.jsx';
import './css/LoginPage.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensagemErro, setMensagemErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    
    const auth = useAuth();

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
                auth.login({ token: data.token, tipoUsuario: data.tipoUsuario }); 
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
        <div className="login-bg">
            <h1 className="login-title-big">Acesso ao Sistema</h1>
            <p className="login-subtitle-center">
                Entre com suas credenciais para acessar sua conta
            </p>
            <div className="login-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="login-label" htmlFor="email">Email</label>
                        <div className="login-input-icon">
                            <Mail size={20} className="login-input-svg" />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite seu email"
                                className="login-input"
                                required
                                disabled={carregando}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="login-label" htmlFor="senha">Senha</label>
                        <div className="login-input-icon">
                            <Lock size={20} className="login-input-svg" />
                            <input
                                type="password"
                                id="senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite sua senha"
                                className="login-input"
                                required
                                disabled={carregando}
                            />
                        </div>
                    </div>
                    {mensagemErro && <p className="login-error">{mensagemErro}</p>}
                    <button type="submit" disabled={carregando} className="login-button">
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;