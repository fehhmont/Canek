package com.canek.canek.services;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.canek.canek.dtos.EnderecoDTO;

@Service
public class CepService {
     private final RestTemplate rest = new RestTemplate();

    /**
     * Consulta o ViaCEP e retorna o map da resposta.
     * Lança IllegalArgumentException se o CEP for inválido ou não encontrado.
     */
    public Map<String, Object> consultarMapa(String cep) {
        if (cep == null) throw new IllegalArgumentException("CEP é obrigatório");
        String only = cep.replaceAll("\\D", "");
        if (only.length() != 8) throw new IllegalArgumentException("CEP deve ter 8 dígitos");
        String url = "https://viacep.com.br/ws/" + only + "/json/";
        Map resp = rest.getForObject(url, Map.class);
        if (resp == null || Boolean.TRUE.equals(resp.get("erro"))) {
            throw new IllegalArgumentException("CEP não encontrado: " + cep);
        }
        return resp;
    }

    /**
     * Recebe um EnderecoDTO parcial (pelo cliente) e retorna um novo EnderecoDTO
     * com campos preenchidos a partir do ViaCEP quando estiverem vazios.
     */
    public EnderecoDTO preencherEndereco(EnderecoDTO dto) {
        Map<String, Object> resp = consultarMapa(dto.cep());

        String cep = resp.getOrDefault("cep", dto.cep()).toString();
        String logradouro = isBlank(dto.logradouro()) ? (String) resp.get("logradouro") : dto.logradouro();
        String complemento = isBlank(dto.complemento()) ? (String) resp.get("complemento") : dto.complemento();
        String bairro = isBlank(dto.bairro()) ? (String) resp.get("bairro") : dto.bairro();
        String cidade = isBlank(dto.cidade()) ? (String) resp.get("localidade") : dto.cidade();
        String uf = isBlank(dto.uf()) ? (String) resp.get("uf") : dto.uf();

        return new EnderecoDTO(
            dto.id(),
            cep,
            logradouro,
            complemento,
            bairro,
            cidade,
            uf,
            dto.numero(),
            dto.principal(),
            dto.usuarioId()
        );
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
