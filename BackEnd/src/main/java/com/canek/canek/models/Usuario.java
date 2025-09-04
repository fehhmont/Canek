package com.canek.canek.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.List;

// --- ANOTAÇÕES DA CLASSE ---

@Entity(name = "Usuario") // 1. Indica que esta classe é uma entidade JPA
@Table(name = "usuarios")  // 2. Mapeia esta classe para a tabela "usuarios" no banco
@Data                      // 3. Lombok: Gera getters, setters, toString, equals, hashCode
@NoArgsConstructor         // 4. Lombok: Gera um construtor sem argumentos
@AllArgsConstructor        // 5. Lombok: Gera um construtor com todos os argumentos
public class Usuario implements UserDetails { // 6. Implementa UserDetails para integração com Spring Security

    // --- ATRIBUTOS (CAMPOS) DA CLASSE ---

    @Id // 7. Indica que este campo é a chave primária (Primary Key)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 8. Configura a geração automática do ID (AUTO_INCREMENT)
    private Long id;

    // 9. Mapeia o atributo para a coluna "nome_completo" e define que não pode ser nulo
    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @Column(unique = true, length = 14)
    private String cpf;

    // 10. Mapeia para a coluna "email", define que não pode ser nulo e deve ser único
    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    private String telefone; // Se o nome do atributo for igual ao da coluna, o @Column é opcional

    @Column(name = "tipo_usuario")
    private String tipoUsuario;

    @Column(name = "data_cadastro", updatable = false)
    private Timestamp dataCadastro;

    // 11. Método executado antes de salvar a entidade pela primeira vez
    @PrePersist
    protected void onCreate() {
        dataCadastro = new Timestamp(System.currentTimeMillis());
        if (tipoUsuario == null || tipoUsuario.isEmpty()) {
            tipoUsuario = "cliente"; // Define um valor padrão
        }
    }

    // --- MÉTODOS DA INTERFACE UserDetails (para o Spring Security) ---
    // 12. Estes métodos são um "contrato" com o Spring Security

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Define as permissões/cargos (Roles) do usuário.
        // Para simplificar, estamos dando a permissão 'ROLE_USER' para todos.
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        // O Spring Security vai chamar este método para pegar a senha (já criptografada)
        return this.senhaHash;
    }



    @Override
    public String getUsername() {
        // O Spring Security usa este método para obter o "nome de usuário" para login.
        // No nosso caso, o login será feito com o email.
        return this.email;
    }
    
    // Os métodos abaixo controlam o status da conta. Deixando todos como 'true',
    // significa que as contas estão sempre ativas por padrão.

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}