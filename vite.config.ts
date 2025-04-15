import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		lib: {
			entry: path.resolve(__dirname, 'src/main.tsx'),
			name: 'MagicSlider',
			formats: ['es', 'umd'],
			fileName: format => `index.${format === 'es' ? 'esm' : format}.js`,
		},
		rollupOptions: {
			// Externalize dependencies that shouldn't be bundled
			external: ['react', 'react-dom', '@react-spring/web', 'tailwind-merge'],
			output: {
				// Global variables to use in UMD build for externalized deps
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					'@react-spring/web': 'ReactSpring',
					'tailwind-merge': 'twMerge',
				},
			},
		},
		cssCodeSplit: false,
		cssMinify: true,
	},
	// For development with the demo app
	root: process.env.NODE_ENV === 'development' ? 'demo' : undefined,
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
})
