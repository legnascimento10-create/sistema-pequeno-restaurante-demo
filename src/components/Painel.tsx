import { STATUS_LISTA } from '../types'
import type { Pedido, StatusPedido } from '../types'
import { atualizarStatus, limparPedidos } from '../utils/storage'
import { formatarMoeda, formatarHora } from '../utils/format'

interface Props {
  pedidos: Pedido[]
  aoAtualizar: () => void
  verComanda: (pedido: Pedido) => void
  imprimir: (pedido: Pedido) => void
  carregarExemplos: () => void
}

// Classe CSS para colorir o status.
function classeStatus(status: StatusPedido): string {
  return 'status-tag status-' + status.toLowerCase().replace(/\s+/g, '-')
}

export default function Painel({
  pedidos,
  aoAtualizar,
  verComanda,
  imprimir,
  carregarExemplos,
}: Props) {
  // Ordem de chegada (mais antigo primeiro).
  const ordenados = [...pedidos].sort((a, b) => a.numero - b.numero)

  function mudarStatus(id: string, status: StatusPedido) {
    atualizarStatus(id, status)
    aoAtualizar()
  }

  function limpar() {
    const ok = window.confirm(
      'Isso vai apagar todos os pedidos desta demonstração. Continuar?',
    )
    if (ok) {
      limparPedidos()
      aoAtualizar()
    }
  }

  return (
    <div className="tela">
      <div className="tela-header-linha">
        <h2 className="tela-titulo">Painel de pedidos</h2>
        {pedidos.length > 0 && (
          <button className="btn-perigo btn-pequeno" onClick={limpar}>
            Limpar pedidos da demo
          </button>
        )}
      </div>

      <div className="modo-apresentacao-linha">
        <span className="modo-apresentacao-texto">
          Para apresentação, carregue pedidos de exemplo.
        </span>
        <button className="btn-apresentacao btn-pequeno" onClick={carregarExemplos}>
          Carregar pedidos de exemplo
        </button>
      </div>

      {ordenados.length === 0 ? (
        <p className="vazio">
          Nenhum pedido ainda. Crie um pelo Cardápio ou pelo Pedido Manual.
        </p>
      ) : (
        <div className="lista-pedidos">
          {ordenados.map((pedido) => (
            <div className="card-pedido" key={pedido.id}>
              <div className="card-pedido-topo">
                <div className="card-pedido-num">#{pedido.numero}</div>
                <span className={classeStatus(pedido.status)}>
                  {pedido.status}
                </span>
              </div>

              <div className="card-pedido-info">
                <div>
                  <strong>{pedido.clienteNome || 'Sem nome'}</strong>
                </div>
                <div className="card-pedido-meta">
                  {pedido.origem} · {formatarHora(pedido.criadoEm)} ·{' '}
                  {pedido.formaPagamento}
                </div>
                <div className="card-pedido-total">
                  {formatarMoeda(pedido.total)}
                </div>
              </div>

              <label className="campo campo-status">
                <span>Status</span>
                <select
                  value={pedido.status}
                  onChange={(e) =>
                    mudarStatus(pedido.id, e.target.value as StatusPedido)
                  }
                >
                  {STATUS_LISTA.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <div className="card-pedido-acoes">
                <button className="btn-secundario" onClick={() => verComanda(pedido)}>
                  Ver comanda
                </button>
                <button className="btn-secundario" onClick={() => imprimir(pedido)}>
                  Imprimir
                </button>
                <button className="btn-secundario" onClick={() => imprimir(pedido)}>
                  Reimprimir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
