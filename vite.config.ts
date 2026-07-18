import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' gera caminhos relativos no build.
// Isso permite publicar tanto na Vercel/Netlify (raiz do dominio)
// quanto no GitHub Pages (sob um subdiretorio) sem alterar configuracao.
export default defineConfig({
  plugins: [react()],
  base: './',
})
