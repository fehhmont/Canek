package com.canek.canek.services;

import com.canek.canek.dtos.AuthDTOs.CadastroUsuarioDTO;
import com.canek.canek.models.Usuario;
import com.canek.canek.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario cadastrar(CadastroUsuarioDTO data) {
        if (repository.findByEmail(data.email()) != null) {
            throw new RuntimeException("Email já cadastrado.");
        }

        String senhaCriptografada = passwordEncoder.encode(data.senha());

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNomeCompleto(data.nomeCompleto());
        novoUsuario.setCpf(data.cpf());
        novoUsuario.setEmail(data.email());
        novoUsuario.setDataNascimento(data.dataNascimento());
        novoUsuario.setGenero(data.genero());
        novoUsuario.setSenhaHash(senhaCriptografada);
        

        return repository.save(novoUsuario);
    }

    public List<Usuario> listarTodos() {
        return repository.findAll();
    }
}