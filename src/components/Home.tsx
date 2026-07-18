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
        <button className="btn-grande btn-primario btn-destaque" onClick={() => irPara('manual')}>
          <span className="btn-icone">📝</span>
          Novo Pedido
        </button>
        <button className="btn-grande" onClick={() => irPara('painel')}>
          <span className="btn-icone">📋</span>
          Pedidos em andamento
        </button>
        <button className="btn-grande" onClick={() => irPara('cozinha')}>
          <span className="btn-icone">🍳</span>
          Cozinha
        </button>
        <button className="btn-grande" onClick={() => irPara('cardapio')}>
          <span className="btn-icone">🍽️</span>
          Cardápio digital
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
        Essa é uma demonstração. O sistema pode ser ajustado conforme a rotina do
        restaurante. A impressora será testada no próprio restaurante.
      </p>
    </div>
  )
}
