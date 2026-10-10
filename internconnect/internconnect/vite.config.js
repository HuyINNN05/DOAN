import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: { proxy: { '/api': 'http://localhost:3001' }, watch: { ignored: ['**/.tmp/**'] } },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/]react|node_modules[\\/]react-dom|node_modules[\\/]react-router/ },
            { name: 'charts', test: /node_modules[\\/](chart\.js|react-chartjs-2)/ },
            { name: 'dialogs', test: /node_modules[\\/]sweetalert2/ },
          ],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
