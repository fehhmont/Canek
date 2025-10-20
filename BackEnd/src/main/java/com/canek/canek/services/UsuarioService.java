
package com.canek.canek.services;

import com.canek.canek.dtos.AuthDTOs;
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



@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private CepService cepService;
    

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

    @Transactional
    public Usuario atualizarUsuario(Long usuarioId, AuthDTOs.AtualizacaoUsuarioDTO data) {
        Usuario existente = repository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // Atualiza os campos de dados pessoais
        existente.setNomeCompleto(data.nomeCompleto());
        existente.setDataNascimento(data.dataNascimento());
        existente.setGenero(data.genero());

        // Verifica se uma nova senha foi fornecida e a atualiza
        if (data.novaSenha() != null && !data.novaSenha().isBlank()) {
            String senhaCriptografada = passwordEncoder.encode(data.novaSenha());
            existente.setSenhaHash(senhaCriptografada);
        }

        // Salva as alterações no banco de dados
        return repository.save(existente);
    }

    
    @Transactional
    public Endereco adicionarEndereco(Long usuarioId, EnderecoDTO createDto) {
        Usuario usuario = repository.findById(usuarioId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // preencher campos faltantes via ViaCEP e obter DTO completo
        EnderecoDTO dtoPreenchido = cepService.preencherEndereco(
            new com.canek.canek.dtos.EnderecoDTO(
                0L,
                createDto.cep(),
                createDto.logradouro(),
                createDto.complemento(),
                createDto.bairro(),
                createDto.cidade(),
                createDto.uf(),
                createDto.numero(),
                false, 
                usuarioId
            )
        );

        // se novo endereço for marcado como principal, desmarca anteriores
        if (createDto.principal()) {
            List<Endereco> atuais = enderecoRepository.findByUsuarioId(usuarioId);
            for (Endereco e : atuais) {
                if (Boolean.TRUE.equals(e.isPrincipal())) {
                    e.setPrincipal(false);
                    enderecoRepository.save(e);
                }
            }
        }

        Endereco novo = new Endereco();
        novo.setUsuario(usuario);
        novo.setTipoEndereco(com.canek.canek.models.enums.TipoEndereco.ENTREGA); // ou conforme seleção
        novo.setCep(dtoPreenchido.cep());
        novo.setLogradouro(dtoPreenchido.logradouro());
        novo.setNumero(dtoPreenchido.numero());
        novo.setComplemento(dtoPreenchido.complemento());
        novo.setBairro(dtoPreenchido.bairro());
        novo.setCidade(dtoPreenchido.cidade());
        novo.setEstado(dtoPreenchido.uf());
        novo.setPrincipal(createDto.principal());

        return enderecoRepository.save(novo);
    }

    
    public List<Usuario> listarTodos() {
        return repository.findAll();
    }
}
