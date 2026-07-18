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
  if (pedido) {
    pedido.status = status
    salvarPedidos(pedidos)
  }
}

export function buscarPedido(id: string): Pedido | undefined {
  return lerPedidos().find((p) => p.id === id)
}

export function limparPedidos(): void {
  localStorage.removeItem(CHAVE_PEDIDOS)
  localStorage.removeItem(CHAVE_CONTADOR)
}

// --- Modo apresentacao: pedidos de exemplo --------------------------------

// Ids fixos garantem que os pedidos de exemplo nao dupliquem se o botao
// for clicado varias vezes.
const IDS_EXEMPLO = ['exemplo-cardapio', 'exemplo-telefone', 'exemplo-whatsapp']

function somaItens(itens: ItemPedido[]): number {
  return itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
}

// Modelos dos pedidos de exemplo (sem numero/criadoEm, definidos ao carregar).
type ModeloExemplo = Omit<Pedido, 'numero' | 'criadoEm'>

function modelosExemplo(): ModeloExemplo[] {
  const cardapioItens: ItemPedido[] = [
    { produtoId: 'yakisoba-especial', nome: 'Yakisoba especial', preco: 39.9, quantidade: 1, observacao: 'sem cebola' },
    { produtoId: 'refrigerante-lata', nome: 'Refrigerante lata', preco: 6.5, quantidade: 2, observacao: '' },
  ]
  const telefoneItens: ItemPedido[] = [
    { produtoId: 'frango-xadrez', nome: 'Frango xadrez', preco: 34.9, quantidade: 1, observacao: 'bem passado' },
    { produtoId: 'rolinho-primavera', nome: 'Rolinho primavera', preco: 18.9, quantidade: 1, observacao: '' },
  ]
  const whatsappItens: ItemPedido[] = [
    { produtoId: 'temaki-salmao', nome: 'Temaki salmão', preco: 28.9, quantidade: 2, observacao: 'pouco wasabi' },
    { produtoId: 'suco-natural', nome: 'Suco natural', preco: 9.9, quantidade: 1, observacao: 'laranja' },
    { produtoId: 'harumaki-doce', nome: 'Harumaki doce', preco: 16.9, quantidade: 1, observacao: '' },
  ]

  return [
    {
      id: 'exemplo-cardapio',
      origem: 'Cardápio',
      clienteNome: 'Ana Paula',
      telefone: '(11) 98888-1111',
      endereco: 'Rua das Flores, 120 - Centro',
      formaPagamento: 'Pix',
      itens: cardapioItens,
      observacaoGeral: 'Entregar no portão azul.',
      total: somaItens(cardapioItens),
      status: 'Novo',
    },
    {
      id: 'exemplo-telefone',
      origem: 'Telefone',
      clienteNome: 'Carlos Mendes',
      telefone: '(11) 97777-2222',
      endereco: 'Av. Brasil, 45 - Jardim',
      formaPagamento: 'Dinheiro',
      itens: telefoneItens,
      observacaoGeral: 'Troco para R$ 100,00.',
      total: somaItens(telefoneItens),
      status: 'Em preparo',
    },
    {
      id: 'exemplo-whatsapp',
      origem: 'WhatsApp',
      clienteNome: 'Juliana Souza',
      telefone: '(11) 96666-3333',
      endereco: 'Rua do Sol, 300 - Vila Nova',
      formaPagamento: 'Cartão de crédito',
      itens: whatsappItens,
      observacaoGeral: 'Cliente vai retirar no balcão.',
      total: somaItens(whatsappItens),
      status: 'Pronto',
    },
  ]
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

  modelosExemplo().forEach((modelo, indice) => {
    if (idsExistentes.has(modelo.id)) return
    pedidos.push({
      ...modelo,
      numero: proximoNumero(),
      // Escalona os horarios em minutos para parecerem chegadas reais.
      criadoEm: new Date(agora - (IDS_EXEMPLO.length - indice) * 60000).toISOString(),
    })
    adicionados++
  })

  salvarPedidos(pedidos)
  return adicionados
}
