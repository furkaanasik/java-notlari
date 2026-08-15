import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Build sonrası tamamen statik servis edilebilsin diye göreli yollar.
  base: './',

  build: {
    /*
     * Ana paket ~800 kB. Büyük kısmı `import.meta.glob(..., eager)` ile gömülen
     * markdown içeriğinin kendisi (17 dosya, ~10.700 satır).
     *
     * Bilinçli takas: içerik gömülü olduğu için gezinme anlık, çevrimdışı
     * çalışıyor ve tek dosyalık statik dağıtım mümkün. Ağır kütüphaneler
     * (shiki, mermaid, flexsearch, interaktif bileşenler) zaten dinamik
     * import ile ayrı parçalara bölündü.
     */
    chunkSizeWarningLimit: 900,
  },
})
