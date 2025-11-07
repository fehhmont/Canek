package com.canek.canek.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity(name = "ImagemProduto") // 1. JPA: Define que esta classe é uma entidade JPA.
@Table(name = "produto_imagens")    
@Data                     // 3. Lombok: Gera automaticamente getters, setters, toString(), etc.
@NoArgsConstructor        // 4. Lombok: Gera um construtor sem argumentos (obrigatório pelo JPA).
@AllArgsConstructor  
public class ImagemProduto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    long id;

    @Column(name = "caminho_imagem", nullable = false)
    private String caminhoImagem;

    @Column(nullable = false)
    private boolean principal;

    @ManyToOne
    @JoinColumn(name = "produto_id")
    @JsonBackReference
    private Produto produto;

  
}
