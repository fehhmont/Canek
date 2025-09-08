// Arquivo: src/utils/validationSchemas.js

import * as yup from 'yup';
import { cpf } from 'cpf-cnpj-validator'; // Importa a lógica de validação de CPF

// Adiciona um novo método de validação chamado "cpf" ao Yup
yup.addMethod(yup.string, 'cpf', function (message) {
  return this.test('cpf', message || 'CPF inválido', value => {
    // O teste só roda se o campo não estiver vazio
    if (!value) return true;
    // Usa a função .isValid() da biblioteca cpf-cnpj-validator
    return cpf.isValid(value);
  });
});

// Agora criamos nosso esquema de validação para o formulário de cadastro
export const cadastroSchema = yup.object().shape({
  nomeCompleto: yup
    .string()
    .required('O nome completo é obrigatório'),
  
  cpf: yup
    .string()
    .required('O CPF é obrigatório')
    .cpf(), // Usamos nosso novo método de validação aqui!

  email: yup
    .string()
    .email('Digite um email válido')
    .required('O email é obrigatório'),

  senha: yup
    .string()
    .required('A senha é obrigatória'),
  
  telefone: yup
    .string()
    .optional(), // Opcional, não precisa de validação complexa por enquanto
});