package com.canek.canek.models;

import com.fasterxml.jackson.annotation.JsonManagedReference; // NOVO IMPORT
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.sql.Timestamp;
import java.util.ArrayList; // NOVO IMPORT
import java.util.Collection;
import java.util.List;

@Entity(name = "Usuario")
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;

    @Column(unique = true, length = 14)
    private String cpf;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "data_nascimento")
    private String dataNascimento;

    @Column(name = "genero")
    private String genero;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Column(name = "tipo_usuario")
    private String tipoUsuario;

    @Column(name = "data_cadastro", updatable = false)
    private Timestamp dataCadastro;
    
    // --- CORREÇÃO APLICADA AQUI ---
    // 1. Adiciona a relação One-to-Many com a entidade Endereco.
    //    'mappedBy = "usuario"' indica que a entidade Endereco gerencia a chave estrangeira.
    //    'cascade = CascadeType.ALL' garante que os endereços sejam salvos/excluídos junto com o usuário.
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference // Ajuda a evitar loops infinitos ao converter para JSON
    private List<Endereco> enderecos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dataCadastro = new Timestamp(System.currentTimeMillis());
        if (tipoUsuario == null || tipoUsuario.isEmpty()) {
            tipoUsuario = "cliente";
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return this.senhaHash;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

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
    
    // 2. O método quebrado "getEnderecos()" foi removido.
    //    O Lombok (@Data) criará automaticamente o getter correto para o campo "enderecos".
}