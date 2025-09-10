package com.canek.canek.models;

import com.canek.canek.models.enums.Cargo;
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

@Entity(name = "Administrador")
@Table(name = "administradores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Administrador implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "cargo", nullable = false)
    private Cargo cargo;

    @Column(name = "data_criacao", updatable = false)
    private Timestamp dataCriacao;

    @Column(name = "status")
    private Boolean status = true;

 


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Gera a permissão (Role) com base no cargo
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.cargo.name()));
    }

    @Override
    public String getPassword() {
        // CORRIGIDO: Deve retornar a senha criptografada do banco
        return this.senhaHash;
    }

    @Override
    public String getUsername() {
        // CORRIGIDO: Deve retornar o email (que usamos como username para login)
        return this.email;
    }

    // CORRIGIDO: Os métodos abaixo devem retornar 'true' para indicar que a conta está ativa
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return this.status != null && this.status; }

    
}