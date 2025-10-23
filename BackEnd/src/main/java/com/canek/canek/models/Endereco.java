package com.canek.canek.models;

import com.canek.canek.models.enums.TipoEndereco;
import com.fasterxml.jackson.annotation.JsonBackReference; // NOVO IMPORT
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = "enderecos")
@Entity(name = "Endereco")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ... (outros campos permanecem iguais)
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

    // --- CORREÇÃO APLICADA AQUI ---
    @ManyToOne(fetch = FetchType.LAZY) // Adicionado fetch LAZY para melhor performance
    @JoinColumn(name = "usuario_id")
    @JsonBackReference // Evita loop infinito na serialização JSON
    private Usuario usuario;
}