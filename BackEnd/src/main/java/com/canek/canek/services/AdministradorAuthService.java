// Arquivo: src/main/java/com/canek/canek/services/AdministradorAuthService.java
package com.canek.canek.services;

import com.canek.canek.repositories.UsuarioBackOfficeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AdministradorAuthService implements UserDetailsService {

    @Autowired
    private UsuarioBackOfficeRepository repository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserDetails admin = repository.findByEmail(email);
        if (admin == null) {
            throw new UsernameNotFoundException("Administrador não encontrado: " + email);
        }
        return admin;
    }
}