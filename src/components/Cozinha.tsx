import { STATUS_COZINHA } from '../types'
import type { Pedido, StatusPedido } from '../types'
import { formatarHora } from '../utils/format'

interface Props {
  pedidos: Pedido[]
  verComanda: (pedido: Pedido) => void
  imprimir: (pedido: Pedido) => void
}

function classeStatus(status: StatusPedido): string {
  return 'status-tag status-' + status.toLowerCase().replace(/\s+/g, '-')
}

export default function Cozinha({ pedidos, verComanda, imprimir }: Props) {
  // Somente pedidos em producao: Novo, Em preparo, Pronto.
  const daCozinha = pedidos
    .filter((p) => STATUS_COZINHA.includes(p.status))
    .sort((a, b) => a.numero - b.numero)

  return (
    <div className="tela">
      <h2 className="tela-titulo">Cozinha</h2>
      <p className="nota-pequena">
        Pedidos para preparar. Toque em Imprimir para gerar a comanda.
      </p>

      {daCozinha.length === 0 ? (
        <p className="vazio">Nenhum pedido na cozinha no momento.</p>
      ) : (
        <div className="lista-cozinha mural-comandas">
          {daCozinha.map((pedido) => (
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

              <div className="card-pedido-acoes">
                <button className="btn-secundario" onClick={() => verComanda(pedido)}>
                  Ver comanda
                </button>
                <button className="btn-primario btn-pequeno" onClick={() => imprimir(pedido)}>
                  🖨️ Imprimir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
