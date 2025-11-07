package com.canek.canek.controllers;

import com.canek.canek.dtos.AuthDTOsAdministrador.*;
import com.canek.canek.dtos.DadosUsuarioDTO;
import com.canek.canek.models.Administrador;
import com.canek.canek.security.TokenService;
import com.canek.canek.services.AdministradorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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
    @Qualifier("adminAuthenticationManager") // Nome do bean definido na configuração de segurança
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private AdministradorService adminService; 

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseAdministradorDTO> login(@RequestBody @Valid LoginAdministradorDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);
        var administrador = (Administrador) auth.getPrincipal();
        var token = tokenService.gerarToken(administrador);
        if (administrador == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(new LoginResponseAdministradorDTO(token, administrador.getCargo().toString()));

       
    }

    @PostMapping("/cadastro")
    public ResponseEntity<Void> cadastrar(@RequestBody @Valid CadastroAdministradorDTO data) {
        try {
            adminService.cadastrar(data);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping("/findAll")
    public ResponseEntity<List<DadosUsuarioDTO>> findAll() {
        List<DadosUsuarioDTO> usuarios = adminService.listarTodos();
        return ResponseEntity.ok(usuarios);
    }

    // --- CORREÇÃO APLICADA AQUI ---
    @GetMapping("/{id}")
    public ResponseEntity<DadosUsuarioDTO> findById(@PathVariable Long id) {
        try {
            Administrador admin = adminService.findById(id);
            return ResponseEntity.ok(DadosUsuarioDTO.fromAdministrador(admin));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> alterarStatusAdministrador(@PathVariable Long id) {
        try {
            adminService.alterarStatus(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // --- CORREÇÃO APLICADA AQUI ---
    // Atualizar administrador
    @PutMapping("/{id}")
    public ResponseEntity<DadosUsuarioDTO> atualizarAdministrador(@PathVariable Long id, @RequestBody @Valid AtualizacaoAdministradorDTO data) {
        try {
            Administrador adminAtualizado = adminService.atualizar(id, data);
            return ResponseEntity.ok(DadosUsuarioDTO.fromAdministrador(adminAtualizado));
        } catch (RuntimeException e) {
            // Se o usuário não for encontrado ou o email já existir, retorna erro
            return ResponseEntity.badRequest().build(); // Simplificado
        }
    }
}