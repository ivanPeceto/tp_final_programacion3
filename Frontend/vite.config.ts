// Frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite'; 
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); 
  return {
    plugins: [react()],
    server: {
      port: 5174, 
      host: true, 
      allowedHosts: ['.ngrok-free.app'],
    },
    
    build: {
      outDir: 'dist',
    },
    envPrefix: 'VITE_', 
  };
});