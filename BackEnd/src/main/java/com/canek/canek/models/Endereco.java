package com.canek.canek.models;

import com.canek.canek.models.enums.TipoEndereco;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "enderecos")
@Entity(name = "Endereco")
@Data                     // 3. Lombok: Gera automaticamente getters, setters, toString(), etc.
@NoArgsConstructor        // 4. Lombok: Gera um construtor sem argumentos (obrigatório pelo JPA).
@AllArgsConstructor       // 5. Lombok: Gera um construtor com todos os campos.
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String cep;
    @Column(nullable = false)

    private String logradouro;

    private String complemento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "tipo_endereco")
    private TipoEndereco tipoEndereco;

    @Column(nullable = false)
    private String bairro;

      @Column(nullable = false)
    private String cidade;

      @Column(nullable = false, name = "uf")
    private String estado;

  @Column(nullable = false)
    private String numero;

    
    private boolean principal;

     @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;


}
