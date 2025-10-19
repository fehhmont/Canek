package com.canek.canek.dtos;

import com.canek.canek.models.Endereco;

import jakarta.validation.constraints.NotBlank;

public record EnderecoDTO(   
    long id,
    @NotBlank(message = "O CEP é obrigatório")
    String cep,
        @NotBlank(message = "O logradouro é obrigatório")
    String logradouro,
    String complemento,
        @NotBlank(message = "O bairro é obrigatório")
    String bairro,
        @NotBlank(message = "A cidade é obrigatória")
    String cidade,
        @NotBlank(message = "O estado é obrigatório")
    String uf,
    @NotBlank(message = "O número é obrigatório")
    String numero,
    long usuarioId)
 {
    public static EnderecoDTO fromEndereco(Endereco endereco) {
        return new EnderecoDTO(
            endereco.getId(),
            endereco.getCep(),
            endereco.getLogradouro(),
            endereco.getComplemento(),
            endereco.getBairro(),
            endereco.getCidade(),
            endereco.getEstado(),
            endereco.getNumero(),
            endereco.getUsuario().getId()
        );
    }
 


    
}
