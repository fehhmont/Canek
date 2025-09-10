package com.canek.canek.controllers;

import java.util.List;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.canek.canek.models.Produto;
import com.canek.canek.repositories.ProdutoRepository;
import com.canek.canek.services.ProdutoService;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoRepository produtoRepository;

    //endpoint para listar todos os usuarios
    // Rota: GET /produtos
    @Autowired
    private ProdutoService produtoService;

    @GetMapping
    public ResponseEntity<List<Produto>> ListarTodosProdutos(){
        List<Produto> produtos = produtoService.ListarTodos();
        return ResponseEntity.ok(produtos);

    }
 // Endpoint para BUSCAR UM produto pelo ID
    // Rota: GET /produtos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable Long id) { // 5. @PathVariable
        Optional<Produto> produto = produtoService.buscarPorId(id);
        return produto.map(ResponseEntity::ok) // Se o produto existir, retorna 200 OK
                      .orElseGet(() -> ResponseEntity.notFound().build()); // Se não, retorna 404 Not Found.
    }

    // Endpoint para CADASTRAR um novo produto
    // Rota: POST /produtos
    @PostMapping
    public ResponseEntity<Produto> cadastrarProduto(@RequestBody Produto produto) { // 6. @RequestBody
        Produto novoProduto = produtoService.salvar(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto); // Retorna 201 Created.
    }

    // Endpoint para DELETAR um produto
    // Rota: DELETE /produtos/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id) {
        produtoService.deletar(id);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content.
    }

    // Endpoint para ATUALIZAR um produto existente
// Rota: PUT /produtos/{id}
@PutMapping("/{id}")
public ResponseEntity<Produto> atualizarProduto(@PathVariable Long id, @RequestBody Produto produto) {
    Optional<Produto> produtoAtualizado = produtoService.atualizar(id, produto);

    return produtoAtualizado.map(ResponseEntity::ok) // Se a atualização foi bem-sucedida, retorna 200 OK
                          .orElseGet(() -> ResponseEntity.notFound().build()); // Se o produto não foi encontrado, retorna 404 Not Found
}
}