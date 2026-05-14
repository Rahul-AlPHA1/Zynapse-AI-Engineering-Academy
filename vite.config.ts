import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react':    ['react', 'react-dom'],
            'vendor-motion':   ['motion'],
            'vendor-monaco':   ['@monaco-editor/react'],
            'vendor-flow':     ['@xyflow/react'],
            'vendor-charts':   ['recharts'],
            'vendor-markdown': ['react-markdown', 'remark-gfm'],
            'vendor-pdf':      ['pdfjs-dist', 'mammoth'],
          },
        },
      },
    },
  };
});
