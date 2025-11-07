// Arquivo: src/main/java/com/canek/canek/security/SecurityFilter.java
package com.canek.canek.security;

import com.canek.canek.repositories.UsuarioBackOfficeRepository;
import com.canek.canek.repositories.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService; 

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Injeta o repositório de administradores
    @Autowired
    private UsuarioBackOfficeRepository adminRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var token = this.recoverToken(request);
        if (token != null) {
            var email = tokenService.validarToken(token);
            UserDetails userDetails = null;

            // CORREÇÃO: Procura primeiro no repositório de usuários
            if (email != null && !email.isEmpty()) {
                userDetails = usuarioRepository.findByEmail(email);
                
                // Se não encontrar, procura no repositório de administradores
                if (userDetails == null) {
                    userDetails = adminRepository.findByEmail(email);
                }
            }
            
            if (userDetails != null) {
                var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        return authHeader.replace("Bearer ", "");
    }
}