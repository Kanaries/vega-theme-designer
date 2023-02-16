import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	base: '/app/theme-designer/',
	build: {
		outDir: 'dist/app/theme-designer/',
		emptyOutDir: true,
	},
	plugins: [react()],
	server: {
		port: 8000,
	},
});
