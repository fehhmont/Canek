package com.canek.canek.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.canek.canek.models.Produto;

import jakarta.validation.constraints.NotBlank;


public record ProdutoDTO(


    Long id,

    @NotBlank( message = "O nome do produto é obrigatório")
    String nome,
    @NotBlank( message = "a descrição o produto é obrigatório")
    String descricao,
      @NotBlank( message = "O preço do produto é obrigatório")
    BigDecimal preco,
      @NotBlank( message = "o estoque do produto é obrigatório")
      int estoque,
      @NotBlank( message = "A avaliação do produto é obrigatório")
     BigDecimal avaliacao
    


) {

      public static ProdutoDTO fromProduto(Produto produto) {
        return new ProdutoDTO(
            produto.getId(),
            produto.getNome(),
            produto.getDscDetalhada(),
            produto.getPreco(),
            produto.getEstoque(),
            produto.getAvaliacao()
       
        );

      }


} 
