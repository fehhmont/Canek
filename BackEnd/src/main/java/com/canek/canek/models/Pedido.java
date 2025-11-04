package com.canek.canek.models;

// --- 1. IMPORTAR A ANOTAÇÃO ---
import com.fasterxml.jackson.annotation.JsonManagedReference; 

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.canek.canek.models.enums.FormaPagamento;
import com.canek.canek.models.enums.StatusPedido;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {

    // ... (outros campos: id, usuario, endereco, etc. permanecem iguais) ...
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "endereco_id", nullable = false)
    private Endereco endereco;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", nullable = true)
    private FormaPagamento formaPagamento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status = StatusPedido.AGUARDANDO_PAGAMENTO;

    @Column(name = "total_produtos", nullable = false)
    private BigDecimal totalProdutos;

    @Column(name = "total_frete", nullable = false)
    private BigDecimal totalFrete = BigDecimal.ZERO;

    @Column(name = "valor_total", nullable = false)
    private BigDecimal valorTotal;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;

    @Column(name = "numero_pedido", unique = true, nullable = true)
    private String numeroPedido;

    // --- 2. ADICIONAR A ANOTAÇÃO AQUI ---
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Diz ao JSON: "Este é o 'pai', serialize os filhos."
    private List<PedidoProduto> produtos;
}