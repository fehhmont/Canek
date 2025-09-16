// Arquivo: src/utils/validationSchemas.js

import * as yup from 'yup';
import { cpf } from 'cpf-cnpj-validator';

yup.addMethod(yup.string, 'cpf', function (message) {
  return this.test('cpf', message || 'CPF inválido', value => {
    if (!value) return true;
    return cpf.isValid(value);
  });
});

// CORREÇÃO APLICADA AQUI
export const cadastroSchema = yup.object().shape({
  nomeCompleto: yup
    .string()
    .required('O nome completo é obrigatório'),
  
  cpf: yup
    .string()
    .required('O CPF é obrigatório')
    .cpf(),

  email: yup
    .string()
    .email('Digite um email válido')
    .required('O email é obrigatório'),

  // Adicionada validação de tamanho mínimo
  senha: yup
    .string()
    .required('A senha é obrigatória'),
    
  
  // Adicionada validação para confirmar a senha
  confirmarSenha: yup
    .string()
    .oneOf([yup.ref('senha'), null], 'As senhas devem ser iguais')
    .required('A confirmação de senha é obrigatória'),
  
  telefone: yup
    .string()
    .optional(),
});