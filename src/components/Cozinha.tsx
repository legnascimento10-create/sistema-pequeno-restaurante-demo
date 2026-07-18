import { STATUS_COZINHA } from '../types'
import type { Pedido, StatusPedido } from '../types'
import { formatarHora } from '../utils/format'

interface Props {
  pedidos: Pedido[]
  verComanda: (pedido: Pedido) => void
  imprimir: (pedido: Pedido) => void
  mudarStatus: (id: string, status: StatusPedido) => void
}

function classeStatus(status: StatusPedido): string {
  return 'status-tag status-' + status.toLowerCase().replace(/\s+/g, '-')
}

// Botao principal de avanco conforme o status atual.
// Concluir usa o status "Entregue" internamente (compativel com o existente),
// mas aparece como "Concluir pedido" / "Concluído" na interface.
function acaoPrincipal(
  status: StatusPedido,
): { texto: string; proximo: StatusPedido } | null {
  if (status === 'Novo') return { texto: 'Começar preparo', proximo: 'Em preparo' }
  if (status === 'Em preparo') return { texto: 'Marcar como pronto', proximo: 'Pronto' }
  if (status === 'Pronto') return { texto: 'Concluir pedido', proximo: 'Entregue' }
  return null
}

export default function Cozinha({ pedidos, verComanda, imprimir, mudarStatus }: Props) {
  // Somente pedidos em producao: Novo, Em preparo, Pronto.
  const daCozinha = pedidos
    .filter((p) => STATUS_COZINHA.includes(p.status))
    .sort((a, b) => a.numero - b.numero)

  return (
    <div className="tela">
      <h2 className="tela-titulo">Cozinha</h2>
      <p className="nota-pequena">
        Use esta tela para acompanhar os pedidos que estão sendo preparados. A
        impressão principal fica no atendimento; aqui a cozinha marca o
        andamento.
      </p>

      {daCozinha.length === 0 ? (
        <p className="vazio">Nenhum pedido na cozinha no momento.</p>
      ) : (
        <div className="lista-cozinha mural-comandas">
          {daCozinha.map((pedido) => {
            const acao = acaoPrincipal(pedido.status)
            return (
              <div className="card-cozinha" key={pedido.id}>
                <div className="card-pedido-topo">
                  <div className="card-pedido-num">#{pedido.numero}</div>
                  <span className={classeStatus(pedido.status)}>
                    {pedido.status}
                  </span>
                </div>

                <div className="card-cozinha-meta">
                  {pedido.origem} · {formatarHora(pedido.criadoEm)}
                </div>

                <ul className="card-cozinha-itens">
                  {pedido.itens.map((item, i) => (
                    <li key={i}>
                      <span className="qtd">{item.quantidade}x</span> {item.nome}
                      {item.observacao && (
                        <div className="item-obs-cozinha">→ {item.observacao}</div>
                      )}
                    </li>
                  ))}
                </ul>

                {pedido.observacaoGeral && (
                  <div className="obs-geral-cozinha">
                    <strong>Obs:</strong> {pedido.observacaoGeral}
                  </div>
                )}

                {/* Acao principal: avanca o pedido no preparo */}
                {acao && (
                  <button
                    className="btn-grande btn-primario btn-avanco"
                    onClick={() => mudarStatus(pedido.id, acao.proximo)}
                  >
                    {acao.texto}
                  </button>
                )}

                {/* Acoes secundarias */}
                <div className="card-pedido-acoes acoes-secundarias">
                  <button className="btn-secundario" onClick={() => verComanda(pedido)}>
                    Ver comanda
                  </button>
                  <button className="btn-secundario" onClick={() => imprimir(pedido)}>
                    Reimprimir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
