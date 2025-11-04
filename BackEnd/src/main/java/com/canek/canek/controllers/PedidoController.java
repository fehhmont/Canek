package com.canek.canek.controllers;

import com.canek.canek.dtos.FreteDTO;
import com.canek.canek.models.*;
import com.canek.canek.models.enums.FormaPagamento;
import com.canek.canek.models.enums.StatusPedido;
import com.canek.canek.repositories.PedidoRepository;
import com.canek.canek.repositories.ProdutoRepository;
import com.canek.canek.repositories.UsuarioRepository;
import com.canek.canek.services.PedidoService;
import com.canek.canek.services.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/auth/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private ProdutoService produtoService;

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;


    @PostMapping("/carrinho")
    public Pedido criarCarrinho(@RequestBody List<Map<String, Object>> itens) {
        Pedido pedido = new Pedido();
        pedido.setStatus(StatusPedido.AGUARDANDO_PAGAMENTO);
        pedido.setTotalFrete(BigDecimal.ZERO);

        List<PedidoProduto> produtos = new ArrayList<>();
        BigDecimal totalProdutos = BigDecimal.ZERO;

        for (Map<String, Object> item : itens) {
            Long produtoId = Long.parseLong(item.get("produtoId").toString());
            Integer quantidade = Integer.parseInt(item.get("quantidade").toString());

            Produto produto = produtoRepository.findById(produtoId)
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            PedidoProduto pedidoProduto = new PedidoProduto();
            pedidoProduto.setProduto(produto);
            pedidoProduto.setQuantidade(quantidade);
            pedidoProduto.setPrecoUnitario(produto.getPreco());
            pedidoProduto.calcularPrecoTotal();

            produtos.add(pedidoProduto);
            totalProdutos = totalProdutos.add(pedidoProduto.getPrecoTotal());
        }

        pedido.setProdutos(produtos);
        pedido.setTotalProdutos(totalProdutos);
        pedido.setValorTotal(totalProdutos);

        Pedido salvo = pedidoRepository.save(pedido);
        salvo.setNumeroPedido(String.format("%08d", salvo.getId()));
        return pedidoRepository.save(salvo);
    }

    @PutMapping("/{pedidoId}/endereco/{usuarioId}")
    public Map<String, Object> escolherEndereco(
            @PathVariable Long pedidoId,
            @PathVariable Long usuarioId,
            @RequestBody Endereco endereco) {

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        pedido.setUsuario(usuario);
        pedido.setEndereco(endereco);
        pedido.setStatus(StatusPedido.AGUARDANDO_PAGAMENTO);

        // Calcula opções de frete pelo CEP
        List<FreteDTO> opcoesFrete = produtoService.calcularFrete(endereco.getCep());

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("pedido", pedido);
        resposta.put("opcoesFrete", opcoesFrete);

        pedidoRepository.save(pedido);
        return resposta;
    }

    @PutMapping("/{pedidoId}/finalizar")
    public Pedido finalizarPedido(
            @PathVariable Long pedidoId,
            @RequestParam FormaPagamento formaPagamento) {

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        pedido.setFormaPagamento(formaPagamento);
        pedido.setStatus(StatusPedido.PAGO);
        return pedidoRepository.save(pedido);
    }
}
