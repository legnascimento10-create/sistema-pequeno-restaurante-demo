import { useMemo } from 'react'
import type { OrigemPedido, Pedido, StatusPedido } from '../types'
import {
  formatarMoeda,
  formatarDataHora,
  formatarHora,
  tempoEntre,
  ehMesmoDia,
} from '../utils/format'

interface Props {
  pedidos: Pedido[]
  verComanda: (pedido: Pedido) => void
}

// Status considerados "em aberto" (ainda na operacao).
const STATUS_ABERTO: StatusPedido[] = [
  'Novo',
  'Em preparo',
  'Pronto',
  'Saiu para entrega',
]

const ORIGENS_RELATORIO: OrigemPedido[] = [
  'Cardápio',
  'Telefone',
  'WhatsApp',
  'Balcão',
]

function classeStatus(status: StatusPedido): string {
  return 'status-tag status-' + status.toLowerCase().replace(/\s+/g, '-')
}

// Rotulo amigavel: "Entregue" aparece como "Concluído".
function rotuloStatus(status: StatusPedido): string {
  return status === 'Entregue' ? 'Concluído' : status
}

export default function Admin({ pedidos, verComanda }: Props) {
  const dados = useMemo(() => {
    const hoje = new Date()
    const naoCancelados = pedidos.filter((p) => p.status !== 'Cancelado')

    const faturamentoHoje = pedidos
      .filter((p) => p.status !== 'Cancelado' && ehMesmoDia(p.criadoEm, hoje))
      .reduce((s, p) => s + p.total, 0)

    const faturamentoTotal = naoCancelados.reduce((s, p) => s + p.total, 0)
    const ticketMedio = naoCancelados.length
      ? faturamentoTotal / naoCancelados.length
      : 0

    const emAberto = pedidos.filter((p) => STATUS_ABERTO.includes(p.status)).length
    const concluidos = pedidos.filter((p) => p.status === 'Entregue').length
    const cancelados = pedidos.filter((p) => p.status === 'Cancelado').length

    // Financeiro por forma de pagamento (somente nao cancelados).
    const pagamentos = { dinheiro: 0, pix: 0, cartao: 0, naEntrega: 0, outros: 0 }
    for (const p of naoCancelados) {
      if (p.formaPagamento === 'Dinheiro') pagamentos.dinheiro += p.total
      else if (p.formaPagamento === 'Pix') pagamentos.pix += p.total
      else if (p.formaPagamento.includes('Cartão')) pagamentos.cartao += p.total
      else if (p.formaPagamento === 'Na entrega') pagamentos.naEntrega += p.total
      else pagamentos.outros += p.total
    }

    // Produtos mais vendidos (somente nao cancelados).
    const mapaProdutos = new Map<string, { nome: string; qtd: number; valor: number }>()
    for (const p of naoCancelados) {
      for (const item of p.itens) {
        const atual = mapaProdutos.get(item.produtoId) ?? {
          nome: item.nome,
          qtd: 0,
          valor: 0,
        }
        atual.qtd += item.quantidade
        atual.valor += item.preco * item.quantidade
        mapaProdutos.set(item.produtoId, atual)
      }
    }
    const produtos = [...mapaProdutos.values()].sort((a, b) => b.qtd - a.qtd)

    // Pedidos por origem (todos os pedidos).
    const porOrigem = ORIGENS_RELATORIO.map((o) => ({
      origem: o,
      qtd: pedidos.filter((p) => p.origem === o).length,
    }))

    // Historico: mais recentes primeiro.
    const historico = [...pedidos].sort((a, b) => b.numero - a.numero)

    // Clientes (agrupados por telefone, senao por nome).
    const mapaClientes = new Map<
      string,
      { nome: string; telefone: string; qtd: number; total: number; ultimo: string }
    >()
    for (const p of pedidos) {
      const chave = (p.telefone || p.clienteNome || 'sem-nome').trim().toLowerCase()
      const atual = mapaClientes.get(chave) ?? {
        nome: p.clienteNome || 'Sem nome',
        telefone: p.telefone,
        qtd: 0,
        total: 0,
        ultimo: p.criadoEm,
      }
      atual.qtd += 1
      if (p.status !== 'Cancelado') atual.total += p.total
      if (new Date(p.criadoEm).getTime() > new Date(atual.ultimo).getTime()) {
        atual.ultimo = p.criadoEm
      }
      mapaClientes.set(chave, atual)
    }
    const clientes = [...mapaClientes.values()].sort((a, b) => b.qtd - a.qtd)

    return {
      faturamentoHoje,
      totalPedidos: pedidos.length,
      ticketMedio,
      emAberto,
      concluidos,
      cancelados,
      pagamentos,
      faturamentoTotal,
      produtos,
      porOrigem,
      historico,
      clientes,
    }
  }, [pedidos])

  if (pedidos.length === 0) {
    return (
      <div className="tela">
        <h2 className="tela-titulo">Painel do Dono</h2>
        <p className="admin-nota">
          Os números desta demonstração são calculados a partir dos pedidos
          salvos neste navegador.
        </p>
        <p className="vazio">
          Ainda não há pedidos. Use o botão <strong>Carregar pedidos de
          exemplo</strong> na tela inicial ou no Painel para ver os números.
        </p>
      </div>
    )
  }

  return (
    <div className="tela">
      <h2 className="tela-titulo">Painel do Dono</h2>
      <p className="admin-nota">
        Os números desta demonstração são calculados a partir dos pedidos salvos
        neste navegador.
      </p>

      {/* Cards de resumo */}
      <div className="admin-cards">
        <div className="admin-card destaque">
          <div className="admin-card-rotulo">Faturamento de hoje</div>
          <div className="admin-card-valor">{formatarMoeda(dados.faturamentoHoje)}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-rotulo">Total de pedidos</div>
          <div className="admin-card-valor">{dados.totalPedidos}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-rotulo">Ticket médio</div>
          <div className="admin-card-valor">{formatarMoeda(dados.ticketMedio)}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-rotulo">Pedidos em aberto</div>
          <div className="admin-card-valor">{dados.emAberto}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-rotulo">Concluídos</div>
          <div className="admin-card-valor">{dados.concluidos}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-rotulo">Cancelados</div>
          <div className="admin-card-valor">{dados.cancelados}</div>
        </div>
      </div>

      {/* Blocos de relatorio em grid */}
      <div className="admin-grid">
        {/* Financeiro */}
        <section className="admin-bloco">
          <h3 className="admin-bloco-titulo">Recebimentos por forma</h3>
          <ul className="admin-lista">
            <li>
              <span>Dinheiro</span>
              <span>{formatarMoeda(dados.pagamentos.dinheiro)}</span>
            </li>
            <li>
              <span>Pix</span>
              <span>{formatarMoeda(dados.pagamentos.pix)}</span>
            </li>
            <li>
              <span>Cartão</span>
              <span>{formatarMoeda(dados.pagamentos.cartao)}</span>
            </li>
            <li>
              <span>Na entrega</span>
              <span>{formatarMoeda(dados.pagamentos.naEntrega)}</span>
            </li>
            {dados.pagamentos.outros > 0 && (
              <li>
                <span>Outros</span>
                <span>{formatarMoeda(dados.pagamentos.outros)}</span>
              </li>
            )}
            <li className="admin-lista-total">
              <span>Total geral</span>
              <span>{formatarMoeda(dados.faturamentoTotal)}</span>
            </li>
          </ul>
        </section>

        {/* Produtos mais vendidos */}
        <section className="admin-bloco">
          <h3 className="admin-bloco-titulo">Produtos mais vendidos</h3>
          {dados.produtos.length === 0 ? (
            <p className="nota-pequena">Sem vendas registradas.</p>
          ) : (
            <ul className="admin-lista">
              {dados.produtos.map((prod) => (
                <li key={prod.nome}>
                  <span>
                    {prod.qtd}x {prod.nome}
                  </span>
                  <span>{formatarMoeda(prod.valor)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pedidos por origem */}
        <section className="admin-bloco">
          <h3 className="admin-bloco-titulo">Pedidos por origem</h3>
          <ul className="admin-lista">
            {dados.porOrigem.map((o) => (
              <li key={o.origem}>
                <span>{o.origem}</span>
                <span>{o.qtd}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Clientes */}
        <section className="admin-bloco">
          <h3 className="admin-bloco-titulo">Clientes</h3>
          <div className="admin-tabela-scroll">
            <table className="admin-tabela">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Pedidos</th>
                  <th>Total gasto</th>
                  <th>Último pedido</th>
                </tr>
              </thead>
              <tbody>
                {dados.clientes.map((c, i) => (
                  <tr key={i}>
                    <td>{c.nome}</td>
                    <td>{c.telefone || '-'}</td>
                    <td>{c.qtd}</td>
                    <td>{formatarMoeda(c.total)}</td>
                    <td>{formatarDataHora(c.ultimo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Historico completo */}
      <section className="admin-bloco admin-bloco-largo">
        <h3 className="admin-bloco-titulo">Histórico de pedidos</h3>
        <div className="admin-tabela-scroll">
          <table className="admin-tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Origem</th>
                <th>Pagamento</th>
                <th>Total</th>
                <th>Status</th>
                <th>Entrada</th>
                <th>Conclusão</th>
                <th>Tempo total</th>
                <th>Comanda</th>
              </tr>
            </thead>
            <tbody>
              {dados.historico.map((p) => (
                <tr key={p.id}>
                  <td>#{p.numero}</td>
                  <td>{p.clienteNome || '-'}</td>
                  <td>{p.telefone || '-'}</td>
                  <td>{p.origem}</td>
                  <td>{p.formaPagamento}</td>
                  <td>{formatarMoeda(p.total)}</td>
                  <td>
                    <span className={classeStatus(p.status)}>
                      {rotuloStatus(p.status)}
                    </span>
                  </td>
                  <td>{formatarHora(p.criadoEm)}</td>
                  <td>{p.completedAt ? formatarHora(p.completedAt) : '-'}</td>
                  <td>{tempoEntre(p.criadoEm, p.completedAt)}</td>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => verComanda(p)}
                    >
                      Ver comanda
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
