
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Only expose the specific environment variables needed to the frontend
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Let Rollup decide the best way to split chunks automatically
        // Manual chunks can sometimes force large libraries into a single block that exceeds limits
      },
    },
  }
});
