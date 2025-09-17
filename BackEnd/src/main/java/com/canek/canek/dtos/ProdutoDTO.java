package com.canek.canek.dtos;

import java.math.BigDecimal;
import java.util.List;
import com.canek.canek.models.Produto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull; // Importe a anotação correta

public record ProdutoDTO(
    Long id,

    @NotBlank(message = "O nome do produto é obrigatório")
    String nome,

    @NotBlank(message = "A descrição do produto é obrigatória")
    String descricao,

    // --- CORREÇÃO APLICADA AQUI ---
    @NotNull(message = "O preço do produto é obrigatório")
    BigDecimal preco,

    // --- E AQUI ---
    @NotNull(message = "O estoque do produto é obrigatório")
    Integer estoque, // Usar Integer permite a verificação de nulo

    // --- E AQUI (AVALIAÇÃO PODE SER NULA) ---
    BigDecimal avaliacao,

    boolean status,

    List<ImagemProdutoDTO> imagens
) {
    public static ProdutoDTO fromProduto(Produto produto) {
        // A conversão para DTO precisa de alguns ajustes para evitar erros se os campos forem nulos
        return new ProdutoDTO(
            produto.getId(),
            produto.getNome(),
            produto.getDescricao(), // No seu modelo, o campo é 'descricao'
            produto.getPreco(),
            produto.getEstoque(),
            produto.getAvaliacao(),
            produto.getStatus(),
            produto.getImagens() != null ? produto.getImagens().stream().map(ImagemProdutoDTO::fromImagemProduto).toList() : List.of()
        );
    }
}