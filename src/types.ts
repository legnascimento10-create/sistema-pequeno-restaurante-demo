// Tipos centrais da demo do Sistema Pequeno Restaurante.
// Tudo roda no navegador (localStorage). Nao existe backend.

export type Categoria =
  | 'Pratos principais'
  | 'Entradas'
  | 'Bebidas'
  | 'Sobremesas'

export type OrigemPedido =
  | 'Cardápio'
  | 'Telefone'
  | 'Balcão'
  | 'WhatsApp'

export type StatusPedido =
  | 'Novo'
  | 'Em preparo'
  | 'Pronto'
  | 'Saiu para entrega'
  | 'Entregue'
  | 'Cancelado'

export type FormaPagamento =
  | 'Dinheiro'
  | 'Pix'
  | 'Cartão de débito'
  | 'Cartão de crédito'
  | 'A definir'

export interface Produto {
  id: string
  nome: string
  categoria: Categoria
  preco: number
  descricao?: string
}

// Item ja dentro de um pedido (guarda nome e preco no momento da venda).
export interface ItemPedido {
  produtoId: string
  nome: string
  preco: number
  quantidade: number
  observacao: string
}

export interface Pedido {
  id: string
  numero: number
  origem: OrigemPedido
  clienteNome: string
  telefone: string
  endereco: string
  formaPagamento: FormaPagamento
  itens: ItemPedido[]
  observacaoGeral: string
  total: number
  status: StatusPedido
  criadoEm: string // ISO string
}

export const STATUS_LISTA: StatusPedido[] = [
  'Novo',
  'Em preparo',
  'Pronto',
  'Saiu para entrega',
  'Entregue',
  'Cancelado',
]

// Status que aparecem na tela da cozinha.
export const STATUS_COZINHA: StatusPedido[] = ['Novo', 'Em preparo', 'Pronto']

export const ORIGENS: OrigemPedido[] = [
  'Cardápio',
  'Telefone',
  'Balcão',
  'WhatsApp',
]

export const FORMAS_PAGAMENTO: FormaPagamento[] = [
  'Dinheiro',
  'Pix',
  'Cartão de débito',
  'Cartão de crédito',
  'A definir',
]
