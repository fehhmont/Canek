package com.canek.canek.dtos;

import java.math.BigDecimal;

public record FreteDTO(
    String transportadora,
    BigDecimal valor,
    String prazoEstimado
) {}