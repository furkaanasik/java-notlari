import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Build sonrası tamamen statik servis edilebilsin diye göreli yollar.
  base: './',
})
