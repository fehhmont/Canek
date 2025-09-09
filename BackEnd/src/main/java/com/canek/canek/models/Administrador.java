package com.canek.canek.models;

import java.sql.Timestamp;
import java.util.Collection;
import java.util.List;
import java.sql.Time;


import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.canek.canek.models.enums.Cargo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

  @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        //Gera a permissão (Role) dinamicamente a partir do cargo
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.cargo.name()));
    }

@Override
public String getPassword() {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'getPassword'");
}

@Override
public String getUsername() {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'getUsername'");
}

@Override
public boolean isAccountNonExpired() {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'isAccountNonExpired'");
}

@Override
public boolean isAccountNonLocked() {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'isAccountNonLocked'");
}

@Override
public boolean isCredentialsNonExpired() {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'isCredentialsNonExpired'");
}

@Override
public boolean isEnabled() {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'isEnabled'");
}



}

