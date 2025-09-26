// Arquivo: src/main/java/com/canek/canek/dtos/DadosUsuarioDTO.java

package com.canek.canek.dtos;

import com.canek.canek.models.Administrador;
import com.canek.canek.models.Usuario;
import com.canek.canek.models.enums.Cargo;
import java.sql.Timestamp;

// Usamos 'record' para um DTO imutável e conciso
public record DadosUsuarioDTO(
    Long id,
    String nomeCompleto,
    String email,
    String cpf,
    String telefone,
    String tipoUsuarioOuCargo,
    Boolean status, // Um campo genérico para ambos
    Timestamp dataCadastro
) {
    // Construtor "de fábrica" para converter uma Entidade Usuario para este DTO
    public static DadosUsuarioDTO fromUsuario(Usuario usuario) {
        return new DadosUsuarioDTO(
            usuario.getId(),
            usuario.getNomeCompleto(),
            usuario.getEmail(),
            usuario.getCpf(),
            usuario.getTelefone(),
            usuario.getTipoUsuario(),
            null,
            usuario.getDataCadastro()
        );
    }

    // Construtor "de fábrica" para converter uma Entidade Administrador para este DTO
    public static DadosUsuarioDTO fromAdministrador(Administrador admin) {
        return new DadosUsuarioDTO(
            admin.getId(),
            admin.getNomeCompleto(),
            admin.getEmail(),
            admin.getCpf(),
            null, // Admin não tem telefone
            admin.getCargo().name(), // Pega o nome do Enum (ex: "ADMIN")
            admin.isEnabled(),
            admin.getDataCriacao()
        );
    }
}