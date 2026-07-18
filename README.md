# Demo Web — Sistema Pequeno Restaurante

Demonstração web (SPA estática) do Sistema Pequeno Restaurante, feita para
apresentação à primeira cliente. Mostra o conceito: todo pedido (cardápio,
telefone, balcão ou WhatsApp) entra organizado no sistema e pode gerar uma
comanda para a cozinha.

> **Demonstração.** A integração real com impressora será validada após teste
> no restaurante. Nesta demo a impressão é simulada com `window.print()`.

## O que é (e o que não é)

- **É** uma aplicação React + Vite + TypeScript, 100% front-end.
- **Não tem** backend, banco de dados, API externa, PrintNode real nem credenciais.
- Os pedidos são salvos apenas no **localStorage do navegador** onde a demo é
  aberta. Ao abrir em outro computador/celular, a lista começa vazia — isso é
  esperado para uma demonstração.

## Telas

1. **Início** — menu com as quatro áreas.
2. **Cardápio digital** — cliente monta o pedido e envia (gera número, comanda e
   uma mensagem de WhatsApp de exemplo).
3. **Pedido manual** — atendente lança pedidos que chegam por telefone, balcão ou
   WhatsApp escrito.
4. **Painel de pedidos** — lista tudo em ordem de chegada, permite mudar status,
   ver/imprimir/reimprimir comanda e limpar os pedidos da demo.
5. **Cozinha / Impressão** — mostra só os pedidos em produção (Novo, Em preparo,
   Pronto) e o botão de impressão.

A **comanda** tem layout no formato de bobina térmica (~80 mm).

## Rodar localmente

Pré-requisito: Node.js 18+ instalado.

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (ex.: `http://localhost:5173`).

## Gerar build de produção

```bash
npm run build
```

O resultado fica na pasta `dist/`.

## Testar o build localmente

```bash
npm run preview
```

## Publicar na Vercel (recomendado)

A demo é estática, então o deploy é simples. **Não** existem credenciais nem
variáveis de ambiente para configurar.

### Opção A — via GitHub + Vercel (recomendada)

1. Crie (ou use) um repositório no GitHub e envie o projeto.
   - Se este `app-demo-web/` estiver dentro de um repositório maior, tudo bem:
     basta apontar o **Root Directory** para `app-demo-web` no passo 3.
2. Em [vercel.com](https://vercel.com), clique em **Add New… → Project** e
   importe o repositório.
3. Configure:
   - **Root Directory:** `app-demo-web` (se o projeto não estiver na raiz).
   - **Framework Preset:** Vite (detectado automaticamente).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Clique em **Deploy**. Ao terminar, a Vercel gera um link público
   (ex.: `https://sua-demo.vercel.app`) para abrir no computador ou celular.

### Opção B — via Vercel CLI (opcional)

> Só use se a CLI já estiver instalada e autenticada. **Não** faça deploy sem
> intenção clara.

```bash
# dentro da pasta app-demo-web
npx vercel        # cria o projeto (preview)
npx vercel --prod # publica em produção
```

## Publicar na Netlify (alternativa)

1. Em [netlify.com](https://netlify.com): **Add new site → Import an existing project**.
2. **Base directory:** `app-demo-web` (se aplicável).
3. **Build command:** `npm run build`
4. **Publish directory:** `dist` (ou `app-demo-web/dist`).

O arquivo `netlify.toml` já traz esses valores.

## Publicar no GitHub Pages (se necessário)

O `vite.config.ts` usa `base: './'` (caminhos relativos), então o build funciona
em subdiretórios como os do GitHub Pages.

1. `npm run build`
2. Publique o conteúdo da pasta `dist/` no branch/pasta que o GitHub Pages serve
   (por exemplo, usando a action `actions/deploy-pages` ou publicando `dist` no
   branch `gh-pages`).

## Segurança / privacidade

- Nenhum dado é enviado para servidores. Tudo fica no navegador.
- Nenhuma impressora real é acionada — apenas a caixa de impressão do navegador.
