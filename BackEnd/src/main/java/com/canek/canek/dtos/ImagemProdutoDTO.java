package com.canek.canek.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.canek.canek.models.ImagemProduto;


public record ImagemProdutoDTO(  

    long id,
    @NotBlank(message = "O caminho da imagem é obrigatório")
    String caminhoImagem,
    @NotNull(message = "Infome qual imagem é principal")
    boolean principal


) 
{
 
 public static ImagemProdutoDTO fromImagemProduto(ImagemProduto imagemProduto) {
    return new ImagemProdutoDTO(
        imagemProduto.getId(),
        imagemProduto.getCaminhoImagem(),
        imagemProduto.isPrincipal()
    );

  
 }
}
