package com.canek.canek.models;

// --- 1. IMPORTAR A ANOTAÇÃO ---
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "pedido_produtos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- 2. ADICIONAR A ANOTAÇÃO AQUI ---
    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    @JsonBackReference // Diz ao JSON: "Este é o 'filho', não serialize o pai novamente."
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "preco_unitario", nullable = false)
    private BigDecimal precoUnitario;

    @Column(name = "preco_total", insertable = false, updatable = false)
    private BigDecimal precoTotal;

}