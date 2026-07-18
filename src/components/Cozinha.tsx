import { useEffect, useState } from 'react'
import { STATUS_COZINHA } from '../types'
import type { Pedido, StatusPedido } from '../types'
import { formatarHora, formatarDuracaoMin } from '../utils/format'

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
// Cada etapa tem uma cor propria (classe) para ficar intuitivo.
function acaoPrincipal(
  status: StatusPedido,
): { texto: string; proximo: StatusPedido; classe: string } | null {
  if (status === 'Novo')
    return { texto: 'Começar preparo', proximo: 'Em preparo', classe: 'btn-etapa-iniciar' }
  if (status === 'Em preparo')
    return { texto: 'Marcar como pronto', proximo: 'Pronto', classe: 'btn-etapa-pronto' }
  if (status === 'Pronto')
    return { texto: 'Concluir pedido', proximo: 'Entregue', classe: 'btn-etapa-concluir' }
  return null
}

// Classe de contorno conforme o tempo de espera (em minutos).
function classeEspera(minutos: number): string {
  if (minutos <= 10) return 'espera-ok'
  if (minutos <= 20) return 'espera-media'
  if (minutos <= 30) return 'espera-alta'
  return 'espera-critica'
}

export default function Cozinha({ pedidos, verComanda, imprimir, mudarStatus }: Props) {
  // Atualiza a contagem de tempo de espera periodicamente (a cada 30s),
  // para que as cores de prioridade continuem corretas com o passar do tempo.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const agora = Date.now()

  // Somente pedidos em producao (Novo, Em preparo, Pronto),
  // do mais antigo para o mais novo (por hora de entrada).
  const daCozinha = pedidos
    .filter((p) => STATUS_COZINHA.includes(p.status))
    .sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime())

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
            const minutos = Math.max(
              0,
              Math.floor((agora - new Date(pedido.criadoEm).getTime()) / 60000),
            )
            return (
              <div className={'card-cozinha ' + classeEspera(minutos)} key={pedido.id}>
                {/* Cabecalho */}
                <div className="card-cozinha-cabecalho">
                  <div className="card-pedido-topo">
                    <div className="card-pedido-num">#{pedido.numero}</div>
                    <span className={classeStatus(pedido.status)}>
                      {pedido.status}
                    </span>
                  </div>
                  <div className="card-cozinha-meta">
                    {pedido.origem} · {formatarHora(pedido.criadoEm)}
                    <span className="espera-tempo">
                      há {formatarDuracaoMin(minutos)}
                    </span>
                  </div>
                </div>

                {/* Corpo */}
                <div className="card-cozinha-corpo">
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

                  <div className="obs-geral-area">
                    {pedido.observacaoGeral && (
                      <div className="obs-geral-cozinha">
                        <strong>Obs:</strong> {pedido.observacaoGeral}
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodape fixo: acoes sempre alinhadas na base */}
                <div className="card-cozinha-rodape">
                  {acao && (
                    <button
                      className={'btn-grande btn-avanco ' + acao.classe}
                      onClick={() => mudarStatus(pedido.id, acao.proximo)}
                    >
                      {acao.texto}
                    </button>
                  )}
                  <div className="card-pedido-acoes acoes-secundarias">
                    <button className="btn-secundario" onClick={() => verComanda(pedido)}>
                      Ver comanda
                    </button>
                    <button className="btn-secundario" onClick={() => imprimir(pedido)}>
                      Reimprimir
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
