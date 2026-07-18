import type { Pedido, StatusPedido } from '../types'

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
