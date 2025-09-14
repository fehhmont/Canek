package com.canek.canek.controllers;

import com.canek.canek.dtos.ProdutoDTO;
import com.canek.canek.models.Produto;
import com.canek.canek.repositories.ProdutoRepository;
import com.canek.canek.security.TokenService;
import com.canek.canek.services.ProdutoService; // Importe o novo serviço
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/auth/produto")
public class ProdutoController {

    @Autowired
     private ProdutoService produtoService; // Agora usamos o serviço

    @Autowired
    private ProdutoRepository produtoRepository;


    @GetMapping("/ListarTodosProdutos")
    public ResponseEntity<List<Produto>> ListarTodosProdutos() {
        List<Produto> produtos = produtoService.listarTodos();
        return ResponseEntity.ok(produtos);
    }

     


    @PostMapping("/CadastroProduto")
    public ResponseEntity<Produto> CadastarProduto(@RequestBody Produto produto) {
        try {
            Produto novoProduto = produtoService.criarProduto(produto);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping("/findAllProdutos")
    public ResponseEntity<List<ProdutoDTO>> findAllProdutos() {
        List<Produto> produtos = produtoService.listarTodos();
        List<ProdutoDTO> produtoDTOs = produtos.stream()
                                               .map(ProdutoDTO::fromProduto)
                                               .toList();
        return ResponseEntity.ok(produtoDTOs);
    }
    
}
