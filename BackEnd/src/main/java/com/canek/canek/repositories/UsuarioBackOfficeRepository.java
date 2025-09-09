package com.canek.canek.repositories;

import com.canek.canek.models.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository


public interface UsuarioBackOfficeRepository extends JpaRepository<Administrador, Long> {

    Administrador findByEmail(String email);

}
