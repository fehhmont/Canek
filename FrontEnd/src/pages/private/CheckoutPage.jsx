// Arquivo: FrontEnd/src/pages/private/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { useCart } from '../../components/CartContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { buscarCep } from '../../utils/cepService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MapPin, CreditCard, CheckCircle, Plus, X, ArrowLeft, ArrowRight, DollarSign } from 'lucide-react'; // Importar DollarSign
import './css/CheckoutPage.css';

// ... (Esquemas de validação permanecem os mesmos) ...
const newAddressSchema = yup.object().shape({
    cep: yup.string().required('CEP é obrigatório'),
    logradouro: yup.string().required('Logradouro é obrigatório'),
    numero: yup.string().required('Número é obrigatório'),
    complemento: yup.string().nullable().optional(),
    bairro: yup.string().required('Bairro é obrigatório'),
    cidade: yup.string().required('Cidade é obrigatória'),
    uf: yup.string().required('UF é obrigatória'),
});

const cardSchema = yup.object().shape({
    numeroCartao: yup.string().required('Número do cartão é obrigatório').matches(/^\d{16}$/, 'Número deve ter 16 dígitos'),
    nomeCompleto: yup.string().required('Nome no cartão é obrigatório'),
    dataVencimento: yup.string().required('Data de vencimento é obrigatória').matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato MM/AA inválido'),
    cvv: yup.string().required('CVV é obrigatório').matches(/^\d{3,4}$/, 'CVV deve ter 3 ou 4 dígitos'),
    parcelas: yup.number().min(1).required('Selecione as parcelas'),
});


function CheckoutPage() {
    // ... (Estados permanecem os mesmos) ...
    const [step, setStep] = useState('endereco'); // endereco -> pagamento -> resumo -> sucesso
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [pedido, setPedido] = useState(null);
    const [userData, setUserData] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);
    
    const { user } = useAuth();
    const { cart, getSubtotal, getFrete, getTotal, clearCart, setShippingOption } = useCart();
    const navigate = useNavigate();

    const { register: registerAddress, handleSubmit: handleSubmitAddress, reset: resetAddress, setValue: setValueAddress, formState: { errors: errorsAddress } } = useForm({ resolver: yupResolver(newAddressSchema) });
    const { register: registerCard, handleSubmit: handleSubmitCard, formState: { errors: errorsCard } } = useForm({ resolver: yupResolver(cardSchema), defaultValues: { parcelas: 1 } });

    // ... (useEffect de buscar dados permanece o mesmo) ...
     useEffect(() => {
        if (!user) return navigate('/login'); 
        if (cart.length === 0) return navigate('/carrinho'); 

        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('userToken');
            try {
                const response = await fetch(`http://localhost:8080/auth/usuario/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao buscar dados do usuário.');
                const data = await response.json();
                setUserData(data); 
                
                const principal = data.enderecos?.find(e => e.tipoEndereco === 'ENTREGA' && e.principal);
                if (principal) {
                    setSelectedAddress(principal);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user, navigate, cart]);


    // --- FUNÇÃO 'handleAddressSubmit' MODIFICADA ---
    const handleAddressSubmit = async () => {
        if (!selectedAddress) {
            setError("Selecione um endereço de entrega.");
            return;
        }
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('userToken');
        
        try {
            // 1. Preparar o payload único
            const cartPayload = cart.map(item => ({
                produtoId: item.id,
                quantidade: item.quantity
            }));

            const pedidoCompletoDTO = {
                usuarioId: userData.id,
                enderecoId: selectedAddress.id,
                itens: cartPayload
            };

            // 2. Fazer UMA ÚNICA chamada para criar o pedido
            const response = await fetch("http://localhost:8080/auth/pedidos/carrinho", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(pedidoCompletoDTO)
            });

            if (!response.ok) {
                 const errText = await response.text();
                 console.error("Erro do backend:", errText);
                 throw new Error("Falha ao criar o pedido e calcular o frete.");
            }
            
            const { pedido: pedidoAtualizado, opcoesFrete } = await response.json();

            // 3. Atualizar o carrinho com o frete
            const freteEscolhido = opcoesFrete?.[0];
            if (freteEscolhido) {
                setShippingOption(freteEscolhido.valor);
            }

            setPedido(pedidoAtualizado);
            setStep('pagamento');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ... (handlePaymentSubmit, handleFinalizarPedido, handleCepBlur, handleAddNewAddress e a renderização permanecem os mesmos) ...
    // ... (exceto pela adição da opção "DINHEIRO") ...
    
    // (O resto do ficheiro permanece igual ao que enviei anteriormente)
    // ...
    const handlePaymentSubmit = (cardData) => {
        if (paymentMethod === 'CARTAO') {
            console.log("Dados do Cartão:", cardData);
        }
        setStep('resumo');
    };

    const handleFinalizarPedido = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('userToken');

        try {
            const response = await fetch(`http://localhost:8080/auth/pedidos/${pedido.id}/finalizar?formaPagamento=${paymentMethod}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Falha ao finalizar o pedido.");
            
            const pedidoFinalizado = await response.json();
            setPedido(pedidoFinalizado);
            clearCart();
            setShippingOption(0);
            setStep('sucesso');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCepBlur = async (e) => {
        const cep = e.target.value;
        try {
            const data = await buscarCep(cep);
            setValueAddress('logradouro', data.logradouro || '');
            setValueAddress('bairro', data.bairro || '');
            setValueAddress('cidade', data.localidade || '');
            setValueAddress('uf', data.uf || '');
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleAddNewAddress = async (data) => {
        setLoading(true);
        const token = localStorage.getItem('userToken');
        try {
            const response = await fetch(`http://localhost:8080/auth/usuario/${userData.id}/enderecos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error("Falha ao adicionar novo endereço.");
            const novoEndereco = await response.json();
            
            setUserData(prev => ({ ...prev, enderecos: [...prev.enderecos, novoEndereco] }));
            setSelectedAddress(novoEndereco);
            setShowAddAddressForm(false);
            resetAddress();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && step === 'endereco' && !userData) {
        return <div className="checkout-bg"><LoadingSpinner message="Carregando seu perfil..." /></div>;
    }

    const formatCep = (cep) => cep?.replace(/^(\d{5})(\d{3})$/, '$1-$2');
    const enderecosEntrega = userData?.enderecos.filter(e => e.tipoEndereco === 'ENTREGA') || [];
    // ...
    return (
        <div className="checkout-bg">
            <div className="checkout-card">
                {loading && <LoadingSpinner message="Processando..." />}
                <h1 className="checkout-title">Finalizar Compra</h1>
                
                {/* Indicador de Etapas */}
                <div className="step-indicator">
                    <div className={`step ${step === 'endereco' ? 'active' : (step !== 'endereco' ? 'completed' : '')}`}>
                        <MapPin /> <span>Endereço</span>
                    </div>
                    <div className={`step ${step === 'pagamento' ? 'active' : (step === 'resumo' || step === 'sucesso' ? 'completed' : '')}`}>
                        <CreditCard /> <span>Pagamento</span>
                    </div>
                    <div className={`step ${step === 'resumo' ? 'active' : (step === 'sucesso' ? 'completed' : '')}`}>
                        <CheckCircle /> <span>Resumo</span>
                    </div>
                </div>

                {error && <p className="checkout-error">{error}</p>}

                {/* ETAPA 1: ENDEREÇO */}
                {step === 'endereco' && (
                    <div className="checkout-step-content">
                        <h3>1. Selecione o Endereço de Entrega</h3>
                        <div className="address-list">
                            {enderecosEntrega.length > 0 ? (
                                enderecosEntrega.map(addr => (
                                    <label key={addr.id} className={`address-option ${selectedAddress?.id === addr.id ? 'selected' : ''}`}>
                                        <input 
                                            type="radio" 
                                            name="endereco" 
                                            checked={selectedAddress?.id === addr.id}
                                            onChange={() => setSelectedAddress(addr)}
                                        />
                                        <div className="address-details">
                                            {addr.principal && <span className="badge">Padrão</span>}
                                            <p>{addr.logradouro}, {addr.numero} {addr.complemento ? `(${addr.complemento})` : ''}</p>
                                            <p>{addr.bairro} - {addr.cidade}/{addr.estado}</p>
                                            <p>CEP: {formatCep(addr.cep)}</p>
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <p>Nenhum endereço de entrega cadastrado.</p>
                            )}
                        </div>

                        <button type="button" className="btn-add-address" onClick={() => setShowAddAddressForm(prev => !prev)}>
                            {showAddAddressForm ? <X size={16} /> : <Plus size={16} />}
                            {showAddAddressForm ? 'Cancelar' : 'Adicionar Novo Endereço'}
                        </button>

                        {showAddAddressForm && (
                            <form onSubmit={handleSubmitAddress(handleAddNewAddress)} className="address-form">
                                <input type="text" placeholder="CEP" {...registerAddress('cep')} onBlur={handleCepBlur} />
                                {errorsAddress.cep && <p className="form-error">{errorsAddress.cep.message}</p>}
                                <input type="text" placeholder="Logradouro" {...registerAddress('logradouro')} />
                                {errorsAddress.logradouro && <p className="form-error">{errorsAddress.logradouro.message}</p>}
                                <input type="text" placeholder="Número" {...registerAddress('numero')} />
                                {errorsAddress.numero && <p className="form-error">{errorsAddress.numero.message}</p>}
                                <input type="text" placeholder="Complemento (Opcional)" {...registerAddress('complemento')} />
                                <input type="text" placeholder="Bairro" {...registerAddress('bairro')} />
                                {errorsAddress.bairro && <p className="form-error">{errorsAddress.bairro.message}</p>}
                                <input type="text" placeholder="Cidade" {...registerAddress('cidade')} />
                                {errorsAddress.cidade && <p className="form-error">{errorsAddress.cidade.message}</p>}
                                <input type="text" placeholder="UF" {...registerAddress('uf')} maxLength={2} />
                                {errorsAddress.uf && <p className="form-error">{errorsAddress.uf.message}</p>}
                                <button type="submit" className="btn-primary">Salvar Endereço</button>
                            </form>
                        )}
                        
                        <div className="checkout-nav">
                            <button onClick={handleAddressSubmit} disabled={!selectedAddress || loading} className="btn-primary">
                                Ir para Pagamento <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ETAPA 2: PAGAMENTO */}
                {step === 'pagamento' && (
                    <div className="checkout-step-content">
                        <h3>2. Escolha a Forma de Pagamento</h3>
                        <div className="payment-options">
                            <label className={`payment-option ${paymentMethod === 'BOLETO' ? 'selected' : ''}`}>
                                <input type="radio" name="pagamento" value="BOLETO" onChange={(e) => setPaymentMethod(e.target.value)} />
                                Boleto Bancário
                            </label>
                            <label className={`payment-option ${paymentMethod === 'CARTAO' ? 'selected' : ''}`}>
                                <input type="radio" name="pagamento" value="CARTAO" onChange={(e) => setPaymentMethod(e.target.value)} />
                                Cartão de Crédito
                            </label>
                            {/* --- ADICIONADO PAGAMENTO EM DINHEIRO --- */}
                            <label className={`payment-option ${paymentMethod === 'DINHEIRO' ? 'selected' : ''}`}>
                                <input type="radio" name="pagamento" value="DINHEIRO" onChange={(e) => setPaymentMethod(e.target.value)} />
                                <DollarSign size={18} style={{marginRight: "8px"}} />
                                Dinheiro
                            </label>
                        </div>

                        {paymentMethod === 'CARTAO' && (
                            <form id="payment-form" onSubmit={handleSubmitCard(handlePaymentSubmit)} className="card-form">
                                <input type="text" placeholder="Número do Cartão (16 dígitos)" {...registerCard('numeroCartao')} />
                                {errorsCard.numeroCartao && <p className="form-error">{errorsCard.numeroCartao.message}</p>}
                                <input type="text" placeholder="Nome Completo (como no cartão)" {...registerCard('nomeCompleto')} />
                                {errorsCard.nomeCompleto && <p className="form-error">{errorsCard.nomeCompleto.message}</p>}
                                <div className="form-row">
                                    <input type="text" placeholder="Vencimento (MM/AA)" {...registerCard('dataVencimento')} />
                                    <input type="text" placeholder="CVV" {...registerCard('cvv')} />
                                </div>
                                {errorsCard.dataVencimento && <p className="form-error">{errorsCard.dataVencimento.message}</p>}
                                {errorsCard.cvv && <p className="form-error">{errorsCard.cvv.message}</p>}
                                <select {...registerCard('parcelas')}>
                                    <option value="1">1x de R$ {getTotal().toFixed(2)}</option>
                                    <option value="2">2x de R$ {(getTotal() / 2).toFixed(2)}</option>
                                    <option value="3">3x de R$ {(getTotal() / 3).toFixed(2)}</option>
                                </select>
                            </form>
                        )}

                        <div className="checkout-nav space-between">
                            <button onClick={() => { setStep('endereco'); setShippingOption(0); }} className="btn-secondary">
                                <ArrowLeft size={18} /> Voltar (Endereço)
                            </button>
                            <button 
                                type={paymentMethod === 'CARTAO' ? 'submit' : 'button'}
                                form={paymentMethod === 'CARTAO' ? 'payment-form' : undefined}
                                onClick={(paymentMethod === 'BOLETO' || paymentMethod === 'DINHEIRO') ? () => setStep('resumo') : undefined}
                                disabled={!paymentMethod} 
                                className="btn-primary"
                            >
                                Revisar Pedido <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ETAPA 3: RESUMO */}
                {step === 'resumo' && (
                    <div className="checkout-step-content">
                        <h3>3. Resumo do Pedido</h3>
                        <div className="resumo-section">
                            <h4>Produtos</h4>
                            {cart.map(item => (
                                <div key={item.id} className="resumo-item">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="resumo-section">
                            <h4>Valores</h4>
                            <div className="resumo-item">
                                <span>Subtotal:</span>
                                <span>R$ {getSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="resumo-item">
                                <span>Frete:</span>
                                <span>R$ {getFrete().toFixed(2)}</span>
                            </div>
                            <div className="resumo-item total">
                                <span>Total:</span>
                                <span>R$ {getTotal().toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="resumo-section">
                            <h4>Entrega</h4>
                            <div className="address-details">
                                <p>{selectedAddress.logradouro}, {selectedAddress.numero}</p>
                                <p>{selectedAddress.bairro} - {selectedAddress.cidade}/{selectedAddress.estado}</p>
                            </div>
                        </div>
                         <div className="resumo-section">
                            <h4>Pagamento</h4>
                            <p>{paymentMethod === 'CARTAO' ? 'Cartão de Crédito' : (paymentMethod === 'DINHEIRO' ? 'Dinheiro' : 'Boleto Bancário')}</p>
                        </div>

                        <div className="checkout-nav space-between">
                            <button onClick={() => setStep('pagamento')} className="btn-secondary">
                                <ArrowLeft size={18} /> Voltar (Pagamento)
                            </button>
                            <button onClick={handleFinalizarPedido} disabled={loading} className="btn-primary">
                                {loading ? "Finalizando..." : "Concluir Compra"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ETAPA 4: SUCESSO */}
                {step === 'sucesso' && (
                    <div className="checkout-step-content success-step">
                        <CheckCircle size={60} className="success-icon" />
                        <h3>Pedido realizado com sucesso!</h3>
                        <p>Obrigado pela sua compra.</p>
                        <p>O número do seu pedido é: <strong>{pedido?.numeroPedido}</strong></p>
                        <p>Valor Total: <strong>R$ {pedido?.valorTotal.toFixed(2)}</strong></p>
                        <button onClick={() => navigate('/')} className="btn-primary">
                            Voltar para a Página Inicial
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default CheckoutPage;