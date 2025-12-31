import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// 確保 Bootstrap 在最前面，這樣你的自定義 CSS 才能覆蓋它
import './assets/all.scss' 
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)