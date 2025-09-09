package com.canek.canek.controllers;

import com.canek.canek.dtos.AuthDTOs.*;
import com.canek.canek.models.Usuario;
import com.canek.canek.security.TokenService;
import com.canek.canek.services.UsuarioService; // Importe o novo serviço
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioService usuarioService; // Agora usamos o serviço

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);
        var usuario = (Usuario) auth.getPrincipal();
        var token = tokenService.gerarToken(usuario);
        return ResponseEntity.ok(new LoginResponseDTO(token, usuario.getTipoUsuario()));
    }

    @PostMapping("/cadastro")
    public ResponseEntity<Void> cadastrar(@RequestBody @Valid CadastroUsuarioDTO data) {
        try {
            // A lógica agora é delegada para o serviço, que usa o PasswordEncoder central
            usuarioService.cadastrar(data);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    @GetMapping("/findAll")
    public ResponseEntity<List<Usuario>> findAllUsers() {
        // Lembre-se que este endpoint expõe a senha hash. O ideal é usar um DTO.
        return ResponseEntity.ok(usuarioService.listarTodos());
    }
}