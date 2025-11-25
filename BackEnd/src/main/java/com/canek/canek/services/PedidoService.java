package com.canek.canek.services;

import com.canek.canek.models.Pedido;
import com.canek.canek.models.PedidoProduto;
import com.canek.canek.models.Usuario;
import com.canek.canek.models.enums.StatusPedido;
import com.canek.canek.repositories.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

 
    public Pedido criarPedidoEtapa1(Usuario usuario, Pedido pedido, List<PedidoProduto> produtos) {
        pedido.setUsuario(usuario);
        pedido.setStatus(StatusPedido.AGUARDANDO_PAGAMENTO);

        // Calcula total dos produtos
        BigDecimal totalProdutos = produtos.stream()
                .map(PedidoProduto::getPrecoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        pedido.setTotalProdutos(totalProdutos);

        if (pedido.getTotalFrete() == null) {
            pedido.setTotalFrete(BigDecimal.ZERO);
        }

        pedido.setValorTotal(totalProdutos.add(pedido.getTotalFrete()));

        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        pedidoSalvo.setNumeroPedido(String.format("%08d", pedidoSalvo.getId()));

        for (PedidoProduto item : produtos) {
            item.setPedido(pedidoSalvo);
        }
        pedidoSalvo.setProdutos(produtos);

        return pedidoRepository.save(pedidoSalvo);
    }

   
    public Pedido definirPagamentoEPFinalizar(Long pedidoId, Pedido dadosAtualizados) {
        Pedido pedido = buscarPorId(pedidoId);

        if (dadosAtualizados.getFormaPagamento() == null) {
            throw new RuntimeException("Forma de pagamento é obrigatória para finalizar o pedido.");
        }

        pedido.setFormaPagamento(dadosAtualizados.getFormaPagamento());
        pedido.setStatus(StatusPedido.PAGO);
        pedido.setDataConclusao(LocalDateTime.now());

        return pedidoRepository.save(pedido);
    }

    
    public List<Pedido> listarPorUsuario(Usuario usuario) {
        return pedidoRepository.findByUsuarioId(usuario.getId());
    }

   
    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
    }

    public List<Pedido> listarTodosPedidos() {
         return pedidoRepository.findAllByOrderByDataCriacaoDesc();
    }

public Pedido alterarStatus(Long pedidoId, StatusPedido status) {
        Pedido pedido = buscarPorId(pedidoId);
        pedido.setStatus(status);
        return pedidoRepository.save(pedido);
    }
}
