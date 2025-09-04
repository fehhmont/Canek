package com.canek.canek.repositories;

import com.canek.canek.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;


public interface UsuarioRepository  extends JpaRepository<Usuario, Long> {

    // O Spring Data JPA cria a consulta automaticamente a partir do nome do método.
    // Isso será usado pelo Spring Security para buscar um usuário pelo email durante o login.
    UserDetails findByEmail(String email);

    Usuario findByCpf(String cpf);
    
}
