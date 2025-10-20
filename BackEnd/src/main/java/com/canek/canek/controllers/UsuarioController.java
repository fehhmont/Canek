// ...existing code...
package com.canek.canek.controllers;

import com.canek.canek.dtos.EnderecoDTO;
import com.canek.canek.dtos.AuthDTOs;
import com.canek.canek.dtos.AuthDTOs.CadastroUsuarioDTO;
import com.canek.canek.models.Endereco;
import com.canek.canek.models.Usuario;
import com.canek.canek.services.UsuarioService;


import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


import java.util.Map;

@RestController
@RequestMapping("/auth/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/cadastrarUsuario")
    public ResponseEntity<?> cadastrarUsuario(@RequestBody @Valid CadastroUsuarioDTO dto) {
        try {
            usuarioService.cadastrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Usuário cadastrado com sucesso", "redirect", "/login"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Erro interno"));
        }
    }

     @PostMapping("/{usuarioId}/enderecos")
    public ResponseEntity<?> adicionarEndereco(@PathVariable Long usuarioId, @RequestBody @Valid EnderecoDTO dto) {
        Endereco salvo = usuarioService.adicionarEndereco(usuarioId, dto);
        return ResponseEntity.status(201).body(salvo);
    }
    @PutMapping("/atualizar/{id}")
    public ResponseEntity<?> atualizarUsuario(@PathVariable Long id, @RequestBody @Valid AuthDTOs.AtualizacaoUsuarioDTO dto) {
        try {
            // Idealmente, você deve verificar se o usuário autenticado é o mesmo do {id}
            // Por enquanto, vamos prosseguir com a atualização.
            Usuario usuarioAtualizado = usuarioService.atualizarUsuario(id, dto);
            return ResponseEntity.ok(Map.of("message", "Usuário atualizado com sucesso!"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            // Logar o erro real em um sistema de logs
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Erro interno ao atualizar usuário."));
        }
    }
}
