// Arquivo: BackEnd/src/main/java/com/canek/canek/dtos/CriarPedidoDTO.java

package com.canek.canek.dtos;

import java.util.List;
import java.util.Map;
import jakarta.validation.constraints.NotNull;

public record CriarPedidoDTO(
    @NotNull
    Long usuarioId,
    
    @NotNull
    Long enderecoId,
    
    @NotNull
    List<Map<String, Object>> itens
) {}