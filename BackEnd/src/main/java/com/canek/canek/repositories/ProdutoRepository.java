package com.canek.canek.repositories;

import com.canek.canek.models.Produto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.method.P;
import org.springframework.stereotype.Repository;
@Repository


public interface ProdutoRepository extends JpaRepository<Produto, Long> {

        Produto findById(long id);
        Produto save(Produto produto);
       List<Produto> findByNomeContainingIgnoreCase(String nomeProduto);
    
}
