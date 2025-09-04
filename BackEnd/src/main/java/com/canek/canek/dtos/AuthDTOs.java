package com.canek.canek.dtos;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTOs {
    
    public record CadastroUsuarioDTO(
        @NotBlank(message = "O nome completo é obrigatório")
        String nomeCompleto,

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Formato de email inválido")
        String email,
        
        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        String senha,
        
        String telefone
    ) {}
    
    public record LoginDTO(
        @NotBlank
        String email, 
        
        @NotBlank
        String senha
    ) {}

    public record LoginResponseDTO(String token) {}
}
