package com.canek.canek.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.canek.canek.repositories.ImagemProdutoRepository;
import com.canek.canek.repositories.ProdutoRepository;
import com.canek.canek.models.Produto;
import com.canek.canek.models.ImagemProduto;
import java.util.List;


@Service
public class ProdutoService {

    private final ImagemProdutoRepository imagemProdutoRepository;

   

    @Autowired
    private ProdutoRepository produtoRepository;


    ProdutoService(ImagemProdutoRepository imagemProdutoRepository) {
        this.imagemProdutoRepository = imagemProdutoRepository;
    }

 

    // Aqui você pode adicionar métodos para manipular produtos, como criar, atualizar, listar, etc.    
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
            produto.setImagens(produtoAtualizado.getImagens());
            return produtoRepository.save(produto);
        }).orElseThrow(() -> new RuntimeException("Produto não encontrado com id: " + id));

    }
    
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    public List<Produto> listarPorNome(String nome) {
        return produtoRepository.findByNomeContainingIgnoreCase(nome);
    }
}
