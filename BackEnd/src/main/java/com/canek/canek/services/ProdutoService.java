package com.canek.canek.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.canek.canek.repositories.ProdutoRepository;
import com.canek.canek.models.Produto;
import java.util.List;


@Service
public class ProdutoService {

   

    @Autowired
    private ProdutoRepository produtoRepository;

 

    // Aqui você pode adicionar métodos para manipular produtos, como criar, atualizar, listar, etc.    
     public Produto criarProduto(Produto produto) {

        return produtoRepository.save(produto);

     }

     public Produto atualizarProduto(Long id, Produto produtoAtualizado) {

        return produtoRepository.findById(id).map(produto -> {
            produto.setNome(produtoAtualizado.getNome());
            produto.setAvaliacao(produtoAtualizado.getAvaliacao());
            produto.setDscDetalhada(produtoAtualizado.getDscDetalhada());
            produto.setPreco(produtoAtualizado.getPreco());
            produto.setEstoque(produtoAtualizado.getEstoque());

            return produtoRepository.save(produto);
        }).orElseThrow(() -> new RuntimeException("Produto não encontrado com id: " + id));

    }
    
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }
}
