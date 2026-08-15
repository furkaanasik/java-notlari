import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root bulunamadı')

createRoot(container).render(
  <StrictMode>
    {/*
      Dosya seçimi yol yerine `?doc=` sorgu parametresinde tutulur.
      Böylece URL paylaşılabilir ve yenilenebilir hâle gelirken, sunucu
      tarafında yönlendirme kuralı gerekmez — çıktı saf statik kalır.
      `#anchor` da başlıklara serbest kalır.
    */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
