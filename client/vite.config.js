import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Point dev at the hosted backend by default; set DEV_PROXY_TARGET=http://localhost:5000
  // in client/.env to work against a local server instead.
  const proxyTarget = env.DEV_PROXY_TARGET || 'https://portfolio-qpkw.onrender.com'
  const isRemote = proxyTarget.startsWith('https')

  const proxyOptions = {
    target: proxyTarget,
    changeOrigin: true,
    // Remote backend rejects localhost origins (CORS) — drop the header, the
    // proxy makes it a same-origin request from the browser's perspective.
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        if (isRemote) proxyReq.removeHeader('origin')
      })
    },
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],

    server: {
      proxy: {
        '/api': {
          ...proxyOptions,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/uploads': { ...proxyOptions },
      },
    },

    preview: {
      proxy: {
        '/api': {
          ...proxyOptions,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/uploads': { ...proxyOptions },
      },
    },

  build: {
    // Raise warning threshold to 600kb (Three.js chunks are large by nature)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: {
          // React core — always needed
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Animation — loaded on main page
          'vendor-gsap': ['gsap'],
          'vendor-lenis': ['lenis'],

          // Charts — only used in AdminDashboard (lazy-loaded anyway)
          'vendor-charts': ['recharts'],

          // Email — only used in ContactPopup
          'vendor-email': ['@emailjs/browser'],
        },
      },
    },

    // Minify with esbuild (default, fastest)
    minify: 'esbuild',

    // Generate source maps only in dev
    sourcemap: false,

    // Target modern browsers (reduces polyfill weight)
    target: 'es2020',
  },

  // Optimise deps pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'gsap', 'lenis'],
  },
  }
})
