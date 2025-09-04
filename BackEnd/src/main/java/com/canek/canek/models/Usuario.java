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



@Entity(name = "Usuario") // 1. Indica que esta classe é uma entidade JPA
@Table(name = "usuarios")  // 2. Mapeia esta classe para a tabela "usuarios" no banco
@Data                      // 3. Lombok: Gera getters, setters, toString, equals, hashCode
@NoArgsConstructor         // 4. Lombok: Gera um construtor sem argumentos
@AllArgsConstructor        // 5. Lombok: Gera um construtor com todos os argumentos
public class Usuario implements UserDetails { // 6. Implementa UserDetails para integração com Spring Security

   

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    
    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @Column(unique = true, length = 14)
    private String cpf;

    
    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    private String telefone; 

    @Column(name = "tipo_usuario")
    private String tipoUsuario;

    @Column(name = "data_cadastro", updatable = false)
    private Timestamp dataCadastro;

    
    @PrePersist
    protected void onCreate() {
        dataCadastro = new Timestamp(System.currentTimeMillis());
        if (tipoUsuario == null || tipoUsuario.isEmpty()) {
            tipoUsuario = "cliente"; // Define um valor padrão
        }
    }

    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        
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