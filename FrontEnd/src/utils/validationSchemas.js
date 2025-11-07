// Arquivo: src/utils/validationSchemas.js

import * as yup from 'yup';
import { cpf } from 'cpf-cnpj-validator';

yup.addMethod(yup.string, 'cpf', function (message) {
  return this.test('cpf', message || 'CPF inválido', value => {
    if (!value) return true;
    const digits = String(value).replace(/\D/g, '');
    return cpf.isValid(digits);
  });
});

// CORREÇÃO APLICADA AQUI
export const cadastroSchema = yup.object().shape({
  nomeCompleto: yup
    .string()
    .required('O nome completo é obrigatório')
    .test('duas-palavras', 'O nome deve conter ao menos duas palavras com no mínimo 3 letras cada', value => {
      if (!value) return false;
      const parts = value.trim().split(/\s+/);
      if (parts.length < 2) return false;
      return parts.every(p => p.length >= 3);
    }),
  
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
  dataNascimento: yup
    .date()
    .max(new Date(), 'Data de nascimento inválida')
    .required('Data de nascimento é obrigatória'),
  genero: yup
    .string()
    .oneOf(['Masculino', 'Feminino', 'Outro'], 'Gênero inválido')
    .required('Gênero é obrigatório'),
  enderecoFaturamento: yup.object().shape({
    cep: yup.string().required('CEP é obrigatório'),
    logradouro: yup.string().required('Logradouro é obrigatório'),
    numero: yup.string().required('Número é obrigatório'),
    complemento: yup.string().optional(),
    bairro: yup.string().required('Bairro é obrigatório'),
    cidade: yup.string().required('Cidade é obrigatória'),
    uf: yup.string().required('UF é obrigatória')
  }).required('Endereço de faturamento é obrigatório'),
  enderecosEntrega: yup.array().of(
    yup.object().shape({
      cep: yup.string().required('CEP é obrigatório'),
      logradouro: yup.string().required('Logradouro é obrigatório'),
      numero: yup.string().required('Número é obrigatório'),
      complemento: yup.string().optional(),
      bairro: yup.string().required('Bairro é obrigatório'),
      cidade: yup.string().required('Cidade é obrigatória'),
      uf: yup.string().required('UF é obrigatória')
    })
  ).optional()
});