package com.canek.canek.dtos;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


public class AuthDTOsAdministrador {

    public record CadastroAdministradorDTO(
        @NotBlank(message = "O nome completo é obrigatório")
        String nomeCompleto,

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Formato de email inválido")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        // @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
        String senha,

        @NotBlank(message = "O cargo é obrigatório")
        String cargo
    ) {}

    public record LoginAdministradorDTO(
        @NotBlank
        String email, 

        @NotBlank
        String senha
    ) {}

    public record LoginResponseAdministradorDTO(String token, String cargo) {}

    public record AtualizacaoAdministradorDTO(
        @NotBlank(message = "O nome completo é obrigatório")
        String nomeCompleto,

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Formato de email inválido")
        String email,

        @NotBlank(message = "O cargo é obrigatório")
        String cargo
    ) {}

}
