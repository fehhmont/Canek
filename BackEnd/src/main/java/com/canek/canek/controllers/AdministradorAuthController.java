// Arquivo: src/main/java/com/canek/canek/controllers/AdministradorAuthController.java

package com.canek.canek.controllers;

import com.canek.canek.dtos.AuthDTOsAdministrador.*;
import com.canek.canek.dtos.DadosUsuarioDTO; // Importe o DTO de resposta
import com.canek.canek.models.Administrador;
import com.canek.canek.security.TokenService;
import com.canek.canek.services.AdministradorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth/administrador")
public class AdministradorAuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private AdministradorService adminService; 

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseAdministradorDTO> login(@RequestBody LoginAdministradorDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);
        var administrador = (Administrador) auth.getPrincipal();
        var token = tokenService.gerarToken(administrador);
        return ResponseEntity.ok(new LoginResponseAdministradorDTO(token, administrador.getCargo().toString()));
    }

    @PostMapping("/cadastro")
    public ResponseEntity<Void> cadastrar(@RequestBody CadastroAdministradorDTO data) {
        try {
            adminService.cadastrar(data);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    // O endpoint agora retorna o tipo correto: List<DadosUsuarioDTO>
    @GetMapping("/findAll")
    public ResponseEntity<List<DadosUsuarioDTO>> findAll() {
        List<DadosUsuarioDTO> usuarios = adminService.listarTodos();
        return ResponseEntity.ok(usuarios);
    }
}