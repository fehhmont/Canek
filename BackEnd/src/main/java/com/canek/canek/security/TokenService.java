// Arquivo: src/main/java/com/canek/canek/security/TokenService.java

package com.canek.canek.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails; // 1. Importe UserDetails
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    // 2. O método agora aceita a interface genérica UserDetails
    public String gerarToken(UserDetails userDetails) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("canek-api")
                    // 3. Usamos getUsername(), que por contrato retorna o email para ambas as classes
                    .withSubject(userDetails.getUsername()) 
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);
        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token JWT", exception);
        }
    }

    // O método validarToken NÃO PRECISA de nenhuma alteração.
    // Ele já é genérico, pois trabalha diretamente com a string do token.
    public String validarToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("canek-api")
                    .build()
                    .verify(token)
                    .getSubject(); // Retorna o email (o "subject" do token)
        } catch (JWTVerificationException exception) {
            return ""; 
        }
    }

    private Instant genExpirationDate() {
        // Token expira em 2 horas
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}