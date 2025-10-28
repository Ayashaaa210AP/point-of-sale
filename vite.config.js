// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/point-of-sale/', // ← SESUAIKAN DENGAN NAMA REPO
});