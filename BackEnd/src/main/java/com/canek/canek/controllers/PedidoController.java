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

import jakarta.validation.Valid;

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
            
            // --- ALTERAÇÃO AQUI ---
            // 1. Defina o pai (Pedido) no filho (PedidoProduto) IMEDIATAMENTE
            pedidoProduto.setPedido(pedido);
            // --- FIM DA ALTERAÇÃO ---

            produtos.add(pedidoProduto);
            totalProdutos = totalProdutos.add(produto.getPreco().multiply(BigDecimal.valueOf(quantidade)));
        }

        pedido.setProdutos(produtos); // Define a lista de filhos no pai
        pedido.setTotalProdutos(totalProdutos);
        
        List<FreteDTO> opcoesFrete = produtoService.calcularFrete(endereco.getCep());
        
        if (!opcoesFrete.isEmpty()) {
            pedido.setTotalFrete(opcoesFrete.get(0).valor());
        }

        pedido.setValorTotal(totalProdutos.add(pedido.getTotalFrete()));

        // --- ALTERAÇÃO AQUI ---
        // 2. Salve o pedido (pai) UMA SÓ VEZ.
        // O CascadeType.ALL irá salvar os filhos (PedidoProduto) automaticamente,
        // e como já definimos o 'pedido' neles, o 'pedido_id' não será nulo.
        Pedido pedidoSalvo = pedidoRepository.save(pedido);
        
        // 3. Defina o número do pedido e salve novamente (apenas para atualizar esta coluna)
        pedidoSalvo.setNumeroPedido(String.format("%08d", pedidoSalvo.getId()));
        Pedido pedidoFinal = pedidoRepository.save(pedidoSalvo);
        // --- FIM DA ALTERAÇÃO ---

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("pedido", pedidoFinal);
        resposta.put("opcoesFrete", opcoesFrete);
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