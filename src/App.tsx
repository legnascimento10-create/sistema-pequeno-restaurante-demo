import { useCallback, useEffect, useState } from 'react'
import type { Pedido, StatusPedido } from './types'
import { atualizarStatus, carregarPedidosExemplo, lerPedidos } from './utils/storage'
import Home from './components/Home'
import Cardapio from './components/Cardapio'
import PedidoManual from './components/PedidoManual'
import Painel from './components/Painel'
import Cozinha from './components/Cozinha'
import Admin from './components/Admin'
import Comanda from './components/Comanda'

export type View = 'home' | 'cardapio' | 'manual' | 'painel' | 'cozinha' | 'admin'

const TITULOS: Record<View, string> = {
  home: 'Início',
  cardapio: 'Cardápio digital',
  manual: 'Novo Pedido',
  painel: 'Pedidos em andamento',
  cozinha: 'Cozinha',
  admin: 'Painel do Dono',
}

// Telas que aproveitam mais a largura no desktop.
const VIEWS_LARGAS: View[] = ['cozinha', 'admin']

export default function App() {
  const [view, setView] = useState<View>('home')
  const [pedidos, setPedidos] = useState<Pedido[]>(() => lerPedidos())
  const [comandaModal, setComandaModal] = useState<Pedido | null>(null)
  const [pedidoImpressao, setPedidoImpressao] = useState<Pedido | null>(null)

  const recarregar = useCallback(() => {
    setPedidos(lerPedidos())
  }, [])

  const irPara = useCallback((novaView: View) => {
    setView(novaView)
    setComandaModal(null)
    // Sempre recarrega ao trocar de tela para refletir novos pedidos.
    setPedidos(lerPedidos())
    window.scrollTo(0, 0)
  }, [])

  const verComanda = useCallback((pedido: Pedido) => {
    setComandaModal(pedido)
  }, [])

  const imprimir = useCallback((pedido: Pedido) => {
    setPedidoImpressao(pedido)
  }, [])

  // Modo apresentacao: carrega pedidos de exemplo (nao duplica) e recarrega.
  const carregarExemplos = useCallback(() => {
    carregarPedidosExemplo()
    setPedidos(lerPedidos())
  }, [])

  // Muda o status de um pedido (usado pela Cozinha) e recarrega a lista.
  const mudarStatus = useCallback((id: string, status: StatusPedido) => {
    atualizarStatus(id, status)
    setPedidos(lerPedidos())
  }, [])

  // Quando um pedido entra na area de impressao, dispara a impressao do navegador.
  useEffect(() => {
    if (pedidoImpressao) {
      window.print()
      setPedidoImpressao(null)
    }
  }, [pedidoImpressao])

  const largura = VIEWS_LARGAS.includes(view) ? ' app-largo' : ''

  return (
    <>
      <div className={'app' + largura}>
        <header className="topbar">
          {view !== 'home' ? (
            <button className="topbar-voltar" onClick={() => irPara('home')}>
              ← Início
            </button>
          ) : (
            <span className="topbar-marca">Sistema Pequeno Restaurante</span>
          )}
          <span className="topbar-titulo">{TITULOS[view]}</span>
        </header>

        <main className="conteudo">
          {view === 'home' && (
            <Home irPara={irPara} carregarExemplos={carregarExemplos} />
          )}
          {view === 'cardapio' && <Cardapio aoCriarPedido={recarregar} />}
          {view === 'manual' && (
            <PedidoManual aoCriarPedido={recarregar} imprimir={imprimir} />
          )}
          {view === 'painel' && (
            <Painel
              pedidos={pedidos}
              aoAtualizar={recarregar}
              verComanda={verComanda}
              imprimir={imprimir}
              carregarExemplos={carregarExemplos}
            />
          )}
          {view === 'cozinha' && (
            <Cozinha
              pedidos={pedidos}
              verComanda={verComanda}
              imprimir={imprimir}
              mudarStatus={mudarStatus}
            />
          )}
          {view === 'admin' && (
            <Admin pedidos={pedidos} verComanda={verComanda} />
          )}
        </main>

        {view === 'home' && (
          <footer className="rodape-app">
            Demonstração local. Os pedidos ficam salvos apenas neste navegador.
          </footer>
        )}
      </div>

      {/* Modal de visualizacao da comanda */}
      {comandaModal && (
        <div className="modal-overlay" onClick={() => setComandaModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-topo">
              <span>Comanda do pedido #{comandaModal.numero}</span>
              <button
                className="modal-fechar"
                aria-label="Fechar"
                onClick={() => setComandaModal(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-corpo">
              <Comanda pedido={comandaModal} />
            </div>
            <div className="modal-acoes">
              <button
                className="btn-primario"
                onClick={() => imprimir(comandaModal)}
              >
                🖨️ Imprimir
              </button>
              <button className="btn-secundario" onClick={() => setComandaModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Area exclusiva de impressao (visivel somente ao imprimir) */}
      <div className="area-impressao">
        {pedidoImpressao && <Comanda pedido={pedidoImpressao} />}
      </div>
    </>
  )
}
