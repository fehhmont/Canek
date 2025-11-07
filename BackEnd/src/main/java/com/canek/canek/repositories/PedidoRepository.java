package com.canek.canek.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.canek.canek.models.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByUsuarioId(Long usuarioId);

    
} 
