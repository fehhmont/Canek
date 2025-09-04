package com.canek.canek.controllers;


import com.canek.canek.dtos.AuthDTOs.CadastroUsuarioDTO;
import com.canek.canek.dtos.AuthDTOs.LoginDTO;
import com.canek.canek.dtos.AuthDTOs.LoginResponseDTO;
import com.canek.canek.models.Usuario;
import com.canek.canek.repositories.UsuarioRepository;
import com.canek.canek.security.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var usuario = (Usuario) auth.getPrincipal();
        
        var token = tokenService.gerarToken((Usuario) auth.getPrincipal());

        var tipoUsuario = usuario.getTipoUsuario();

        return ResponseEntity.ok(new LoginResponseDTO(token, tipoUsuario));
    }

    @PostMapping("/cadastro")
    public ResponseEntity<Void> cadastrar(@RequestBody @Valid CadastroUsuarioDTO data) {
        if (this.usuarioRepository.findByEmail(data.email()) != null) {
            // Retorna 'Bad Request' se o email já existir.
            return ResponseEntity.badRequest().build();
        }

        // Criptografa a senha antes de salvar
        String senhaCriptografada = new BCryptPasswordEncoder().encode(data.senha());
        
        Usuario novoUsuario = new Usuario();
        novoUsuario.setNomeCompleto(data.nomeCompleto());
        novoUsuario.setCpf(data.cpf());
        novoUsuario.setEmail(data.email());
        novoUsuario.setSenhaHash(senhaCriptografada);
        novoUsuario.setTelefone(data.telefone());
        // O tipo e a data de cadastro são definidos na entidade.

        this.usuarioRepository.save(novoUsuario);

        return ResponseEntity.ok().build();
    }
}
