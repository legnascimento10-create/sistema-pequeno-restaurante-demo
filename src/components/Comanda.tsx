import type { Pedido } from '../types'
import { formatarMoeda, formatarDataHora } from '../utils/format'

interface Props {
  pedido: Pedido
}

// Comanda no formato de bobina termica (~80mm).
// Usada tanto na visualizacao em tela quanto na impressao.
export default function Comanda({ pedido }: Props) {
  return (
    <div className="comanda">
      <div className="comanda-cabecalho">
        <strong>Restaurante Demo</strong>
        <div className="comanda-sub">Comanda da cozinha</div>
      </div>

      <div className="comanda-linha-tracejada" />

      <div className="comanda-pedido-num">PEDIDO #{pedido.numero}</div>

      <div className="comanda-info">
        <div>Origem: {pedido.origem}</div>
        <div>Data/hora: {formatarDataHora(pedido.criadoEm)}</div>
        {pedido.clienteNome && <div>Cliente: {pedido.clienteNome}</div>}
        {pedido.telefone && <div>Telefone: {pedido.telefone}</div>}
        {pedido.endereco && <div>Endereco: {pedido.endereco}</div>}
      </div>

      <div className="comanda-linha-tracejada" />

      <div className="comanda-itens">
        {pedido.itens.map((item, i) => (
          <div className="comanda-item" key={i}>
            <div className="comanda-item-linha">
              <span>
                {item.quantidade}x {item.nome}
              </span>
              <span>{formatarMoeda(item.preco * item.quantidade)}</span>
            </div>
            {item.observacao && (
              <div className="comanda-item-obs">&gt; {item.observacao}</div>
            )}
          </div>
        ))}
      </div>

      {pedido.observacaoGeral && (
        <>
          <div className="comanda-linha-tracejada" />
          <div className="comanda-obs-geral">
            <strong>Observacao geral:</strong>
            <div>{pedido.observacaoGeral}</div>
          </div>
        </>
      )}

      <div className="comanda-linha-tracejada" />

      <div className="comanda-rodape-info">
        <div>Pagamento: {pedido.formaPagamento}</div>
        <div className="comanda-total">
          <span>TOTAL</span>
          <span>{formatarMoeda(pedido.total)}</span>
        </div>
      </div>

      <div className="comanda-linha-tracejada" />

      <div className="comanda-rodape">
        Pedido gerado pelo Sistema Pequeno Restaurante
      </div>
    </div>
  )
}
