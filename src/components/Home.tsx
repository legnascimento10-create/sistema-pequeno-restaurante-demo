import type { View } from '../App'

interface Props {
  irPara: (view: View) => void
  carregarExemplos: () => void
}

export default function Home({ irPara, carregarExemplos }: Props) {
  // Carrega os pedidos de exemplo e leva direto ao Painel para mostrar.
  function carregarEExibir() {
    carregarExemplos()
    irPara('painel')
  }

  return (
    <div className="home">
      <div className="home-cabecalho">
        <h1>Sistema Pequeno Restaurante</h1>
        <p className="home-subtitulo">
          Pedidos organizados para restaurante pequeno.
        </p>
      </div>

      <div className="home-botoes">
        <button className="btn-grande btn-primario" onClick={() => irPara('cardapio')}>
          <span className="btn-icone">🍽️</span>
          Abrir Cardápio
        </button>
        <button className="btn-grande" onClick={() => irPara('manual')}>
          <span className="btn-icone">📝</span>
          Pedido Manual
        </button>
        <button className="btn-grande" onClick={() => irPara('painel')}>
          <span className="btn-icone">📋</span>
          Painel de Pedidos
        </button>
        <button className="btn-grande" onClick={() => irPara('cozinha')}>
          <span className="btn-icone">🖨️</span>
          Cozinha / Impressão
        </button>
      </div>

      <div className="modo-apresentacao">
        <p className="modo-apresentacao-texto">
          Para apresentação, carregue pedidos de exemplo.
        </p>
        <button className="btn-apresentacao" onClick={carregarEExibir}>
          Carregar pedidos de exemplo
        </button>
      </div>

      <p className="aviso-demo">
        Demonstração. A integração real com impressora será validada após teste
        no restaurante.
      </p>
    </div>
  )
}
