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

    @Column(columnDefinition = "TEXT") // Mapeia para o tipo TEXT do SQL.
    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2) // 9. Define a precisão para valores monetários.
    private BigDecimal preco;

    @Column(unique = true, length = 50) // Garante que o SKU seja único.
    private String sku;

    @Column(length = 50)
    private String status;

    @Column(name = "data_criacao", updatable = false) // 10. Mapeia para a coluna "data_criacao" e impede atualizações.
    private LocalDateTime dataCriacao;

    @PrePersist // 11. Método que é executado automaticamente ANTES de um novo produto ser salvo.
    protected void onCreate() {
        dataCriacao = LocalDateTime.now(); // Define a data de criação no momento em que o objeto é persistido.
    }
}