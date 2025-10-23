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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;


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
    
    // NOVO: Método para buscar usuário completo (incluindo endereços)
    @Transactional(readOnly = true)
    public Usuario getUsuarioComEnderecos(Long id) {
        // Busca o usuário pelo ID. Presume que o mapeamento de endereços está na Entidade Usuario.
        Usuario usuario = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        
        // Garante o carregamento dos endereços dentro do contexto transacional
        // (Apenas necessário se a relação for LAZY e não houver um fetch JOIN)
        List<Endereco> enderecos = enderecoRepository.findByUsuarioId(id);
        
        return usuario;
    }

    @Transactional
    public void setEnderecoPrincipal(Long usuarioId, Long enderecoId) {
        Endereco endereco = enderecoRepository.findById(enderecoId)
            .orElseThrow(() -> new RuntimeException("Endereço não encontrado."));

        if (!endereco.getUsuario().getId().equals(usuarioId)) {
             throw new RuntimeException("Endereço não pertence ao usuário.");
        }
        
        // Deve ser um endereço de entrega para ser definido como principal de entrega
        if (endereco.getTipoEndereco() != TipoEndereco.ENTREGA) {
            throw new RuntimeException("Apenas endereços de entrega podem ser definidos como principal.");
        }
        
        // 1. Desmarcar todos os endereços de entrega anteriores como principal
        List<Endereco> atuais = enderecoRepository.findByUsuarioId(usuarioId);
        for (Endereco e : atuais) {
            if (e.getTipoEndereco() == TipoEndereco.ENTREGA && Boolean.TRUE.equals(e.isPrincipal())) {
                e.setPrincipal(false);
                enderecoRepository.save(e);
            }
        }

        // 2. Marcar o novo endereço como principal
        endereco.setPrincipal(true);
        enderecoRepository.save(endereco);
    }

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

    @Transactional(readOnly = true)
    public Usuario getUsuarioByEmail(String email) {
        Usuario usuario = repository.findUsuarioByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + email));
        
        // Garante que os endereços sejam carregados
        usuario.getEnderecos().size(); // Acessa a coleção para forçar o carregamento LAZY
        
        return usuario;
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
                createDto.principal(), 
                usuarioId
            )
        );

        // se novo endereço for marcado como principal, desmarca anteriores (apenas para entrega)
        if (createDto.principal()) {
            List<Endereco> atuais = enderecoRepository.findByUsuarioId(usuarioId);
            for (Endereco e : atuais) {
                if (e.getTipoEndereco() == TipoEndereco.ENTREGA && Boolean.TRUE.equals(e.isPrincipal())) {
                    e.setPrincipal(false);
                    enderecoRepository.save(e);
                }
            }
        }

        Endereco novo = new Endereco();
        novo.setUsuario(usuario);
        novo.setTipoEndereco(com.canek.canek.models.enums.TipoEndereco.ENTREGA); // Novo endereço é sempre de entrega
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