package com.canek.canek.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity(name = "Produto") // 1. Define esta classe como uma Entidade JPA.
@Table(name = "produtos") // 2. Mapeia esta entidade para a tabela "produtos" no banco de dados.
@Data                     // 3. Lombok: Gera automaticamente getters, setters, toString(), etc.
@NoArgsConstructor        // 4. Lombok: Gera um construtor sem argumentos (obrigatório pelo JPA).
@AllArgsConstructor       // 5. Lombok: Gera um construtor com todos os campos.
public class Produto {

    @Id // 6. Marca este campo como a Chave Primária (Primary Key).
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 7. Configura o ID para ser autoincrementado pelo banco.
    private Long id;

    @Column(nullable = false) // 8. Garante que o nome não pode ser nulo.
    private String nome;

    @Column() // Mapeia para o tipo TEXT do SQL.
    private BigDecimal avaliacao;

    
    @Column(name = "descricao_detalhada", columnDefinition = "TEXT", updatable = false) // 10. Mapeia para a coluna "data_criacao" e impede atualizações.
    private String dscDetalhada;


    @Column(nullable = false, precision = 10, scale = 2) // 9. Define a precisão para valores monetários.
    private BigDecimal preco;

    @Column(nullable = false, name = "qtd_estoque") // 11. Garante que o estoque não pode ser nulo.
    private int estoque;

    
 
}