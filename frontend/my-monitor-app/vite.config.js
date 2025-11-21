import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/node-monitor/',  // 替换成你的仓库名
  server: {
    port: 5173,
    host: true
  }
})
