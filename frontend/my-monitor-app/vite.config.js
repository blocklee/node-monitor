import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',  // GitHub Pages 仓库名
  server: {
    port: 5173,
    host: true
  }
})
