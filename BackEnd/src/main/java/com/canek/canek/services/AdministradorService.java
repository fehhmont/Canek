// Arquivo: src/main/java/com/canek/canek/services/AdministradorService.java

package com.canek.canek.services;

import com.canek.canek.dtos.AuthDTOsAdministrador.AtualizacaoAdministradorDTO;
import com.canek.canek.dtos.AuthDTOsAdministrador.CadastroAdministradorDTO;
import com.canek.canek.dtos.DadosUsuarioDTO; // Importe o novo DTO
import com.canek.canek.models.Administrador;
import com.canek.canek.models.enums.Cargo;
import com.canek.canek.repositories.UsuarioBackOfficeRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdministradorService {

    @Autowired
    private UsuarioBackOfficeRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Método para listar todos, agora retornando o DTO correto
    public List<DadosUsuarioDTO> listarTodos() {
        return repository.findAll()
                .stream()
                // Chama o método estático para converter cada Administrador
                .map(DadosUsuarioDTO::fromAdministrador) 
                .collect(Collectors.toList());
    }

    // O método de cadastro continua igual
    public Administrador cadastrar(CadastroAdministradorDTO data) {
        if (repository.findByEmail(data.email()) != null) {
            throw new RuntimeException("Email já cadastrado.");
        }
        String senhaCriptografada = passwordEncoder.encode(data.senha());
        Administrador novoAdmin = new Administrador();
        novoAdmin.setNomeCompleto(data.nomeCompleto());
        novoAdmin.setEmail(data.email());
        novoAdmin.setCpf(data.cpf());
        novoAdmin.setSenhaHash(senhaCriptografada);
        
        // MUDANÇA: Converte a String do DTO para o tipo Enum
        try {
            novoAdmin.setCargo(Cargo.valueOf(data.cargo().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Cargo inválido: " + data.cargo());
        }

        return repository.save(novoAdmin);
    }

    public Administrador alterarStatus(Long id) {
        
        Administrador admin = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Administrador com ID " + id + " não encontrado."));

        admin.setStatus(!admin.getStatus());

       
        return repository.save(admin);
    }

    public Administrador atualizar(Long id, AtualizacaoAdministradorDTO data) {
        // 1. Busca o administrador no banco de dados
        Administrador admin = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Administrador com ID " + id + " não encontrado."));

        // 2. Verifica se o email foi alterado e se o novo email já está em uso
        if (!admin.getEmail().equals(data.email())) {
            if (repository.findByEmail(data.email()) != null) {
                throw new RuntimeException("O email informado já está em uso por outro usuário.");
            }
        }
        
        // 3. Atualiza os dados do objeto com as informações do DTO
        admin.setNomeCompleto(data.nomeCompleto());
        admin.setEmail(data.email());
        try {
            admin.setCargo(Cargo.valueOf(data.cargo().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Cargo inválido: " + data.cargo());
        }

        // 4. Salva as alterações no banco de dados
        return repository.save(admin);
    }

    public Administrador findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Administrador com ID " + id + " não encontrado."));
    }

    public Administrador findByCpf(String cpf) {
        return repository.findByCpf(cpf);
    }
}
