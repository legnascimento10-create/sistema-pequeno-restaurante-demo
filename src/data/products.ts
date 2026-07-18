import type { Produto } from '../types'

// Cardapio ficticio para demonstracao.
// Precos apenas ilustrativos.
export const PRODUTOS: Produto[] = [
  // Pratos principais
  {
    id: 'yakisoba-tradicional',
    nome: 'Yakisoba tradicional',
    categoria: 'Pratos principais',
    preco: 32.9,
    descricao: 'Macarrao oriental com legumes e frango.',
  },
  {
    id: 'yakisoba-especial',
    nome: 'Yakisoba especial',
    categoria: 'Pratos principais',
    preco: 39.9,
    descricao: 'Yakisoba com frango, carne e camarao.',
  },
  {
    id: 'frango-xadrez',
    nome: 'Frango xadrez',
    categoria: 'Pratos principais',
    preco: 34.9,
    descricao: 'Frango em cubos com pimentao e amendoim.',
  },
  {
    id: 'temaki-salmao',
    nome: 'Temaki salmão',
    categoria: 'Pratos principais',
    preco: 28.9,
    descricao: 'Cone de alga com arroz e salmao.',
  },

  // Entradas
  {
    id: 'rolinho-primavera',
    nome: 'Rolinho primavera',
    categoria: 'Entradas',
    preco: 18.9,
    descricao: 'Porcao com 4 unidades.',
  },

  // Bebidas
  {
    id: 'refrigerante-lata',
    nome: 'Refrigerante lata',
    categoria: 'Bebidas',
    preco: 6.5,
    descricao: 'Lata 350ml.',
  },
  {
    id: 'suco-natural',
    nome: 'Suco natural',
    categoria: 'Bebidas',
    preco: 9.9,
    descricao: 'Copo 400ml.',
  },

  // Sobremesas
  {
    id: 'harumaki-doce',
    nome: 'Harumaki doce',
    categoria: 'Sobremesas',
    preco: 16.9,
    descricao: 'Rolinho crocante com recheio doce.',
  },
]

export const CATEGORIAS_ORDEM: Produto['categoria'][] = [
  'Pratos principais',
  'Entradas',
  'Bebidas',
  'Sobremesas',
]
