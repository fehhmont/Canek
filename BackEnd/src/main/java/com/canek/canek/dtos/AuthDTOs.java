package com.canek.canek.dtos;

import org.hibernate.validator.constraints.br.CPF;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

import com.canek.canek.dtos.EnderecoDTO;

public class AuthDTOs {
    
    public record CadastroUsuarioDTO(
        @NotBlank(message = "O nome completo é obrigatório")
         @Pattern(regexp = "^[\\p{L}]{3,}(?:\\s+[\\p{L}]{3,})+$",
             message = "Nome deve ter pelo menos 2 palavras, cada uma com mínimo 3 letras")
        String nomeCompleto,

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Formato de email inválido")
        String email,
        
        @CPF
        @NotBlank(message = "O CPF é obrigatório")
        String cpf,

        String dataNascimento,

        String genero,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        String senha,
        
        String telefone,

        @NotNull(message = "Endereço de faturamento é obrigatório")
        @Valid
        EnderecoDTO enderecoFaturamento,

        @Valid
        List<EnderecoDTO> enderecosEntrega,

        boolean copiarFaturamentoParaEntrega
    ) {}

    public record AtualizacaoUsuarioDTO(
    @NotBlank(message = "O nome completo é obrigatório")
    @Pattern(regexp = "^[\\p{L}]{3,}(?:\\s+[\\p{L}]{3,})+$",
             message = "Nome deve ter pelo menos 2 palavras, cada uma com mínimo 3 letras")
    String nomeCompleto,

    String dataNascimento,

    String genero,

    // A senha é opcional, mas se for fornecida, deve ter no mínimo 6 caracteres
    // @Size(min = 6, message = "A nova senha deve ter no mínimo 6 caracteres")
    String novaSenha
) {}
    
    public record LoginDTO(
        @NotBlank
        String email, 
        
        @NotBlank
        String senha
    ) {}

   public record LoginResponseDTO(String token, String tipoUsuario) {}
}