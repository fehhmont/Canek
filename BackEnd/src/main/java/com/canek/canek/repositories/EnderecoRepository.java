package com.canek.canek.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.canek.canek.models.Endereco;

public interface EnderecoRepository extends JpaRepository<Endereco, Long> {
    
    List<Endereco> findByUsuarioId(Long usuarioId);
       

}
