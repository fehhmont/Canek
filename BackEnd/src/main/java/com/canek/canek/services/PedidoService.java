package com.canek.canek.services;

import com.canek.canek.models.Pedido;
import com.canek.canek.models.PedidoProduto;
import com.canek.canek.models.Usuario;
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

    // Criar pedido com produtos
    public Pedido criarPedido(Usuario usuario, Pedido pedido, List<PedidoProduto> produtos) {
        pedido.setUsuario(usuario);

        // Inicializa status
        pedido.setStatus(com.canek.canek.models.enums.StatusPedido.AGUARDANDO_PAGAMENTO);

        // Calcula total dos produtos
        BigDecimal totalProdutos = produtos.stream()
                .map(PedidoProduto::getPrecoTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        pedido.setTotalProdutos(totalProdutos);

        // Valor total = produtos + frete
        if (pedido.getTotalFrete() == null) {
            pedido.setTotalFrete(BigDecimal.ZERO);
        }
        pedido.setValorTotal(totalProdutos.add(pedido.getTotalFrete()));

        // Salva pedido para gerar ID
        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        // Gera número sequencial baseado no ID
        pedidoSalvo.setNumeroPedido(String.format("%08d", pedidoSalvo.getId()));

        // Associa produtos ao pedido
        for (PedidoProduto item : produtos) {
            item.setPedido(pedidoSalvo);
        }
        pedidoSalvo.setProdutos(produtos);

     
        return pedidoRepository.save(pedidoSalvo);
    }

   
    public Pedido finalizarPedido(Pedido pedido) {
        pedido.setStatus(com.canek.canek.models.enums.StatusPedido.ENTREGUE);
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
}
