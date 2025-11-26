    package com.canek.canek.controllers;

    import com.canek.canek.dtos.AuthDTOs.*;
    import com.canek.canek.models.Usuario;
    import com.canek.canek.security.TokenService;
    import com.canek.canek.services.UsuarioService; // Importe o novo serviço
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
    @RequestMapping("/auth")
    public class AuthController {

        @Autowired
        @Qualifier("userAuthenticationManager")
        private AuthenticationManager authenticationManager;

        @Autowired
        private UsuarioService usuarioService;

        @Autowired
        private TokenService tokenService;

        @PostMapping("/login")
        public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginDTO data) {
            var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
            var auth = this.authenticationManager.authenticate(usernamePassword);
            var usuario = (Usuario) auth.getPrincipal();
            var token = tokenService.gerarToken(usuario);
            
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            return ResponseEntity.ok(new LoginResponseDTO(token, usuario.getTipoUsuario(), usuario.getId()));
        }

        @PostMapping("/cadastro")
        public ResponseEntity<Void> cadastrar(@RequestBody @Valid CadastroUsuarioDTO data) {
            try {
                usuarioService.cadastrar(data);
                return ResponseEntity.status(HttpStatus.CREATED).build();
            } catch (RuntimeException e) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }
        
        @GetMapping("/findAll")
        public ResponseEntity<List<Usuario>> findAllUsers() {
            
            return ResponseEntity.ok(usuarioService.listarTodos());
        }
    }