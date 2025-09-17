package com.canek.canek.services;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.canek.canek.repositories.ImagemProdutoRepository;
import com.canek.canek.repositories.ProdutoRepository;
import com.canek.canek.models.Produto;
import com.canek.canek.models.Administrador;
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
        // 1. Atualiza os dados do produto encontrado
        produto.setNome(produtoAtualizado.getNome());
        produto.setAvaliacao(produtoAtualizado.getAvaliacao());
        produto.setDescricao(produtoAtualizado.getDescricao());
        produto.setPreco(produtoAtualizado.getPreco());
        produto.setEstoque(produtoAtualizado.getEstoque());

        // 2. Limpa a lista de imagens antigas.
        // Se a sua relação @OneToMany tiver `orphanRemoval = true`,
        // as imagens antigas serão excluídas do banco.
        produto.getImagens().clear();

        // 3. Percorre as novas imagens e as associa a este produto
        if (produtoAtualizado.getImagens() != null) {
            for (ImagemProduto novaImagem : produtoAtualizado.getImagens()) {
                novaImagem.setProduto(produto); // <-- Esta é a linha mais importante da correção!
                produto.getImagens().add(novaImagem);
            }
        }
        
        // 4. Salva o produto com as informações e imagens atualizadas
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


       public Produto alterarStatus(Long id) {
        
        Produto prod = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Administrador com ID " + id + " não encontrado."));

        prod.setStatus(!prod.getStatus());

       
        return produtoRepository.save(prod);
    }
}
