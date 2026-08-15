import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    /*
     * Çevrimdışı çalışma. Bir referans dokümanı en çok "internet yokken lazım
     * olan" şeydir; içerik zaten pakete gömülü olduğu için önbelleğe almak
     * tüm siteyi kullanılabilir kılıyor.
     *
     * autoUpdate: yeni sürüm yayınlandığında sessizce güncellenir; kullanıcıya
     * "yenile" diye sormak bir dokümanda gereksiz sürtünme.
     */
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        /*
         * Ön-önbelleğe yalnızca çekirdek girer: sayfa, stil ve ana paket.
         * Hepsini almak 14 MB'a çıkıyordu — mermaid tek başına 400'den fazla
         * küçük parça üretiyor ve bunların çoğu hiç kullanılmıyor.
         */
        globPatterns: ['index.html', 'assets/index-*.{js,css}', '**/*.{svg,png,woff2}'],
        /* Kalan parçalar ilk kullanıldıklarında önbelleğe alınır. */
        runtimeCaching: [
          {
            urlPattern: ({ sameOrigin, request }) =>
              sameOrigin && (request.destination === 'script' || request.destination === 'style'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'chunks',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'Java Referans',
        short_name: 'Java Ref',
        description: 'Java, prensipler, test, refactoring ve design pattern notları',
        lang: 'tr',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#131316',
        theme_color: '#131316',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
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
