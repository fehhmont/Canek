package com.canek.canek.services;

import com.canek.canek.dtos.FreteDTO;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.canek.canek.repositories.ImagemProdutoRepository;
import com.canek.canek.repositories.ProdutoRepository;
import com.canek.canek.models.Produto;
import com.canek.canek.models.ImagemProduto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class ProdutoService {

    private final ImagemProdutoRepository imagemProdutoRepository;
    private final Random random = new Random(); // Adicionado para o cálculo de frete

    @Autowired
    private ProdutoRepository produtoRepository;

    ProdutoService(ImagemProdutoRepository imagemProdutoRepository) {
        this.imagemProdutoRepository = imagemProdutoRepository;
    }

    // Métodos existentes do produto...
     public Produto criarProdutoComImagens(Produto produto, List<ImagemProduto> imagem) {
        Produto produtoSalvo = produtoRepository.save(produto);
        for (ImagemProduto imagens : imagem) {
            imagens.setProduto(produtoSalvo);
            imagemProdutoRepository.save(imagens);
        }
        return produtoSalvo;
     }

     public Produto atualizarProduto(Long id, Produto produtoAtualizado) {
        return produtoRepository.findById(id).map(produto -> {
            produto.setNome(produtoAtualizado.getNome());
            produto.setAvaliacao(produtoAtualizado.getAvaliacao());
            produto.setDescricao(produtoAtualizado.getDescricao());
            produto.setPreco(produtoAtualizado.getPreco());
            produto.setEstoque(produtoAtualizado.getEstoque());
            produto.getImagens().clear();
            if (produtoAtualizado.getImagens() != null) {
                for (ImagemProduto novaImagem : produtoAtualizado.getImagens()) {
                    novaImagem.setProduto(produto);
                    produto.getImagens().add(novaImagem);
                }
            }
            return produtoRepository.save(produto);
        }).orElseThrow(() -> new RuntimeException("Produto não encontrado com id: " + id));
    }
    
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    public List<Produto> listarPorNome(String nome) {
        return produtoRepository.findByNomeContainingIgnoreCase(nome);
    }

    public List<Produto> listarPorStatus(Boolean status) {
        return produtoRepository.findByStatus(status);
    }

    public Optional<Produto> findById(Long id) {
        return produtoRepository.findById(id);
    }

    public Produto alterarStatus(Long id) {
        Produto prod = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto com ID " + id + " não encontrado."));
        prod.setStatus(Boolean.FALSE.equals(prod.getStatus()));
        return produtoRepository.save(prod);
    }

    // --- LÓGICA DE FRETE MOVIDA PARA CÁ ---
    public List<FreteDTO> calcularFrete(String cep) {
        List<FreteDTO> opcoesFrete = new ArrayList<>();
        opcoesFrete.add(criarOpcaoFrete("Correios", 10.0, 25.0, 5, 10));
        opcoesFrete.add(criarOpcaoFrete("Correios Flash", 20.0, 45.0, 1, 3));
        opcoesFrete.add(criarOpcaoFrete("Loggi", 15.0, 35.0, 2, 5));
        return opcoesFrete;
    }

    private FreteDTO criarOpcaoFrete(String transportadora, double minValor, double maxValor, int minPrazo, int maxPrazo) {
        BigDecimal valor = BigDecimal.valueOf(minValor + (maxValor - minValor) * random.nextDouble()).setScale(2, BigDecimal.ROUND_HALF_UP);
        int prazo = minPrazo + random.nextInt((maxPrazo - minPrazo) + 1);
        String prazoEstimado = "Entre " + prazo + " e " + (prazo + 2) + " dias úteis";
        
        return new FreteDTO(transportadora, valor, prazoEstimado);
    }
}