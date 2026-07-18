import { useMemo, useState } from 'react'
import { PRODUTOS, CATEGORIAS_ORDEM } from '../data/products'
import { FORMAS_PAGAMENTO, ORIGENS } from '../types'
import type { FormaPagamento, ItemPedido, OrigemPedido, Pedido } from '../types'
import { criarPedido } from '../utils/storage'
import { calcularTotal, formatarMoeda } from '../utils/format'
import Comanda from './Comanda'

interface Props {
  aoCriarPedido: (pedido: Pedido) => void
  imprimir: (pedido: Pedido) => void
}

interface LinhaCarrinho {
  quantidade: number
  observacao: string
}

// Origens validas para lancamento manual (o Cardapio ja tem tela propria).
const ORIGENS_MANUAIS: OrigemPedido[] = ORIGENS.filter((o) => o !== 'Cardápio')

export default function PedidoManual({ aoCriarPedido, imprimir }: Props) {
  const [origem, setOrigem] = useState<OrigemPedido>('Telefone')
  const [carrinho, setCarrinho] = useState<Record<string, LinhaCarrinho>>({})
  const [clienteNome, setClienteNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('Dinheiro')
  const [observacaoGeral, setObservacaoGeral] = useState('')
  const [erro, setErro] = useState('')
  const [pedidoCriado, setPedidoCriado] = useState<Pedido | null>(null)

  const itens: ItemPedido[] = useMemo(() => {
    return Object.entries(carrinho)
      .filter(([, linha]) => linha.quantidade > 0)
      .map(([produtoId, linha]) => {
        const produto = PRODUTOS.find((p) => p.id === produtoId)!
        return {
          produtoId,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: linha.quantidade,
          observacao: linha.observacao.trim(),
        }
      })
  }, [carrinho])

  const total = calcularTotal(itens)

  function alterarQuantidade(produtoId: string, delta: number) {
    setCarrinho((atual) => {
      const linha = atual[produtoId] ?? { quantidade: 0, observacao: '' }
      const novaQtd = Math.max(0, linha.quantidade + delta)
      return { ...atual, [produtoId]: { ...linha, quantidade: novaQtd } }
    })
  }

  function alterarObservacao(produtoId: string, texto: string) {
    setCarrinho((atual) => {
      const linha = atual[produtoId] ?? { quantidade: 0, observacao: '' }
      return { ...atual, [produtoId]: { ...linha, observacao: texto } }
    })
  }

  function salvar() {
    setErro('')
    if (itens.length === 0) {
      setErro('Adicione ao menos um item ao pedido.')
      return
    }
    if (!clienteNome.trim()) {
      setErro('Informe o nome do cliente.')
      return
    }
    const pedido = criarPedido({
      origem,
      clienteNome: clienteNome.trim(),
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      formaPagamento,
      itens,
      observacaoGeral: observacaoGeral.trim(),
      total,
    })
    setPedidoCriado(pedido)
    aoCriarPedido(pedido)
  }

  function novoPedido() {
    setOrigem('Telefone')
    setCarrinho({})
    setClienteNome('')
    setTelefone('')
    setEndereco('')
    setFormaPagamento('Dinheiro')
    setObservacaoGeral('')
    setErro('')
    setPedidoCriado(null)
  }

  // --- Confirmacao -------------------------------------------------------
  if (pedidoCriado) {
    return (
      <div className="tela">
        <div className="confirmacao">
          <div className="confirmacao-check">✅</div>
          <h2>Pedido salvo!</h2>
          <p>
            Pedido <strong>#{pedidoCriado.numero}</strong> registrado como{' '}
            <strong>{pedidoCriado.origem}</strong>.
          </p>

          <div className="confirmacao-comanda">
            <Comanda pedido={pedidoCriado} />
          </div>

          <div className="acoes-empilhadas">
            <button
              className="btn-grande btn-primario"
              onClick={() => imprimir(pedidoCriado)}
            >
              🖨️ Imprimir comanda
            </button>
            <button className="btn-grande" onClick={novoPedido}>
              Lançar novo pedido
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Formulario --------------------------------------------------------
  return (
    <div className="tela">
      <h2 className="tela-titulo">Pedido manual do atendente</h2>
      <p className="nota-pequena">
        Para pedidos que chegam por telefone, balcão ou WhatsApp escrito.
      </p>

      <section className="formulario">
        <label className="campo">
          <span>Origem do pedido</span>
          <select
            value={origem}
            onChange={(e) => setOrigem(e.target.value as OrigemPedido)}
          >
            {ORIGENS_MANUAIS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="categoria">
        <h3 className="categoria-titulo">Produtos</h3>
        {CATEGORIAS_ORDEM.map((categoria) => {
          const produtos = PRODUTOS.filter((p) => p.categoria === categoria)
          if (produtos.length === 0) return null
          return (
            <div key={categoria} className="categoria-manual">
              <div className="categoria-subtitulo">{categoria}</div>
              {produtos.map((produto) => {
                const linha = carrinho[produto.id]
                const qtd = linha?.quantidade ?? 0
                return (
                  <div className="produto" key={produto.id}>
                    <div className="produto-info">
                      <div className="produto-nome">{produto.nome}</div>
                      <div className="produto-preco">
                        {formatarMoeda(produto.preco)}
                      </div>
                    </div>
                    <div className="produto-controles">
                      <div className="stepper">
                        <button
                          type="button"
                          aria-label="Diminuir"
                          onClick={() => alterarQuantidade(produto.id, -1)}
                          disabled={qtd === 0}
                        >
                          −
                        </button>
                        <span className="stepper-valor">{qtd}</span>
                        <button
                          type="button"
                          aria-label="Aumentar"
                          onClick={() => alterarQuantidade(produto.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      {qtd > 0 && (
                        <input
                          className="input-obs"
                          type="text"
                          placeholder="Observação do item"
                          value={linha?.observacao ?? ''}
                          onChange={(e) =>
                            alterarObservacao(produto.id, e.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </section>

      <section className="carrinho">
        <h3 className="categoria-titulo">Resumo</h3>
        {itens.length === 0 ? (
          <p className="nota-pequena">Nenhum item adicionado ainda.</p>
        ) : (
          <ul className="carrinho-itens">
            {itens.map((item) => (
              <li key={item.produtoId}>
                <span>
                  {item.quantidade}x {item.nome}
                </span>
                <span>{formatarMoeda(item.preco * item.quantidade)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="carrinho-total">
          <span>Total</span>
          <span>{formatarMoeda(total)}</span>
        </div>
      </section>

      <section className="formulario">
        <h3 className="categoria-titulo">Dados do cliente</h3>
        <label className="campo">
          <span>Nome do cliente *</span>
          <input
            type="text"
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value)}
            placeholder="Ex: João Souza"
          />
        </label>
        <label className="campo">
          <span>Telefone</span>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </label>
        <label className="campo">
          <span>Endereço</span>
          <input
            type="text"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Rua, número, bairro"
          />
        </label>
        <label className="campo">
          <span>Forma de pagamento</span>
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value as FormaPagamento)}
          >
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="campo">
          <span>Observação geral</span>
          <textarea
            value={observacaoGeral}
            onChange={(e) => setObservacaoGeral(e.target.value)}
            placeholder="Ex: cliente vai retirar no balcão"
            rows={2}
          />
        </label>
      </section>

      {erro && <div className="erro">{erro}</div>}

      <button className="btn-grande btn-primario btn-enviar" onClick={salvar}>
        Salvar e gerar comanda
      </button>
    </div>
  )
}
