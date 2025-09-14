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
    public ResponseEntity<Produto> cadastrarProduto(@RequestBody Produto produto) {
        try {
            Produto novoProduto = produtoService.criarProduto(produto);
            return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
        } catch (RuntimeException e) {
            // Se ocorrer um erro (ex: produto já existe), retorna um status de conflito
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}