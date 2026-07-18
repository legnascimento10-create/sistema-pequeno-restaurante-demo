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

// De onde o pedido chegou (o Cardapio tem tela propria para o cliente).
const ORIGENS_MANUAIS: OrigemPedido[] = ORIGENS.filter((o) => o !== 'Cardápio')

const ICONE_ORIGEM: Record<string, string> = {
  Telefone: '📞',
  WhatsApp: '💬',
  Balcão: '🧍',
}

// Tela de lancamento de pedido, em passos simples, para quem esta acostumada
// a anotar no papel: 1) de onde veio  2) o que pediu  3) dados e salvar.
export default function PedidoManual({ aoCriarPedido, imprimir }: Props) {
  const [passo, setPasso] = useState<1 | 2 | 3>(1)
  const [origem, setOrigem] = useState<OrigemPedido | null>(null)
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
  const quantidadeItens = itens.reduce((s, i) => s + i.quantidade, 0)

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

  function escolherOrigem(o: OrigemPedido) {
    setOrigem(o)
    setPasso(2)
  }

  function irParaDados() {
    setErro('')
    if (itens.length === 0) {
      setErro('Escolha ao menos um item do cardápio.')
      return
    }
    setPasso(3)
  }

  function salvar() {
    setErro('')
    if (!clienteNome.trim()) {
      setErro('Escreva o nome do cliente.')
      return
    }
    const pedido = criarPedido({
      origem: origem ?? 'Telefone',
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
    setPasso(1)
    setOrigem(null)
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
            Pedido <strong>#{pedidoCriado.numero}</strong> — chegou por{' '}
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
              Novo pedido
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- Passos ------------------------------------------------------------
  return (
    <div className="tela">
      <div className="passos-indicador">Passo {passo} de 3</div>

      {/* PASSO 1: de onde veio o pedido */}
      {passo === 1 && (
        <section className="passo">
          <h2 className="passo-pergunta">De onde veio o pedido?</h2>
          <div className="origem-botoes">
            {ORIGENS_MANUAIS.map((o) => (
              <button
                key={o}
                className="btn-origem"
                onClick={() => escolherOrigem(o)}
              >
                <span className="btn-origem-icone">{ICONE_ORIGEM[o]}</span>
                {o}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* PASSO 2: o que o cliente pediu */}
      {passo === 2 && (
        <section className="passo">
          <h2 className="passo-pergunta">O que o cliente pediu?</h2>
          <p className="nota-pequena">
            Toque no + para somar. Pedido de {origem}.
          </p>

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
                            aria-label="Tirar um"
                            onClick={() => alterarQuantidade(produto.id, -1)}
                            disabled={qtd === 0}
                          >
                            −
                          </button>
                          <span className="stepper-valor">{qtd}</span>
                          <button
                            type="button"
                            aria-label="Somar um"
                            onClick={() => alterarQuantidade(produto.id, 1)}
                          >
                            +
                          </button>
                        </div>
                        {qtd > 0 && (
                          <input
                            className="input-obs"
                            type="text"
                            placeholder="Alguma observação? Ex: sem cebola"
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

          {erro && <div className="erro">{erro}</div>}

          <div className="barra-passo">
            <button className="btn-secundario" onClick={() => setPasso(1)}>
              ← Voltar
            </button>
            <div className="barra-passo-total">
              {quantidadeItens > 0 && (
                <>
                  {quantidadeItens} {quantidadeItens === 1 ? 'item' : 'itens'} ·{' '}
                  <strong>{formatarMoeda(total)}</strong>
                </>
              )}
            </div>
            <button className="btn-primario btn-continuar" onClick={irParaDados}>
              Continuar →
            </button>
          </div>
        </section>
      )}

      {/* PASSO 3: dados do cliente e salvar */}
      {passo === 3 && (
        <section className="passo">
          <h2 className="passo-pergunta">Dados do cliente</h2>

          <div className="resumo-simples">
            <div className="resumo-simples-titulo">
              Pedido de {origem} · {formatarMoeda(total)}
            </div>
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
          </div>

          <div className="formulario">
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
                onChange={(e) =>
                  setFormaPagamento(e.target.value as FormaPagamento)
                }
              >
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo">
              <span>Observação do pedido</span>
              <textarea
                value={observacaoGeral}
                onChange={(e) => setObservacaoGeral(e.target.value)}
                placeholder="Ex: cliente vai retirar no balcão"
                rows={2}
              />
            </label>
          </div>

          {erro && <div className="erro">{erro}</div>}

          <div className="barra-passo">
            <button className="btn-secundario" onClick={() => setPasso(2)}>
              ← Voltar
            </button>
            <button className="btn-primario btn-continuar" onClick={salvar}>
              Salvar pedido
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
