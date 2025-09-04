import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../../components/AuthContext.jsx'; // Importa nosso hook

function LoginPage() {
    // Hooks de estado para controlar os campos do formulário e o feedback
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mensagemErro, setMensagemErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    
    const auth = useAuth(); // Usa o contexto de autenticação para acessar a função de login

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
                
                // Chamamos a função de login do nosso contexto.
                // Ela cuidará de salvar o token e do redirecionamento.
                auth.login(data.token, data.tipoUsuario); 
                
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
    
    // Estilos para manter o visual consistente
    const styles = {
        
    };

    return (
        <div style={styles.loginContainer}>
            <div style={styles.loginCard}>
                <div style={styles.loginHeader}>
                    <ShoppingBag style={styles.loginIcon} />
                    <h1 style={styles.loginTitle}>Acesso ao Sistema</h1>
                    <p style={styles.loginSubtitle}>Entre com suas credenciais</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            style={styles.loginInput}
                            required
                            disabled={carregando}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Senha"
                            style={styles.loginInput}
                            required
                            disabled={carregando}
                        />
                    </div>

                    {mensagemErro && <p style={styles.error}>{mensagemErro}</p>}

                    <button type="submit" disabled={carregando} style={styles.loginButton}>
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;

