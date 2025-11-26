import React from 'react';
import { X, Package, MapPin, CreditCard } from 'lucide-react';
import './OrderDetailsModal.css';

const OrderDetailsModal = ({ pedido, onClose }) => {
    if (!pedido) return null;

    // Formatação de moeda
    const formatPrice = (price) => `R$ ${Number(price).toFixed(2).replace('.', ',')}`;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '700px'}}>
                <button className="modal-close-btn" onClick={onClose}><X size={24} /></button>
                
                <h2 style={{marginBottom: '20px', color: '#52658F'}}>Detalhes do Pedido #{pedido.numeroPedido}</h2>
                
                <div style={{display: 'grid', gap: '20px'}}>
                    {/* Lista de Produtos */}
                    <div className="resumo-section">
                        <h4 style={{borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px'}}>Itens do Pedido</h4>
                        {pedido.produtos.map((item) => (
                            <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                                <span>{item.quantidade}x {item.produto.nome}</span>
                                <span>{formatPrice(item.precoTotal)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Endereço */}
                    <div className="resumo-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '5px', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px'}}>
                            <MapPin size={18} /> Endereço de Entrega
                        </h4>
                        <p>{pedido.endereco.logradouro}, {pedido.endereco.numero}</p>
                        <p>{pedido.endereco.bairro} - {pedido.endereco.cidade}/{pedido.endereco.estado}</p>
                        <p>CEP: {pedido.endereco.cep}</p>
                    </div>

                    {/* Pagamento e Totais */}
                    <div className="resumo-section" style={{backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px'}}>
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px'}}>
                            <CreditCard size={18} /> Resumo Financeiro
                        </h4>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span>Forma de Pagamento:</span>
                            <strong>{pedido.formaPagamento}</strong>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '5px'}}>
                            <span>Total Produtos:</span>
                            <span>{formatPrice(pedido.totalProdutos)}</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <span>Frete:</span>
                            <span>{formatPrice(pedido.totalFrete)}</span>
                        </div>
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '1.2em', fontWeight: 'bold', color: '#52658F'}}>
                            <span>Total Geral:</span>
                            <span>{formatPrice(pedido.valorTotal)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;