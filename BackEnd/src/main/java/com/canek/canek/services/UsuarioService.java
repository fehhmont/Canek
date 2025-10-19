// ...existing code...
package com.canek.canek.services;

import com.canek.canek.dtos.AuthDTOs.CadastroUsuarioDTO;
import com.canek.canek.dtos.EnderecoDTO;
import com.canek.canek.models.Usuario;
import com.canek.canek.models.enums.TipoEndereco;
import com.canek.canek.models.Endereco;
import com.canek.canek.repositories.UsuarioRepository;
import com.canek.canek.repositories.EnderecoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.ArrayList;
// ...existing code...

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EnderecoRepository enderecoRepository;
    
// ...existing code...
    @Transactional
    public Usuario cadastrar(CadastroUsuarioDTO data) {
        if (repository.findByEmail(data.email()) != null) {
            throw new RuntimeException("Email já cadastrado.");
        }
        if (repository.findByCpf(data.cpf()) != null) {
            throw new RuntimeException("CPF já cadastrado.");
        }

        String senhaCriptografada = passwordEncoder.encode(data.senha());

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNomeCompleto(data.nomeCompleto());
        novoUsuario.setCpf(data.cpf());
        novoUsuario.setEmail(data.email());
        novoUsuario.setDataNascimento(data.dataNascimento());
        novoUsuario.setGenero(data.genero());
        novoUsuario.setSenhaHash(senhaCriptografada);
        
        Usuario salvo = repository.save(novoUsuario);

        // salva endereço de faturamento (espera-se que CadastroUsuarioDTO tenha enderecoFaturamento())
        if (data.enderecoFaturamento() == null) {
            throw new RuntimeException("Endereço de faturamento obrigatório.");
        }
        EnderecoDTO faturamentoDto = data.enderecoFaturamento();
        Endereco endFat = new Endereco();
        endFat.setUsuario(salvo);
        endFat.setTipoEndereco(TipoEndereco.FATURAMENTO);
        endFat.setCep(faturamentoDto.cep());
        endFat.setLogradouro(faturamentoDto.logradouro());
        endFat.setNumero(faturamentoDto.numero());
        endFat.setComplemento(faturamentoDto.complemento());
        endFat.setBairro(faturamentoDto.bairro());
        endFat.setCidade(faturamentoDto.cidade());
        endFat.setEstado(faturamentoDto.uf());
        enderecoRepository.save(endFat);

        // prepara lista de entregas (pode copiar faturamento)
        List<EnderecoDTO> entregas = new ArrayList<>();
        if (data.copiarFaturamentoParaEntrega()) {
            entregas.add(faturamentoDto);
        }
        if (data.enderecosEntrega() != null) {
            entregas.addAll(data.enderecosEntrega());
        }
        if (entregas.isEmpty()) {
            throw new RuntimeException("Ao menos um endereço de entrega é obrigatório.");
        }

        for (EnderecoDTO dto : entregas) {
            Endereco e = new Endereco();
            e.setUsuario(salvo);
            e.setTipoEndereco(TipoEndereco.ENTREGA);
            e.setCep(dto.cep());
            e.setLogradouro(dto.logradouro());
            e.setNumero(dto.numero());
            e.setComplemento(dto.complemento());
            e.setBairro(dto.bairro());
            e.setCidade(dto.cidade());
            e.setEstado(dto.uf());
            enderecoRepository.save(e);
        }

        return salvo;
    }

    public List<Usuario> listarTodos() {
        return repository.findAll();
    }
}
// ...existing code...