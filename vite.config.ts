import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/test-01/', // ✅ GitHub Pages용 경로 추가
  plugins: [react()],
});
