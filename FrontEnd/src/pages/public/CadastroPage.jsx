import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CadastroPage() {
    // Hooks de estado para armazenar os dados de cada campo do formulário
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [telefone, setTelefone] = useState("");

    // Hooks de estado para feedback ao usuário
    const [mensagemErro, setMensagemErro] = useState("");
    const [mensagemSucesso, setMensagemSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);

    // Hook para navegar para outra página após o sucesso
    const navigate = useNavigate();

    // Função chamada ao submeter o formulário
    const handleSubmit = async (event) => {
        // Previne o comportamento padrão do formulário (que recarrega a página)
        event.preventDefault();

        // Limpa mensagens anteriores e ativa o estado de carregamento
        setMensagemErro("");
        setMensagemSucesso("");
        setCarregando(true);

        // Cria o objeto de dados que será enviado para a API
        const dadosCadastro = {
            nomeCompleto,
            cpf,
            email,
            senha,
            telefone,
        };

        try {
            // Faz a requisição POST para a API
            const response = await fetch("http://localhost:8080/auth/cadastro", {
                method: "POST",
                headers: {
                    // Informa à API que estamos enviando dados no formato JSON
                    "Content-Type": "application/json",
                },
                // Converte o objeto JavaScript para uma string JSON
                body: JSON.stringify(dadosCadastro),
            });

            // Verifica se a resposta da API foi bem-sucedida (status 2xx)
            if (response.ok) {
                setMensagemSucesso("Cadastro realizado com sucesso! Redirecionando para o login...");
                // Limpa o formulário
                setNomeCompleto("");
                setCpf("");
                setEmail("");
                setSenha("");
                setTelefone("");
                // Aguarda 2 segundos e redireciona o usuário para a página de login
                setTimeout(() => {
                    navigate("/login"); // Certifique-se de que você tem uma rota "/login"
                }, 2000);
            } else {
                // Se a resposta não foi OK, lê a mensagem de erro do corpo da resposta
                const erroTexto = await response.text();
                setMensagemErro(erroTexto || "Ocorreu um erro ao cadastrar.");
            }
        } catch (error) {
            // Trata erros de rede (ex: API fora do ar)
            console.error("Erro de rede:", error);
            setMensagemErro("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
        } finally {
            // Desativa o estado de carregamento, independentemente do resultado
            setCarregando(false);
        }
    };

    
    const styles = {
        
    };

    return (
        <div style={styles.container}>
            <h1>Página de Cadastro</h1>
            <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label htmlFor="nomeCompleto" style={styles.label}>Nome Completo:</label>
                    <input type="text" id="nomeCompleto" name="nomeCompleto" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="cpf" style={styles.label}>CPF:</label>
                    <input type="text" id="cpf" name="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="email" style={styles.label}>Email:</label>
                    <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="senha" style={styles.label}>Senha (mínimo 8 caracteres):</label>
                    <input type="password" id="senha" name="senha" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength="8" style={styles.input} />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="telefone" style={styles.label}>Telefone:</label>
                    <input type="tel" id="telefone" name="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={styles.input} />
                </div>

                {/* Mostra as mensagens de erro ou sucesso */}
                {mensagemErro && <p style={styles.error}>{mensagemErro}</p>}
                {mensagemSucesso && <p style={styles.success}>{mensagemSucesso}</p>}

                <button type="submit" disabled={carregando} style={styles.button}>
                    {carregando ? "Cadastrando..." : "Cadastrar"}
                </button>
            </form>
            <br />
            <Link to="/" style={styles.link}>Voltar para a página principal</Link>
        </div>
    );
}

export default CadastroPage;