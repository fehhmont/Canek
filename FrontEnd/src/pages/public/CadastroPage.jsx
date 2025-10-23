import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup'; 
import { cadastroSchema } from "../../utils/validationSchemas.js";
import './css/CadastroPage.css';

const ArrowLeft = () => (
  <svg width="28" height="28" fill="none" stroke="#52658F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{display: 'block'}}><polyline points="18 24 8 14 18 4"/></svg>
);

function CadastroPage() {
    const [mensagemApi, setMensagemApi] = useState("");
    const navigate = useNavigate();

    const { 
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue 
    } = useForm({
        resolver: yupResolver(cadastroSchema)
    });

  // Campos dinâmicos de endereços de entrega
  const [enderecosEntrega, setEnderecosEntrega] = useState([{ cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', principal: false }]);
  const [copiarFaturamentoParaEntrega, setCopiarFaturamentoParaEntrega] = useState(false);

    const handleTelefoneChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '');
        
        let masked = '';
        if (digits.length > 0) masked = `(${digits.substring(0, 2)}`;
        if (digits.length > 2) masked += `) ${digits.substring(2, 7)}`;
        if (digits.length > 7) masked += `-${digits.substring(7, 11)}`;
        
        setValue('telefone', masked, { shouldValidate: true });
    };

    // CORREÇÃO 1: Função para formatar o CPF
    const handleCpfChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, ''); // Remove tudo que não é dígito

        let masked = '';
        if (digits.length > 0) masked = digits.substring(0, 3);
        if (digits.length > 3) masked += `.${digits.substring(3, 6)}`;
        if (digits.length > 6) masked += `.${digits.substring(6, 9)}`;
        if (digits.length > 9) masked += `-${digits.substring(9, 11)}`;

        setValue('cpf', masked, { shouldValidate: true });
    };

  // Função para consultar ViaCEP e preencher campos
  const buscarCep = async (cep, tipo = 'faturamento', index = 0) => {
    const raw = cep.replace(/\D/g, '');
    if (raw.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      if (!res.ok) return;
      const js = await res.json();
      if (js.erro) return;
      if (tipo === 'faturamento') {
        setValue('enderecoFaturamento.logradouro', js.logradouro || '');
        setValue('enderecoFaturamento.bairro', js.bairro || '');
        setValue('enderecoFaturamento.cidade', js.localidade || '');
        setValue('enderecoFaturamento.uf', js.uf || '');
      } else {
        // endereço de entrega específico
        const novos = [...enderecosEntrega];
        novos[index] = { ...novos[index], logradouro: js.logradouro || '', bairro: js.bairro || '', cidade: js.localidade || '', uf: js.uf || '' };
        setEnderecosEntrega(novos);
      }
      } catch {
        // silently fail
      }
  };

  // Funções para manipular endereços de entrega (escopo do componente)
  const handleAddEntrega = () => {
    setEnderecosEntrega(prev => [...prev, { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', principal: false }]);
  };

  const handleRemoveEntrega = (i) => {
    setEnderecosEntrega(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleEntregaChange = (i, field, value) => {
    setEnderecosEntrega(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

    // CORREÇÃO 2: Ajuste na função de submit para limpar o CPF também
    const onSubmit = async (data) => {
        setMensagemApi("");

    // Proteções para campos aninhados
    const faturamento = data.enderecoFaturamento || {};
    const sanitizeCep = (v) => (v ? String(v).replace(/\D/g, '') : '');
    const enderecoFaturamento = {
      cep: sanitizeCep(faturamento.cep),
      logradouro: faturamento.logradouro || '',
      numero: faturamento.numero || '',
      complemento: faturamento.complemento || '',
      bairro: faturamento.bairro || '',
      cidade: faturamento.cidade || '',
      uf: faturamento.uf || '',
      principal: true
    };

    const sanitizeEntrega = (e) => ({
      cep: sanitizeCep(e.cep),
      logradouro: e.logradouro || '',
      numero: e.numero || '',
      complemento: e.complemento || '',
      bairro: e.bairro || '',
      cidade: e.cidade || '',
      uf: e.uf || '',
      principal: e.principal || false
    });

    const enderecos = copiarFaturamentoParaEntrega
      ? [enderecoFaturamento]
      : enderecosEntrega.map(sanitizeEntrega);

    const dataToSend = {
      nomeCompleto: data.nomeCompleto || '',
      email: data.email || '',
      cpf: data.cpf ? String(data.cpf).replace(/\D/g, '') : '',
      dataNascimento: data.dataNascimento || '',
      genero: data.genero || '',
      senha: data.senha || '',
      telefone: data.telefone ? String(data.telefone).replace(/\D/g, '') : '',
      copiarFaturamentoParaEntrega: copiarFaturamentoParaEntrega,
      enderecoFaturamento: enderecoFaturamento,
      enderecosEntrega: enderecos
    };


        try {
      const response = await fetch("http://localhost:8080/auth/usuario/cadastrarUsuario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                setMensagemApi("Cadastro realizado com sucesso! Redirecionando...");
        setTimeout(() => navigate("/LoginPage"), 2000);
            } else {
                const erroTexto = await response.text();
                setMensagemApi(erroTexto || "Ocorreu um erro ao cadastrar.");
            }
        } catch {
            setMensagemApi("Não foi possível conectar ao servidor.");
        }
    };

    return (
      <div className="cadastro-bg">
        <button className="cadastro-back-btn" onClick={() => navigate("/login")} title="Voltar para login">
          <ArrowLeft />
        </button>
        <h1 className="cadastro-title-big">Cadastrar Novo Usuário</h1>
        <p className="cadastro-subtitle-center">
          Preencha os campos abaixo para criar sua conta
        </p>
        <div className="cadastro-card">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="cadastro-form-grid">
              <div className="cadastro-form-group">
                <label htmlFor="dataNascimento" className="cadastro-label">Data de Nascimento:</label>
                <input
                  type="date"
                  id="dataNascimento"
                  {...register("dataNascimento")}
                  className="cadastro-input"
                />
                {errors.dataNascimento && <p className="cadastro-error">{errors.dataNascimento.message}</p>}
              </div>

              <div className="cadastro-form-group">
                <label htmlFor="genero" className="cadastro-label">Gênero:</label>
                <select id="genero" {...register('genero')} className="cadastro-input">
                  <option value="">Selecione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
                {errors.genero && <p className="cadastro-error">{errors.genero.message}</p>}
              </div>

              <div className="cadastro-form-group">
                <label htmlFor="nomeCompleto" className="cadastro-label">Nome:</label>
                <input
                  type="text"
                  id="nomeCompleto"
                  {...register("nomeCompleto")}
                  className="cadastro-input"
                  placeholder="Nome completo"
                />
                {errors.nomeCompleto && <p className="cadastro-error">{errors.nomeCompleto.message}</p>}
              </div>

              {/* CORREÇÃO 3: Input de CPF atualizado */}
              <div className="cadastro-form-group">
                <label htmlFor="cpf" className="cadastro-label">CPF:</label>
                <input
                  type="text"
                  id="cpf"
                  {...register("cpf", {
                      onChange: handleCpfChange // Adiciona nosso manipulador
                  })}
                  className="cadastro-input"
                  placeholder="000.000.000-00"
                  maxLength="14" // Limita o tamanho do campo
                />
                {errors.cpf && <p className="cadastro-error">{errors.cpf.message}</p>}
              </div>
              
              <div className="cadastro-form-group">
                <label htmlFor="email" className="cadastro-label">Email:</label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="cadastro-input"
                  placeholder="email@exemplo.com"
                />
                {errors.email && <p className="cadastro-error">{errors.email.message}</p>}
              </div>
              
              <div className="cadastro-form-group">
                <label htmlFor="telefone" className="cadastro-label">Telefone:</label>
                <input
                  type="tel"
                  id="telefone"
                  {...register("telefone", {
                      onChange: handleTelefoneChange
                  })}
                  className="cadastro-input"
                  placeholder="(99) 99999-9999"
                  maxLength="15"
                />
                {errors.telefone && <p className="cadastro-error">{errors.telefone.message}</p>}
              </div>

              <div className="cadastro-form-group">
                <label htmlFor="senha" className="cadastro-label">Senha:</label>
                <input
                  type="password"
                  id="senha"
                  {...register("senha")}
                  className="cadastro-input"
                  placeholder="senha"
                />
                {errors.senha && <p className="cadastro-error">{errors.senha.message}</p>}
              </div>
              <div className="cadastro-form-group">
                <label htmlFor="confirmarSenha" className="cadastro-label">Confirmar senha:</label>
                <input
                  type="password"
                  id="confirmarSenha"
                  {...register("confirmarSenha")}
                  className="cadastro-input"
                  placeholder="Repita a senha"
                />
                {errors.confirmarSenha && <p className="cadastro-error">{errors.confirmarSenha.message}</p>}
              </div>

              {/* Endereço de Faturamento (obrigatório) */}
              <div className="cadastro-form-group cadastro-secao-endereco">
                <h3>Endereço de Faturamento (obrigatório)</h3>
                <label className="cadastro-label">CEP</label>
                <input
                  type="text"
                  {...register('enderecoFaturamento.cep')}
                  className="cadastro-input"
                  onBlur={(e) => buscarCep(e.target.value, 'faturamento')}
                />
                {errors.enderecoFaturamento?.cep && <p className="cadastro-error">{errors.enderecoFaturamento.cep.message}</p>}

                <label className="cadastro-label">Logradouro</label>
                <input type="text" {...register('enderecoFaturamento.logradouro')} className="cadastro-input" />
                {errors.enderecoFaturamento?.logradouro && <p className="cadastro-error">{errors.enderecoFaturamento.logradouro.message}</p>}

                <label className="cadastro-label">Número</label>
                <input type="text" {...register('enderecoFaturamento.numero')} className="cadastro-input" />
                {errors.enderecoFaturamento?.numero && <p className="cadastro-error">{errors.enderecoFaturamento.numero.message}</p>}

                <label className="cadastro-label">Complemento</label>
                <input type="text" {...register('enderecoFaturamento.complemento')} className="cadastro-input" />

                <label className="cadastro-label">Bairro</label>
                <input type="text" {...register('enderecoFaturamento.bairro')} className="cadastro-input" />
                {errors.enderecoFaturamento?.bairro && <p className="cadastro-error">{errors.enderecoFaturamento.bairro.message}</p>}

                <label className="cadastro-label">Cidade</label>
                <input type="text" {...register('enderecoFaturamento.cidade')} className="cadastro-input" />
                {errors.enderecoFaturamento?.cidade && <p className="cadastro-error">{errors.enderecoFaturamento.cidade.message}</p>}

                <label className="cadastro-label">UF</label>
                <input type="text" {...register('enderecoFaturamento.uf')} className="cadastro-input" maxLength={2} />
                {errors.enderecoFaturamento?.uf && <p className="cadastro-error">{errors.enderecoFaturamento.uf.message}</p>}
              </div>

              {/* Copiar faturamento para entrega */}
              <div className="cadastro-form-group">
                <label className="cadastro-label">Copiar faturamento para entrega</label>
                <input type="checkbox" checked={copiarFaturamentoParaEntrega} onChange={(e) => setCopiarFaturamentoParaEntrega(e.target.checked)} />
              </div>

              {/* Endereços de entrega (múltiplos) */}
              <div className="cadastro-form-group cadastro-secao-endereco">
                <h3>Endereços de Entrega</h3>
                {enderecosEntrega.map((end, idx) => (
                  <div key={idx} style={{ border: '1px solid #eee', padding: 8, marginBottom: 8 }}>
                    <label className="cadastro-label">CEP</label>
                    <input type="text" value={end.cep} onChange={(e) => handleEntregaChange(idx, 'cep', e.target.value)} onBlur={(e) => buscarCep(e.target.value, 'entrega', idx)} className="cadastro-input" />

                    <label className="cadastro-label">Logradouro</label>
                    <input type="text" value={end.logradouro} onChange={(e) => handleEntregaChange(idx, 'logradouro', e.target.value)} className="cadastro-input" />

                    <label className="cadastro-label">Número</label>
                    <input type="text" value={end.numero} onChange={(e) => handleEntregaChange(idx, 'numero', e.target.value)} className="cadastro-input" />

                    <label className="cadastro-label">Complemento</label>
                    <input type="text" value={end.complemento} onChange={(e) => handleEntregaChange(idx, 'complemento', e.target.value)} className="cadastro-input" />

                    <label className="cadastro-label">Bairro</label>
                    <input type="text" value={end.bairro} onChange={(e) => handleEntregaChange(idx, 'bairro', e.target.value)} className="cadastro-input" />

                    <label className="cadastro-label">Cidade</label>
                    <input type="text" value={end.cidade} onChange={(e) => handleEntregaChange(idx, 'cidade', e.target.value)} className="cadastro-input" />

                    <label className="cadastro-label">UF</label>
                    <input type="text" value={end.uf} onChange={(e) => handleEntregaChange(idx, 'uf', e.target.value)} className="cadastro-input" maxLength={2} />

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button type="button" onClick={() => handleRemoveEntrega(idx)} className="cadastro-btn small">Remover</button>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={handleAddEntrega} className="cadastro-btn small">Adicionar endereço de entrega</button>
              </div>
            </div>
            {mensagemApi && <p style={{ color: '#52658F', textAlign: 'center', marginTop: 12 }}>{mensagemApi}</p>}
            <button type="submit" disabled={isSubmitting} className="cadastro-btn">
              {isSubmitting ? "Cadastrando..." : "Salvar"}
            </button>
          </form>
        </div>
      </div>
    );
}

export default CadastroPage;