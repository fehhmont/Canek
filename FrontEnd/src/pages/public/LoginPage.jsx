import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
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
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosLogin),
            });

            if (response.ok) {
                const data = await response.json();
                auth.login({ token: data.token, tipoUsuario: data.tipoUsuario });
            } else {
                const erroTexto = await response.text();
                setMensagemErro(erroTexto || 'Email ou senha inválidos.');
            }
        } catch (e) {
            setMensagemErro('Não foi possível conectar ao servidor.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="login-bg">
            <h1 className="login-title-big">Acesso ao Sistema</h1>
            <p className="login-subtitle-center">Entre com suas credenciais para acessar sua conta</p>

            <div className="login-card cadastro-card">
                <form onSubmit={handleSubmit}>
                    <div className="cadastro-form-group form-group">
                        <label className="cadastro-label login-label" htmlFor="email">
                            Email
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Mail size={20} style={{ position: 'absolute', left: 10, color: '#52658F' }} />
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite seu email"
                                className="cadastro-input login-input"
                                required
                                disabled={carregando}
                                style={{ paddingLeft: 38 }}
                            />
                        </div>
                    </div>

                    <div className="cadastro-form-group form-group">
                        <label className="cadastro-label login-label" htmlFor="senha">
                            Senha
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Lock size={20} style={{ position: 'absolute', left: 10, color: '#52658F' }} />
                            <input
                                type="password"
                                id="senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Digite sua senha"
                                className="cadastro-input login-input"
                                required
                                disabled={carregando}
                                style={{ paddingLeft: 38 }}
                            />
                        </div>
                    </div>

                    {mensagemErro && <p className="cadastro-error login-error">{mensagemErro}</p>}

                    <button type="submit" disabled={carregando} className="cadastro-btn login-btn">
                        {carregando ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 12 }}>
                    <span>Não tem conta? </span>
                    <Link to="/CadastroPage" className="login-link">
                        Cadastrar-se
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;