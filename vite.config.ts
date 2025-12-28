import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Expose the API key to the client-side code
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
