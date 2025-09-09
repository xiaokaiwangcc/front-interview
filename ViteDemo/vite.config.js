import { build, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log('process.env', process.env.CLIENT_VERSION)
export default defineConfig({
    plugins: [
        react()
    ],
    server: {
        port: 5173
    },
    resolve: {
        alias: {
            '@': '/src'
        }
    },
    build: {
        minify: 'esbuild'
    }
})