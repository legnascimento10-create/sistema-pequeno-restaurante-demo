import type { ItemPedido, Pedido, StatusPedido } from '../types'

// Toda a persistencia da demo usa localStorage do navegador.
// Nao existe backend, banco de dados ou API externa.

const CHAVE_PEDIDOS = 'spr_demo_pedidos'
const CHAVE_CONTADOR = 'spr_demo_contador'

// --- Leitura / escrita bruta ---------------------------------------------

export function lerPedidos(): Pedido[] {
  try {
    const bruto = localStorage.getItem(CHAVE_PEDIDOS)
    if (!bruto) return []
    const dados = JSON.parse(bruto)
    return Array.isArray(dados) ? (dados as Pedido[]) : []
  } catch {
    return []
  }
}

function salvarPedidos(pedidos: Pedido[]): void {
  localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos))
}

// --- Numero do pedido -----------------------------------------------------

function proximoNumero(): number {
  const atual = Number(localStorage.getItem(CHAVE_CONTADOR) || '0')
  const proximo = atual + 1
  localStorage.setItem(CHAVE_CONTADOR, String(proximo))
  return proximo
}

// --- Id simples (sem dependencia externa) ---------------------------------

function gerarId(): string {
  return 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// --- Operacoes de dominio -------------------------------------------------

// Cria e persiste um novo pedido. Recebe os dados sem id/numero/status/data.
export function criarPedido(
  dados: Omit<Pedido, 'id' | 'numero' | 'status' | 'criadoEm'>,
): Pedido {
  const pedido: Pedido = {
    ...dados,
    id: gerarId(),
    numero: proximoNumero(),
    status: 'Novo',
    criadoEm: new Date().toISOString(),
  }
  const pedidos = lerPedidos()
  pedidos.push(pedido)
  salvarPedidos(pedidos)
  return pedido
}

export function atualizarStatus(id: string, status: StatusPedido): void {
  const pedidos = lerPedidos()
  const pedido = pedidos.find((p) => p.id === id)
  if (!pedido) return

  pedido.status = status

  // Registra os horarios de andamento (so na primeira vez de cada etapa).
  const agora = new Date().toISOString()
  if (status === 'Em preparo' && !pedido.startedAt) pedido.startedAt = agora
  if (status === 'Pronto' && !pedido.readyAt) pedido.readyAt = agora
  if (status === 'Entregue' && !pedido.completedAt) pedido.completedAt = agora

  salvarPedidos(pedidos)
}

export function buscarPedido(id: string): Pedido | undefined {
  return lerPedidos().find((p) => p.id === id)
}

export function limparPedidos(): void {
  localStorage.removeItem(CHAVE_PEDIDOS)
  localStorage.removeItem(CHAVE_CONTADOR)
}

// --- Modo apresentacao: pedidos de exemplo --------------------------------

function somaItens(itens: ItemPedido[]): number {
  return itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
}

const MIN = 60 * 1000

// Modelo de exemplo: alem dos dados do pedido, guarda deslocamentos de tempo
// (em minutos atras) para gerar horarios realistas de entrada/preparo/pronto/
// conclusao. Assim o Painel do Dono mostra dados uteis sem precisar operar.
interface ModeloExemplo {
  id: string
  origem: Pedido['origem']
  clienteNome: string
  telefone: string
  endereco: string
  formaPagamento: Pedido['formaPagamento']
  itens: ItemPedido[]
  observacaoGeral: string
  status: StatusPedido
  minEntrada: number // minutos atras em que entrou
  minInicio?: number // minutos atras em que comecou o preparo
  minPronto?: number // minutos atras em que ficou pronto
  minConcluido?: number // minutos atras em que foi concluido
}

function modelosExemplo(): ModeloExemplo[] {
  return [
    {
      id: 'exemplo-1',
      origem: 'Cardápio',
      clienteNome: 'Ana Paula',
      telefone: '(11) 98888-1111',
      endereco: 'Rua das Flores, 120 - Centro',
      formaPagamento: 'Pix',
      itens: [
        { produtoId: 'yakisoba-especial', nome: 'Yakisoba especial', preco: 39.9, quantidade: 1, observacao: 'sem cebola' },
        { produtoId: 'refrigerante-lata', nome: 'Refrigerante lata', preco: 6.5, quantidade: 2, observacao: '' },
      ],
      observacaoGeral: 'Entregar no portão azul.',
      status: 'Novo',
      minEntrada: 8,
    },
    {
      id: 'exemplo-2',
      origem: 'Telefone',
      clienteNome: 'Carlos Mendes',
      telefone: '(11) 97777-2222',
      endereco: 'Av. Brasil, 45 - Jardim',
      formaPagamento: 'Dinheiro',
      itens: [
        { produtoId: 'frango-xadrez', nome: 'Frango xadrez', preco: 34.9, quantidade: 1, observacao: 'bem passado' },
        { produtoId: 'rolinho-primavera', nome: 'Rolinho primavera', preco: 18.9, quantidade: 1, observacao: '' },
      ],
      observacaoGeral: 'Troco para R$ 100,00.',
      status: 'Em preparo',
      minEntrada: 20,
      minInicio: 15,
    },
    {
      id: 'exemplo-3',
      origem: 'WhatsApp',
      clienteNome: 'Juliana Souza',
      telefone: '(11) 96666-3333',
      endereco: 'Rua do Sol, 300 - Vila Nova',
      formaPagamento: 'Cartão',
      itens: [
        { produtoId: 'temaki-salmao', nome: 'Temaki salmão', preco: 28.9, quantidade: 2, observacao: 'pouco wasabi' },
        { produtoId: 'suco-natural', nome: 'Suco natural', preco: 9.9, quantidade: 1, observacao: 'laranja' },
        { produtoId: 'harumaki-doce', nome: 'Harumaki doce', preco: 16.9, quantidade: 1, observacao: '' },
      ],
      observacaoGeral: 'Cliente vai retirar no balcão.',
      status: 'Pronto',
      minEntrada: 35,
      minInicio: 30,
      minPronto: 12,
    },
    {
      id: 'exemplo-4',
      origem: 'Telefone',
      clienteNome: 'Ana Paula',
      telefone: '(11) 98888-1111',
      endereco: 'Rua das Flores, 120 - Centro',
      formaPagamento: 'Dinheiro',
      itens: [
        { produtoId: 'yakisoba-tradicional', nome: 'Yakisoba tradicional', preco: 32.9, quantidade: 2, observacao: '' },
        { produtoId: 'refrigerante-lata', nome: 'Refrigerante lata', preco: 6.5, quantidade: 1, observacao: 'bem gelado' },
      ],
      observacaoGeral: '',
      status: 'Entregue',
      minEntrada: 120,
      minInicio: 116,
      minPronto: 100,
      minConcluido: 85,
    },
    {
      id: 'exemplo-5',
      origem: 'Balcão',
      clienteNome: 'Roberto Lima',
      telefone: '(11) 95555-4444',
      endereco: '',
      formaPagamento: 'Cartão',
      itens: [
        { produtoId: 'yakisoba-especial', nome: 'Yakisoba especial', preco: 39.9, quantidade: 1, observacao: '' },
        { produtoId: 'harumaki-doce', nome: 'Harumaki doce', preco: 16.9, quantidade: 2, observacao: '' },
      ],
      observacaoGeral: 'Retirada no balcão.',
      status: 'Entregue',
      minEntrada: 150,
      minInicio: 145,
      minPronto: 130,
      minConcluido: 120,
    },
    {
      id: 'exemplo-6',
      origem: 'WhatsApp',
      clienteNome: 'Roberto Lima',
      telefone: '(11) 95555-4444',
      endereco: 'Rua Verde, 88 - Centro',
      formaPagamento: 'Na entrega',
      itens: [
        { produtoId: 'yakisoba-tradicional', nome: 'Yakisoba tradicional', preco: 32.9, quantidade: 1, observacao: '' },
        { produtoId: 'suco-natural', nome: 'Suco natural', preco: 9.9, quantidade: 2, observacao: '' },
      ],
      observacaoGeral: 'Pagar na entrega.',
      status: 'Entregue',
      minEntrada: 200,
      minInicio: 195,
      minPronto: 180,
      minConcluido: 170,
    },
    {
      id: 'exemplo-7',
      origem: 'Cardápio',
      clienteNome: 'Fernanda Dias',
      telefone: '(11) 94444-5555',
      endereco: 'Av. Central, 500 - Jardim',
      formaPagamento: 'Pix',
      itens: [
        { produtoId: 'temaki-salmao', nome: 'Temaki salmão', preco: 28.9, quantidade: 1, observacao: '' },
      ],
      observacaoGeral: 'Cliente desistiu.',
      status: 'Cancelado',
      minEntrada: 60,
    },
  ]
}

// Ids fixos garantem que os pedidos de exemplo nao dupliquem se o botao
// for clicado varias vezes.
const IDS_EXEMPLO = modelosExemplo().map((m) => m.id)

function isoAtras(agora: number, minutos?: number): string | undefined {
  if (minutos === undefined) return undefined
  return new Date(agora - minutos * MIN).toISOString()
}

// Verifica se ja existe algum pedido de exemplo carregado.
export function existemPedidosExemplo(): boolean {
  const ids = new Set(lerPedidos().map((p) => p.id))
  return IDS_EXEMPLO.some((id) => ids.has(id))
}

// Carrega os pedidos de exemplo sem apagar os pedidos reais ja existentes.
// Retorna quantos foram adicionados (0 se ja estavam carregados).
export function carregarPedidosExemplo(): number {
  const pedidos = lerPedidos()
  const idsExistentes = new Set(pedidos.map((p) => p.id))
  const agora = Date.now()
  let adicionados = 0

  modelosExemplo().forEach((modelo) => {
    if (idsExistentes.has(modelo.id)) return
    const pedido: Pedido = {
      id: modelo.id,
      numero: proximoNumero(),
      origem: modelo.origem,
      clienteNome: modelo.clienteNome,
      telefone: modelo.telefone,
      endereco: modelo.endereco,
      formaPagamento: modelo.formaPagamento,
      itens: modelo.itens,
      observacaoGeral: modelo.observacaoGeral,
      total: somaItens(modelo.itens),
      status: modelo.status,
      criadoEm: new Date(agora - modelo.minEntrada * MIN).toISOString(),
      startedAt: isoAtras(agora, modelo.minInicio),
      readyAt: isoAtras(agora, modelo.minPronto),
      completedAt: isoAtras(agora, modelo.minConcluido),
    }
    pedidos.push(pedido)
    adicionados++
  })

  salvarPedidos(pedidos)
  return adicionados
}
