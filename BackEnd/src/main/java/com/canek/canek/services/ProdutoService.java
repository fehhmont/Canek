package com.canek.canek.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.canek.canek.models.Produto;
import com.canek.canek.repositories.ProdutoRepository;


@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Produto> ListarTodos(){
        return produtoRepository.findAll();
    }

    // busca produto por id
    public Optional<Produto> buscarPorId(Long id){

        return produtoRepository.findById(id);
   
    }

    public Produto salvar(Produto produto){
        return produtoRepository.save(produto);
    }

    public void deletar(Long id){
        produtoRepository.deleteById(id);
    }
    public Optional<Produto> atualizar(Long id, Produto produtoAtualizado) {
    // 1. Tenta encontrar o produto existente pelo ID
    return produtoRepository.findById(id)
        .map(produtoExistente -> { // 2. Se encontrar...
            // 3. Atualiza os campos do produto existente com os dados do novo produto
            produtoExistente.setNome(produtoAtualizado.getNome());
            produtoExistente.setDescricao(produtoAtualizado.getDescricao());
            produtoExistente.setPreco(produtoAtualizado.getPreco());
            produtoExistente.setSku(produtoAtualizado.getSku());
            produtoExistente.setStatus(produtoAtualizado.getStatus());
            // 4. Salva o produto atualizado no banco de dados
            return produtoRepository.save(produtoExistente);
        }); // 5. Se não encontrar, o Optional retornado estará vazio
}
}
