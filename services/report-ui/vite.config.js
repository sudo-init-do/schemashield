import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// no special config needed; API base is via env
export default defineConfig({
  plugins: [react()],
})
