import type { ItemPedido, Pedido } from '../types'

// Formata valor em Real brasileiro.
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

// Formata data/hora ISO para exibicao pt-BR.
export function formatarDataHora(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Formata apenas o horario (HH:MM).
export function formatarHora(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Calcula o total de uma lista de itens.
export function calcularTotal(itens: ItemPedido[]): number {
  return itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0)
}

// Monta uma mensagem de WhatsApp formatada (apenas demonstracao).
// Nao envia nada. Serve para mostrar o conceito na apresentacao.
export function montarMensagemWhatsApp(pedido: Pedido): string {
  const linhas: string[] = []
  linhas.push(`*Pedido #${pedido.numero} - Restaurante Demo*`)
  linhas.push(`Origem: ${pedido.origem}`)
  if (pedido.clienteNome) linhas.push(`Cliente: ${pedido.clienteNome}`)
  if (pedido.telefone) linhas.push(`Telefone: ${pedido.telefone}`)
  if (pedido.endereco) linhas.push(`Endereco: ${pedido.endereco}`)
  linhas.push('')
  linhas.push('*Itens:*')
  for (const item of pedido.itens) {
    linhas.push(`- ${item.quantidade}x ${item.nome} (${formatarMoeda(item.preco * item.quantidade)})`)
    if (item.observacao) linhas.push(`   Obs: ${item.observacao}`)
  }
  if (pedido.observacaoGeral) {
    linhas.push('')
    linhas.push(`*Observacao geral:* ${pedido.observacaoGeral}`)
  }
  linhas.push('')
  linhas.push(`*Pagamento:* ${pedido.formaPagamento}`)
  linhas.push(`*Total:* ${formatarMoeda(pedido.total)}`)
  return linhas.join('\n')
}
