package com.canek.canek.controllers;

import com.canek.canek.dtos.ProdutoDTO;
import com.canek.canek.models.Produto;
import com.canek.canek.services.ProdutoService; // Apenas o serviço é necessário aqui
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors; // Import necessário

import com. canek.canek.models.ImagemProduto ;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;




@RestController
@RequestMapping("/auth/produto")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService; // Usar apenas o serviço

   
    @GetMapping("/listar") // URL mais simples e padronizada
    public ResponseEntity<List<ProdutoDTO>> listarTodosProdutos() {
       
        List<Produto> produtos = produtoService.listarTodos();  
        List<ProdutoDTO> produtoDTOs = produtos.stream()
                                               .map(ProdutoDTO::fromProduto)
                                               .collect(Collectors.toList()); 
       
        return ResponseEntity.ok(produtoDTOs);
    }

    
    @PostMapping("/cadastrar") 
    public ResponseEntity<ProdutoDTO> criarProduto(@RequestBody ProdutoDTO produtoDTO) {
        Produto produto = new Produto();
        produto.setNome(produtoDTO.nome());
        produto.setDescricao(produtoDTO.descricao());
        produto.setPreco(produtoDTO.preco());
        produto.setEstoque(produtoDTO.estoque());
        produto.setAvaliacao(produtoDTO.avaliacao());

        List<ImagemProduto> imagens = produtoDTO.imagens().stream().map(imagemDTO -> {
                ImagemProduto imagem = new ImagemProduto();
                imagem.setCaminhoImagem(imagemDTO.caminhoImagem());
                imagem.setPrincipal(imagemDTO.principal());
                return imagem;
            })
           .toList();

        Produto novoProduto = produtoService.criarProdutoComImagens(produto,imagens);
        ProdutoDTO novoProdutoDTO = ProdutoDTO.fromProduto(novoProduto);
        return new ResponseEntity<>(novoProdutoDTO, HttpStatus.CREATED);
    }



    @PutMapping("atualizar/{id}")
    public ResponseEntity<ProdutoDTO> atualizarProduto(@PathVariable Long id, @RequestBody ProdutoDTO produtoDTO) {
        Produto produtoAtualizado = new Produto();
        produtoAtualizado.setNome(produtoDTO.nome());
        produtoAtualizado.setDescricao(produtoDTO.descricao());
        produtoAtualizado.setPreco(produtoDTO.preco());
        produtoAtualizado.setEstoque(produtoDTO.estoque());
        produtoAtualizado.setAvaliacao(produtoDTO.avaliacao());
        produtoAtualizado.setImagens(produtoDTO.imagens().stream().map(imagemDTO -> {
                ImagemProduto imagem = new ImagemProduto();
                imagem.setCaminhoImagem(imagemDTO.caminhoImagem());
                imagem.setPrincipal(imagemDTO.principal());
                return imagem;
            })
           .toList());

        Produto produto = produtoService.atualizarProduto(id, produtoAtualizado);
        ProdutoDTO produtoAtualizadoDTO = ProdutoDTO.fromProduto(produto);
        return ResponseEntity.ok(produtoAtualizadoDTO);
    }

    @GetMapping("/listarPorNome/{nome}")
  public ResponseEntity<List<ProdutoDTO>> listarProdutosPorNome(@PathVariable String nome) {
      List<Produto> produtos = produtoService.listarPorNome(nome);
      List<ProdutoDTO> dtos = produtos.stream().map(ProdutoDTO::fromProduto).toList();
      return ResponseEntity.ok(dtos);
  }

  @GetMapping("/listarTodosAtivos/true")
    public ResponseEntity<List<ProdutoDTO>> listarProdutosAtivos(@RequestParam Boolean status) {    
        List<Produto> produtos = produtoService.listarPorStatus(true);
        List<ProdutoDTO> dtos = produtos.stream().map(ProdutoDTO::fromProduto).toList();
        return ResponseEntity.ok(dtos); 
    }


     @PutMapping("/{id}/status")
    public ResponseEntity<Void> alterarStatusAdministrador(@PathVariable Long id) {
        try {
            produtoService.alterarStatus(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
}