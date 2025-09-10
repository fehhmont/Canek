package com.canek.canek.repositories;

import com.canek.canek.models.Produto;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

// 3. O Spring Data JPA irá implementar automaticamente os métodos para nós!
    // Métodos como: save(), findAll(), findById(), deleteById(), etc.


}
