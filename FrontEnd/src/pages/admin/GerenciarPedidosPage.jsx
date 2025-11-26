import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Save } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../admin/css/UserManagementPage.css'; // Reutilizando CSS existente

function GerenciarPedidosPage() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Status disponíveis conforme a Sprint
    const statusOptions = [
        "AGUARDANDO_PAGAMENTO",
        "PAGAMENTO_REJEITADO",
        "PAGAMENTO_COM_SUCESSO",
        "AGUARDANDO_RETIRADA",
        "EM_TRANSITO",
        "ENTREGUE"
    ];

    useEffect(() => {
        fetchPedidos();
    }, []);

    const fetchPedidos = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch("http://localhost:8080/auth/pedidos/todos", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPedidos(data);
            }
        } catch (error) {
            console.error("Erro ao buscar pedidos", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (pedidoId, newStatus) => {
        if(!window.confirm(`Confirmar alteração para: ${newStatus}?`)) return;
        
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://localhost:8080/auth/pedidos/${pedidoId}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert("Status atualizado!");
                fetchPedidos(); // Recarrega a lista
            } else {
                alert("Erro ao atualizar status");
            }
        } catch (error) {
            alert("Erro de conexão");
        }
    };

    if (loading) return <LoadingSpinner message="Carregando Pedidos..." />;

    return (
        <div className="page-container">
            <div className="container">
                <div className="card">
                    <div className="card-header">
                        <div className="header-content">
                            <button onClick={() => navigate(-1)} className="back-button"><ArrowLeft /></button>
                            <div className="header-title">
                                <ClipboardList className="icon-md primary-color" />
                                <h1 className="page-title">Gerenciamento de Pedidos</h1>
                            </div>
                        </div>
                    </div>
                    <div className="card-content">
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Nº Pedido</th>
                                        <th>Data</th>
                                        <th>Cliente</th>
                                        <th>Total</th>
                                        <th>Status Atual</th>
                                        <th>Ação (Alterar Status)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pedidos.map((pedido) => (
                                        <tr key={pedido.id}>
                                            <td className="font-medium">#{pedido.numeroPedido}</td>
                                            <td className="text-gray">{new Date(pedido.dataCriacao).toLocaleDateString()}</td>
                                            <td className="text-gray">{pedido.usuario?.nomeCompleto}</td>
                                            <td className="text-gray">R$ {pedido.valorTotal.toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge ${pedido.status === 'ENTREGUE' ? 'status-active' : 'status-admin'}`}>
                                                    {pedido.status}
                                                </span>
                                            </td>
                                            <td>
                                                <select 
                                                    value={pedido.status} 
                                                    onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                                                    style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc'}}
                                                >
                                                    {statusOptions.map(status => (
                                                        <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GerenciarPedidosPage;