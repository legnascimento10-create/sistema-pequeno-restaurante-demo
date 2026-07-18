import { useMemo, useState } from 'react'
import { PRODUTOS, CATEGORIAS_ORDEM } from '../data/products'
import { FORMAS_PAGAMENTO } from '../types'
import type { FormaPagamento, ItemPedido, Pedido } from '../types'
import { criarPedido } from '../utils/storage'
import { calcularTotal, formatarMoeda, montarMensagemWhatsApp } from '../utils/format'
import Comanda from './Comanda'

interface Props {
  aoCriarPedido: (pedido: Pedido) => void
}

interface LinhaCarrinho {
  quantidade: number
  observacao: string
}

export default function Cardapio({ aoCriarPedido }: Props) {
  const [carrinho, setCarrinho] = useState<Record<string, LinhaCarrinho>>({})
  const [clienteNome, setClienteNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('Dinheiro')
  const [observacaoGeral, setObservacaoGeral] = useState('')
  const [erro, setErro] = useState('')
  const [pedidoCriado, setPedidoCriado] = useState<Pedido | null>(null)

  // Monta os itens selecionados a partir do carrinho.
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

  function enviarPedido() {
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
      origem: 'Cardápio',
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
    setCarrinho({})
    setClienteNome('')
    setTelefone('')
    setEndereco('')
    setFormaPagamento('Dinheiro')
    setObservacaoGeral('')
    setErro('')
    setPedidoCriado(null)
  }

  // --- Tela de confirmacao apos enviar -----------------------------------
  if (pedidoCriado) {
    const mensagem = montarMensagemWhatsApp(pedidoCriado)
    return (
      <div className="tela">
        <div className="confirmacao">
          <div className="confirmacao-check">✅</div>
          <h2>Pedido enviado!</h2>
          <p>
            Seu pedido foi registrado com o número{' '}
            <strong>#{pedidoCriado.numero}</strong>.
          </p>

          <div className="bloco-whatsapp">
            <div className="bloco-whatsapp-titulo">
              Mensagem de WhatsApp (demonstração)
            </div>
            <pre className="whatsapp-preview">{mensagem}</pre>
            <p className="nota-pequena">
              Nesta demonstração a mensagem não é enviada automaticamente.
            </p>
          </div>

          <div className="confirmacao-comanda">
            <Comanda pedido={pedidoCriado} />
          </div>

          <button className="btn-grande btn-primario" onClick={novoPedido}>
            Fazer novo pedido
          </button>
        </div>
      </div>
    )
  }

  // --- Cardapio ----------------------------------------------------------
  return (
    <div className="tela">
      <h2 className="tela-titulo">Cardápio digital</h2>

      {CATEGORIAS_ORDEM.map((categoria) => {
        const produtos = PRODUTOS.filter((p) => p.categoria === categoria)
        if (produtos.length === 0) return null
        return (
          <section key={categoria} className="categoria">
            <h3 className="categoria-titulo">{categoria}</h3>
            <div className="produtos">
              {produtos.map((produto) => {
                const linha = carrinho[produto.id]
                const qtd = linha?.quantidade ?? 0
                return (
                  <div className="produto" key={produto.id}>
                    <div className="produto-info">
                      <div className="produto-nome">{produto.nome}</div>
                      {produto.descricao && (
                        <div className="produto-desc">{produto.descricao}</div>
                      )}
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
          </section>
        )
      })}

      {/* Carrinho */}
      <section className="carrinho">
        <h3 className="categoria-titulo">Seu pedido</h3>
        {itens.length === 0 ? (
          <p className="nota-pequena">Nenhum item selecionado ainda.</p>
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

      {/* Dados do cliente */}
      <section className="formulario">
        <h3 className="categoria-titulo">Seus dados</h3>
        <label className="campo">
          <span>Nome do cliente *</span>
          <input
            type="text"
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value)}
            placeholder="Ex: Maria Silva"
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
            placeholder="Ex: sem cebola, entregar no portão"
            rows={2}
          />
        </label>
      </section>

      {erro && <div className="erro">{erro}</div>}

      <button className="btn-grande btn-primario btn-enviar" onClick={enviarPedido}>
        Enviar pedido
      </button>
    </div>
  )
}
