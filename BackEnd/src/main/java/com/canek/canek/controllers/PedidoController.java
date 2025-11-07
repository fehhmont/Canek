package com.canek.canek.controllers;

import com.canek.canek.dtos.CriarPedidoDTO;
import com.canek.canek.dtos.FreteDTO;
import com.canek.canek.models.*;
import com.canek.canek.models.enums.FormaPagamento;
import com.canek.canek.models.enums.StatusPedido;
import com.canek.canek.repositories.PedidoRepository;
import com.canek.canek.repositories.ProdutoRepository;
import com.canek.canek.repositories.UsuarioRepository;
import com.canek.canek.services.PedidoService;
import com.canek.canek.services.ProdutoService;
import com.canek.canek.services.UsuarioService; // Importei

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // Importei
import org.springframework.security.core.annotation.AuthenticationPrincipal; // Importei
import org.springframework.security.core.userdetails.UserDetails; // Importei
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

    @Autowired
    private UsuarioService usuarioService; // Injetei

    @GetMapping("/meus-pedidos")
    public ResponseEntity<List<Pedido>> getMeusPedidos(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Usuario usuario = usuarioService.getUsuarioByEmail(userDetails.getUsername());
            List<Pedido> pedidos = pedidoService.listarPorUsuario(usuario);
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }


    @PostMapping("/carrinho")
    public Map<String, Object> criarCarrinho(@RequestBody @Valid CriarPedidoDTO pedidoDTO) {
        
        Usuario usuario = usuarioRepository.findById(pedidoDTO.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        Endereco endereco = usuario.getEnderecos().stream()
                .filter(e -> e.getId().equals(pedidoDTO.enderecoId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Endereço não pertence ao usuário ou não foi encontrado"));

        Pedido pedido = new Pedido();
        pedido.setStatus(StatusPedido.AGUARDANDO_PAGAMENTO);
        pedido.setTotalFrete(BigDecimal.ZERO);
        pedido.setUsuario(usuario);
        pedido.setEndereco(endereco);

        List<PedidoProduto> produtos = new ArrayList<>();
        BigDecimal totalProdutos = BigDecimal.ZERO;

        for (Map<String, Object> item : pedidoDTO.itens()) {
            Long produtoId = Long.parseLong(item.get("produtoId").toString());
            Integer quantidade = Integer.parseInt(item.get("quantidade").toString());

            Produto produto = produtoRepository.findById(produtoId)
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

            PedidoProduto pedidoProduto = new PedidoProduto();
            pedidoProduto.setProduto(produto);
            pedidoProduto.setQuantidade(quantidade);
            pedidoProduto.setPrecoUnitario(produto.getPreco());
            
            pedidoProduto.setPedido(pedido);

            produtos.add(pedidoProduto);
            totalProdutos = totalProdutos.add(produto.getPreco().multiply(BigDecimal.valueOf(quantidade)));
        }

        pedido.setProdutos(produtos); 
        pedido.setTotalProdutos(totalProdutos);
        
        List<FreteDTO> opcoesFrete = produtoService.calcularFrete(endereco.getCep());
        
        if (!opcoesFrete.isEmpty()) {
            pedido.setTotalFrete(opcoesFrete.get(0).valor());
        }

        pedido.setValorTotal(totalProdutos.add(pedido.getTotalFrete()));

        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        
        pedidoSalvo.setNumeroPedido(String.format("%08d", pedidoSalvo.getId()));
        Pedido pedidoFinal = pedidoRepository.save(pedidoSalvo);

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("pedido", pedidoFinal);
        resposta.put("opcoesFrete", opcoesFrete);
        return resposta;
    }


    // --- MÉTODO ATUALIZADO ---
    @PutMapping("/{pedidoId}/finalizar")
    public Pedido finalizarPedido(
            @PathVariable Long pedidoId,
            @RequestParam FormaPagamento formaPagamento,
            // 1. Recebe os totais finais via RequestBody
            @RequestBody Map<String, BigDecimal> totals) {

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        BigDecimal totalFrete = totals.get("totalFrete");
        BigDecimal valorTotal = totals.get("valorTotal");

        pedido.setFormaPagamento(formaPagamento);
        pedido.setStatus(StatusPedido.PAGO);

        // 2. Atualiza os totais do pedido com os valores recebidos
        if (totalFrete != null) {
            pedido.setTotalFrete(totalFrete);
        }
        if (valorTotal != null) {
            pedido.setValorTotal(valorTotal);
        }

        return pedidoRepository.save(pedido);
    }
}